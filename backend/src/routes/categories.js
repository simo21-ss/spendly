const express = require('express');

/**
 * Creates and configures the categories router
 * @param {import('@prisma/client').PrismaClient} prisma - Prisma client instance
 * @returns {express.Router} Configured router
 */
module.exports = (prisma) => {
  const router = express.Router();

  // Get all categories
  router.get('/categories', async (req, res) => {
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
  router.get('/categories/:id', async (req, res) => {
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
  router.post('/categories', async (req, res) => {
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
  router.put('/categories/:id', async (req, res) => {
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
  router.delete('/categories/:id', async (req, res) => {
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

  return router;
};
