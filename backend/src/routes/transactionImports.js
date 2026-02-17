const express = require('express');

/**
 * Creates and configures the transaction imports router
 * @param {import('@prisma/client').PrismaClient} prisma - Prisma client instance
 * @returns {express.Router} Configured router
 */
module.exports = (prisma) => {
  const router = express.Router();

  // Get all transaction imports
  router.get('/transaction-imports', async (req, res) => {
    try {
      const { skip = 0, take = 50, sortBy = 'createdAt', sortOrder = 'desc', status } = req.query;

      const where = {};
      if (status) {
        where.status = status;
      }

      const [imports, total] = await Promise.all([
        prisma.transactionImport.findMany({
          where,
          include: { 
            _count: {
              select: { transactions: true }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip: parseInt(skip),
          take: parseInt(take)
        }),
        prisma.transactionImport.count({ where })
      ]);

      res.json({
        imports,
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

  // Get single transaction import
  router.get('/transaction-imports/:id', async (req, res) => {
    try {
      const transactionImport = await prisma.transactionImport.findUnique({
        where: { id: req.params.id },
        include: {
          _count: {
            select: { transactions: true }
          }
        }
      });

      if (!transactionImport) {
        return res.status(404).json({ error: 'Transaction import not found' });
      }

      res.json(transactionImport);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create transaction import
  router.post('/transaction-imports', async (req, res) => {
    try {
      const { filename, fileType, totalRows, validRows, columnMapping } = req.body;

      if (!filename || !fileType || totalRows === undefined || validRows === undefined) {
        return res.status(400).json({
          error: 'Missing required fields: filename, fileType, totalRows, validRows'
        });
      }

      const transactionImport = await prisma.transactionImport.create({
        data: {
          filename,
          fileType,
          status: 'pending',
          totalRows: parseInt(totalRows),
          validRows: parseInt(validRows),
          columnMapping: columnMapping ? JSON.stringify(columnMapping) : null
        }
      });

      res.status(201).json(transactionImport);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update transaction import
  router.patch('/transaction-imports/:id', async (req, res) => {
    try {
      const { 
        status, 
        importedCount, 
        skippedCount, 
        errorCount, 
        errorDetails,
        completedAt
      } = req.body;

      const updateData = {};
      if (status) updateData.status = status;
      if (importedCount !== undefined) updateData.importedCount = parseInt(importedCount);
      if (skippedCount !== undefined) updateData.skippedCount = parseInt(skippedCount);
      if (errorCount !== undefined) updateData.errorCount = parseInt(errorCount);
      if (errorDetails) updateData.errorDetails = JSON.stringify(errorDetails);
      if (completedAt) updateData.completedAt = new Date(completedAt);

      const transactionImport = await prisma.transactionImport.update({
        where: { id: req.params.id },
        data: updateData,
        include: {
          _count: {
            select: { transactions: true }
          }
        }
      });

      res.json(transactionImport);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete transaction import
  router.delete('/transaction-imports/:id', async (req, res) => {
    try {
      const { deleteTransactions } = req.query;

      // If deleteTransactions is true, delete associated transactions first
      if (deleteTransactions === 'true') {
        await prisma.transaction.deleteMany({
          where: { transactionImportId: req.params.id }
        });
      } else {
        // Otherwise, just unlink the transactions
        await prisma.transaction.updateMany({
          where: { transactionImportId: req.params.id },
          data: { transactionImportId: null }
        });
      }

      await prisma.transactionImport.delete({
        where: { id: req.params.id }
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
