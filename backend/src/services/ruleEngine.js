// Match function based on operator
function matchValue(fieldValue, ruleValue, operator) {
  if (!fieldValue) return false;

  const field = fieldValue.toLowerCase();
  const value = ruleValue.toLowerCase();

  switch (operator) {
    case 'contains':
      return field.includes(value);
    case 'equals':
      return field === value;
    case 'startsWith':
      return field.startsWith(value);
    default:
      return false;
  }
}

/**
 * Evaluate rules against a transaction to find matching category
 * @param {Object} prismaClient - Prisma client instance
 * @param {Object} transaction - Transaction object with description and merchant fields
 * @returns {Promise<Object|null>} - Matching rule with category, or null if no match
 */
async function evaluateRules(prismaClient, transaction) {
  // Get all active rules sorted by priority (highest first)
  const rules = await prismaClient.rule.findMany({
    where: {
      isActive: true,
    },
    include: {
      category: true,
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'asc' },
    ],
  });

  // Iterate through rules and find first match
  for (const rule of rules) {
    let fieldValue = '';

    if (rule.field === 'description') {
      fieldValue = transaction.description || '';
    } else if (rule.field === 'merchant') {
      fieldValue = transaction.merchant || '';
    }

    if (matchValue(fieldValue, rule.value, rule.operator)) {
      return {
        rule,
        categoryId: rule.categoryId,
        category: rule.category,
      };
    }
  }

  return null;
}

/**
 * Apply categorization rules to a single transaction
 * @param {Object} prismaClient - Prisma client instance
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} - Updated transaction
 */
async function applyRuleToTransaction(prismaClient, transactionId) {
  const transaction = await prismaClient.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    throw new Error(`Transaction not found: ${transactionId}`);
  }

  // Evaluate rules
  const matches = await evaluateRules(prismaClient, transaction);

  if (matches) {
    // Update transaction with matched category
    return await prismaClient.transaction.update({
      where: { id: transactionId },
      data: { categoryId: matches.categoryId },
      include: { category: true },
    });
  }

  return transaction;
}

/**
 * Apply rules to multiple transactions
 * @param {Object} prismaClient - Prisma client instance
 * @param {string[]} transactionIds - Array of transaction IDs
 * @returns {Promise<Object>} - Summary of operations
 */
async function bulkRecategorize(prismaClient, transactionIds) {
  const results = {
    total: transactionIds.length,
    updated: 0,
    failed: 0,
    errors: [],
  };

  for (const transactionId of transactionIds) {
    try {
      const transaction = await prismaClient.transaction.findUnique({
        where: { id: transactionId },
      });

      if (!transaction) {
        results.failed++;
        results.errors.push({
          transactionId,
          error: 'Transaction not found',
        });
        continue;
      }

      // Evaluate rules
      const matches = await evaluateRules(prismaClient, transaction);

      if (matches) {
        await prismaClient.transaction.update({
          where: { id: transactionId },
          data: { categoryId: matches.categoryId },
        });
        results.updated++;
      }
    } catch (error) {
      results.failed++;
      results.errors.push({
        transactionId,
        error: error.message,
      });
    }
  }

  return results;
}

/**
 * Test a rule without applying it
 * @param {Object} transaction - Transaction object
 * @param {Object} rule - Rule object with field, operator, value
 * @returns {Object} - Test result
 */
function testRule(transaction, rule) {
  let fieldValue = '';
  const testField = rule.field || 'description';

  if (testField === 'description') {
    fieldValue = transaction.description || '';
  } else if (testField === 'merchant') {
    fieldValue = transaction.merchant || '';
  }

  const matches = matchValue(fieldValue, rule.value, rule.operator || 'contains');

  return {
    matches,
    field: testField,
    fieldValue,
    ruleValue: rule.value,
    operator: rule.operator || 'contains',
  };
}

module.exports = {
  evaluateRules,
  applyRuleToTransaction,
  bulkRecategorize,
  testRule,
};
