const API_BASE_URL = 'http://localhost:5001/api';

// ============ HEALTH CHECK ============
export const testHealthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error('API health check failed');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error testing API:', error);
    throw error;
  }
};

// ============ CATEGORIES ============
export async function getCategories() {
  const response = await fetch(`${API_BASE_URL}/categories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
}

export async function getCategory(id) {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`);
  if (!response.ok) throw new Error('Failed to fetch category');
  return response.json();
}

export async function createCategory(data) {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create category');
  return response.json();
}

export async function updateCategory(id, data) {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update category');
  return response.json();
}

export async function deleteCategory(id) {
  const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete category');
  return response.json();
}

// ============ RULES ============
export async function getRules(filters = {}) {
  const params = new URLSearchParams();
  if (filters.isSystemRule !== undefined) params.append('isSystemRule', filters.isSystemRule);
  if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.skip !== undefined) params.append('skip', filters.skip);
  if (filters.take !== undefined) params.append('take', filters.take);

  const response = await fetch(`${API_BASE_URL}/rules?${params}`);
  if (!response.ok) throw new Error('Failed to fetch rules');
  return response.json();
}

export async function getCategoryRules(categoryId) {
  const response = await fetch(`${API_BASE_URL}/categories/${categoryId}/rules`);
  if (!response.ok) throw new Error('Failed to fetch category rules');
  return response.json();
}

export async function createRule(data) {
  const response = await fetch(`${API_BASE_URL}/rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create rule');
  }
  return response.json();
}

export async function updateRule(id, data) {
  const response = await fetch(`${API_BASE_URL}/rules/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update rule');
  }
  return response.json();
}

export async function toggleRuleActive(id) {
  const response = await fetch(`${API_BASE_URL}/rules/${id}/toggle`, {
    method: 'PATCH',
  });
  if (!response.ok) throw new Error('Failed to toggle rule');
  return response.json();
}

export async function deleteRule(id) {
  const response = await fetch(`${API_BASE_URL}/rules/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete rule');
  return response.json();
}

export async function testRule(data) {
  const response = await fetch(`${API_BASE_URL}/rules/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to test rule');
  return response.json();
}

// ============ TRANSACTIONS ============
export async function getTransactions(filters = {}) {
  const params = new URLSearchParams();
  if (filters.categoryIds && filters.categoryIds.length) {
    params.append('categoryId', filters.categoryIds.join(','));
  } else if (filters.categoryId) {
    params.append('categoryId', filters.categoryId);
  }
  if (filters.skip !== undefined) params.append('skip', filters.skip);
  if (filters.take !== undefined) params.append('take', filters.take);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const response = await fetch(`${API_BASE_URL}/transactions?${params}`);
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
}

export async function createTransaction(data) {
  const response = await fetch(`${API_BASE_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create transaction');
  }
  return response.json();
}

export async function updateTransaction(id, data) {
  const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update transaction');
  }
  return response.json();
}

export async function deleteTransaction(id) {
  const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete transaction');
  return response.json();
}

export async function bulkRecategorize(transactionIds) {
  const response = await fetch(`${API_BASE_URL}/transactions/recategorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactionIds }),
  });
  if (!response.ok) throw new Error('Failed to recategorize transactions');
  return response.json();
}

// ============ TRANSACTION IMPORTS ============
export async function getTransactionImports(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.skip !== undefined) params.append('skip', filters.skip);
  if (filters.take !== undefined) params.append('take', filters.take);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

  const response = await fetch(`${API_BASE_URL}/transaction-imports?${params}`);
  if (!response.ok) throw new Error('Failed to fetch transaction imports');
  return response.json();
}

export async function getTransactionImport(id) {
  const response = await fetch(`${API_BASE_URL}/transaction-imports/${id}`);
  if (!response.ok) throw new Error('Failed to fetch transaction import');
  return response.json();
}

export async function createTransactionImport(data) {
  const response = await fetch(`${API_BASE_URL}/transaction-imports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create transaction import');
  }
  return response.json();
}

export async function updateTransactionImport(id, data) {
  const response = await fetch(`${API_BASE_URL}/transaction-imports/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update transaction import');
  }
  return response.json();
}

export async function deleteTransactionImport(id, deleteTransactions = false) {
  const params = new URLSearchParams();
  if (deleteTransactions) params.append('deleteTransactions', 'true');

  const response = await fetch(`${API_BASE_URL}/transaction-imports/${id}?${params}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete transaction import');
  // DELETE returns 204 No Content
  if (response.status === 204) return { success: true };
  return response.json();
}

export async function bulkCreateTransactions(transactionImportId, transactions) {
  const response = await fetch(`${API_BASE_URL}/transactions/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactionImportId, transactions }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to bulk create transactions');
  }
  return response.json();
}
