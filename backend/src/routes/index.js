const categoriesRouter = require('./categories');
const rulesRouter = require('./rules');
const transactionsRouter = require('./transactions');

/**
 * Initializes and returns all application routes
 * @param {import('@prisma/client').PrismaClient} prisma - Prisma client instance
 * @returns {Object} Object containing initialized routers
 */
module.exports = (prisma) => {
  return {
    categories: categoriesRouter(prisma),
    rules: rulesRouter(prisma),
    transactions: transactionsRouter(prisma)
  };
};
