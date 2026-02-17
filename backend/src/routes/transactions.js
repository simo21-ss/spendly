const express = require('express');
const { evaluateRules, bulkRecategorize } = require('../services/ruleEngine');

/**
 * Creates and configures the transactions router
 * @param {import('@prisma/client').PrismaClient} prisma - Prisma client instance
 * @returns {express.Router} Configured router
 */
module.exports = (prisma) => {
  const router = express.Router();

  // Get all transactions
  router.get('/transactions', async (req, res) => {
    try {
      const { categoryId, skip = 0, take = 50, sortBy = 'date', sortOrder = 'desc' } = req.query;

      const where = {};
      if (categoryId) {
        const categoryIds = String(categoryId)
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean);
        if (categoryIds.length > 1) {
          where.categoryId = { in: categoryIds };
        } else if (categoryIds.length === 1) {
          where.categoryId = categoryIds[0];
        }
      }

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: { 
            category: true,
            transactionImport: true
          },
          orderBy: { [sortBy]: sortOrder },
          skip: parseInt(skip),
          take: parseInt(take)
        }),
        prisma.transaction.count({ where })
      ]);

      res.json({
        transactions,
        pagination: {
          total,
          skip: parseInt(skip),
          take: parseInt(take),
          pages: Math.ceil(total / parseInt(take))
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create transaction
  router.post('/transactions', async (req, res) => {
    try {
      const { date, description, amount, merchant, notes, categoryId } = req.body;

      if (!date || !description || amount === undefined) {
        return res.status(400).json({ 
          error: 'Missing required fields: date, description, amount' 
        });
      }

      // If no categoryId provided, try to auto-categorize with rules
      let finalCategoryId = categoryId;
      if (!finalCategoryId) {
        const transaction = { description, merchant };
        const match = await evaluateRules(prisma, transaction);
        if (match) {
          finalCategoryId = match.categoryId;
        }
      }

      const newTransaction = await prisma.transaction.create({
        data: {
          date: new Date(date),
          description,
          amount: parseFloat(amount),
          merchant,
          notes,
          categoryId: finalCategoryId
        },
        include: { category: true }
      });

      res.status(201).json(newTransaction);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update transaction
  router.put('/transactions/:id', async (req, res) => {
    try {
      const { date, description, amount, merchant, notes, categoryId } = req.body;

      const transaction = await prisma.transaction.update({
        where: { id: req.params.id },
        data: {
          ...(date && { date: new Date(date) }),
          ...(description && { description }),
          ...(amount !== undefined && { amount: parseFloat(amount) }),
          ...(merchant && { merchant }),
          ...(notes && { notes }),
          ...(categoryId !== undefined && { categoryId })
        },
        include: { category: true }
      });

      res.json(transaction);
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Delete transaction
  router.delete('/transactions/:id', async (req, res) => {
    try {
      await prisma.transaction.delete({
        where: { id: req.params.id }
      });
      res.json({ success: true });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk import transactions
  router.post('/transactions/bulk', async (req, res) => {
    try {
      const { transactionImportId, transactions = [] } = req.body;

      if (!transactionImportId) {
        return res.status(400).json({ 
          error: 'transactionImportId is required. Create a TransactionImport record first.' 
        });
      }

      if (!Array.isArray(transactions) || transactions.length === 0) {
        return res.status(400).json({ error: 'transactions array is required and must not be empty' });
      }

      // Update import status to processing
      await prisma.transactionImport.update({
        where: { id: transactionImportId },
        data: { status: 'processing' }
      });

      const validTransactions = [];
      const errors = [];
      const duplicates = [];

      // Process each transaction
      for (let i = 0; i < transactions.length; i++) {
        const txn = transactions[i];
        
        // Validate required fields
        if (!txn.date || !txn.description || txn.amount === undefined) {
          errors.push({
            row: i + 1,
            error: 'Missing required fields: date, description, or amount',
            data: txn
          });
          continue;
        }

        try {
          // Parse date and amount
          const parsedDate = new Date(txn.date);
          const parsedAmount = parseFloat(txn.amount);

          if (isNaN(parsedDate.getTime())) {
            errors.push({
              row: i + 1,
              error: 'Invalid date format',
              data: txn
            });
            continue;
          }

          if (isNaN(parsedAmount)) {
            errors.push({
              row: i + 1,
              error: 'Invalid amount format',
              data: txn
            });
            continue;
          }

          // Check for duplicates in database
          const existingTransaction = await prisma.transaction.findFirst({
            where: {
              date: parsedDate,
              description: txn.description,
              amount: parsedAmount
            }
          });

          if (existingTransaction) {
            duplicates.push({
              row: i + 1,
              existing: existingTransaction,
              new: txn
            });
            continue;
          }

          // Auto-categorize if no categoryId provided
          let categoryId = txn.categoryId;
          if (!categoryId) {
            const match = await evaluateRules(prisma, {
              description: txn.description,
              merchant: txn.merchant
            });
            if (match) {
              categoryId = match.categoryId;
            }
          }

          validTransactions.push({
            date: parsedDate,
            description: txn.description,
            amount: parsedAmount,
            merchant: txn.merchant || null,
            notes: txn.notes || null,
            categoryId: categoryId || null,
            transactionImportId
          });
        } catch (error) {
          errors.push({
            row: i + 1,
            error: error.message,
            data: txn
          });
        }
      }

      // Import valid transactions
      let importedCount = 0;
      if (validTransactions.length > 0) {
        const result = await prisma.transaction.createMany({
          data: validTransactions
        });
        importedCount = result.count;
      }

      // Determine final status
      let finalStatus = 'completed';
      if (errors.length > 0 && importedCount === 0) {
        finalStatus = 'failed';
      } else if (errors.length > 0) {
        finalStatus = 'partial';
      }

      // Update import record with results
      await prisma.transactionImport.update({
        where: { id: transactionImportId },
        data: {
          status: finalStatus,
          importedCount,
          skippedCount: duplicates.length,
          errorCount: errors.length,
          errorDetails: errors.length > 0 ? JSON.stringify(errors) : null,
          completedAt: new Date()
        }
      });

      res.json({
        success: true,
        transactionImportId,
        imported: importedCount,
        skipped: duplicates.length,
        errors: errors.length,
        duplicates,
        errorDetails: errors
      });
    } catch (error) {
      // Update import status to failed
      if (req.body.transactionImportId) {
        await prisma.transactionImport.update({
          where: { id: req.body.transactionImportId },
          data: { 
            status: 'failed',
            errorDetails: JSON.stringify([{ error: error.message }]),
            completedAt: new Date()
          }
        }).catch(() => {}); // Ignore errors in error handler
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk recategorize transactions
  router.post('/transactions/recategorize', async (req, res) => {
    try {
      const { transactionIds = [] } = req.body;

      if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
        return res.status(400).json({ error: 'transactionIds array is required' });
      }

      const results = await bulkRecategorize(prisma, transactionIds);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
