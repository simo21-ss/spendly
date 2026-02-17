const express = require('express');
const { testRule } = require('../services/ruleEngine');

/**
 * Creates and configures the rules router
 * @param {import('@prisma/client').PrismaClient} prisma - Prisma client instance
 * @returns {express.Router} Configured router
 */
module.exports = (prisma) => {
  const router = express.Router();

  // Get all rules with optional filters
  router.get('/rules', async (req, res) => {
    try {
      const { isSystemRule, isActive, categoryId, skip = 0, take = 100 } = req.query;

      const where = {};
      if (isSystemRule !== undefined) {
        where.isSystemRule = isSystemRule === 'true';
      }
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }
      if (categoryId) {
        where.categoryId = categoryId;
      }

      const [rules, total] = await Promise.all([
        prisma.rule.findMany({
          where,
          include: { category: true },
          orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
          skip: parseInt(skip),
          take: parseInt(take)
        }),
        prisma.rule.count({ where })
      ]);

      res.json({
        rules,
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

  // Get rules for specific category
  router.get('/categories/:categoryId/rules', async (req, res) => {
    try {
      const rules = await prisma.rule.findMany({
        where: { categoryId: req.params.categoryId },
        orderBy: { priority: 'desc' }
      });
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new rule
  router.post('/rules', async (req, res) => {
    try {
      const { name, categoryId, field, operator, value, priority, isActive = true } = req.body;

      // Validation
      if (!name || !categoryId || !field || !operator || !value) {
        return res.status(400).json({ 
          error: 'Missing required fields: name, categoryId, field, operator, value' 
        });
      }

      if (!['description', 'merchant'].includes(field)) {
        return res.status(400).json({ error: 'Field must be "description" or "merchant"' });
      }

      if (!['contains', 'equals', 'startsWith'].includes(operator)) {
        return res.status(400).json({ error: 'Operator must be "contains", "equals", or "startsWith"' });
      }

      // Check category exists
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      const rule = await prisma.rule.create({
        data: {
          name,
          categoryId,
          field,
          operator,
          value: value.toLowerCase(),
          priority: priority || 1000,
          isActive,
          isSystemRule: false
        },
        include: { category: true }
      });

      res.status(201).json(rule);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update rule
  router.put('/rules/:id', async (req, res) => {
    try {
      const { name, categoryId, field, operator, value, priority, isActive } = req.body;

      // Validation if provided
      if (field && !['description', 'merchant'].includes(field)) {
        return res.status(400).json({ error: 'Field must be "description" or "merchant"' });
      }

      if (operator && !['contains', 'equals', 'startsWith'].includes(operator)) {
        return res.status(400).json({ error: 'Operator must be "contains", "equals", or "startsWith"' });
      }

      // Check category exists if provided
      if (categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: categoryId }
        });
        if (!category) {
          return res.status(404).json({ error: 'Category not found' });
        }
      }

      const rule = await prisma.rule.update({
        where: { id: req.params.id },
        data: {
          ...(name && { name }),
          ...(categoryId && { categoryId }),
          ...(field && { field }),
          ...(operator && { operator }),
          ...(value && { value: value.toLowerCase() }),
          ...(priority !== undefined && { priority }),
          ...(isActive !== undefined && { isActive })
        },
        include: { category: true }
      });

      res.json(rule);
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Rule not found' });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Toggle rule active/inactive
  router.patch('/rules/:id/toggle', async (req, res) => {
    try {
      const rule = await prisma.rule.findUnique({
        where: { id: req.params.id }
      });

      if (!rule) {
        return res.status(404).json({ error: 'Rule not found' });
      }

      const updated = await prisma.rule.update({
        where: { id: req.params.id },
        data: { isActive: !rule.isActive },
        include: { category: true }
      });

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete rule
  router.delete('/rules/:id', async (req, res) => {
    try {
      await prisma.rule.delete({
        where: { id: req.params.id }
      });
      res.json({ success: true });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Rule not found' });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Test a rule
  router.post('/rules/test', async (req, res) => {
    try {
      const { description, merchant, field, operator, value } = req.body;

      if (!field || !operator || !value) {
        return res.status(400).json({ 
          error: 'Missing required fields: field, operator, value' 
        });
      }

      const transaction = { description, merchant };
      const rule = { field, operator, value };
      const result = testRule(transaction, rule);

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
