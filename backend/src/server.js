const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { evaluateRules, applyRuleToTransaction, bulkRecategorize, testRule } = require('./services/ruleEngine');

const app = express();
const PORT = process.env.PORT || 5001;
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// ============ CATEGORIES ENDPOINTS ============

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { rules: true, transactions: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get category by ID
app.get('/api/categories/:id', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: req.params.id },
      include: {
        rules: {
          orderBy: { priority: 'desc' }
        },
        _count: {
          select: { transactions: true }
        }
      }
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create category
app.post('/api/categories', async (req, res) => {
  try {
    const { name, color = '#059669', icon = '📁' } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const category = await prisma.category.create({
      data: {
        name,
        color,
        icon,
        isSystem: false
      }
    });

    res.status(201).json(category);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update category
app.put('/api/categories/:id', async (req, res) => {
  try {
    const { name, color, icon } = req.body;
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(color && { color }),
        ...(icon && { icon })
      }
    });
    res.json(category);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Category name already exists' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete category
app.delete('/api/categories/:id', async (req, res) => {
  try {
    await prisma.category.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(500).json({ error: error.message });
  }
});

// ============ RULES ENDPOINTS ============

// Get all rules with optional filters
app.get('/api/rules', async (req, res) => {
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
app.get('/api/categories/:categoryId/rules', async (req, res) => {
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
app.post('/api/rules', async (req, res) => {
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
app.put('/api/rules/:id', async (req, res) => {
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
app.patch('/api/rules/:id/toggle', async (req, res) => {
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
app.delete('/api/rules/:id', async (req, res) => {
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
app.post('/api/rules/test', async (req, res) => {
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

// ============ TRANSACTIONS ENDPOINTS ============

// Get all transactions
app.get('/api/transactions', async (req, res) => {
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
app.post('/api/transactions', async (req, res) => {
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
app.put('/api/transactions/:id', async (req, res) => {
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
app.delete('/api/transactions/:id', async (req, res) => {
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
app.post('/api/transactions/recategorize', async (req, res) => {
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


// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

