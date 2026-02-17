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
        where.categoryId = categoryId;
      }

      const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
          where,
          include: { category: true },
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
