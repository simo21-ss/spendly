import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeftRight,
  ListFilter,
  Download,
  FileText,
  Trash2,
  AlertCircle,
  X,
  Settings,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Pencil,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getTransactions, getCategories, deleteTransaction, updateTransaction } from '../api/client';
import './Transactions.css';

export default function TransactionsPage() {
  const columnMenuRef = useRef(null);
  const COLUMN_STORAGE_KEY = 'transactions.visibleColumns.v1';
  const ITEMS_PER_PAGE = 25;

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editTransactionItem, setEditTransactionItem] = useState(null);
  const [editForm, setEditForm] = useState({
    date: '',
    description: '',
    amount: '',
    merchant: '',
    notes: '',
    categoryId: ''
  });
  const [editError, setEditError] = useState(null);
  const [editFieldErrors, setEditFieldErrors] = useState({
    date: false,
    description: false,
    amount: false
  });
  const [editSaving, setEditSaving] = useState(false);
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortColumn, setSortColumn] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const defaultColumns = ['date', 'category', 'amount', 'description', 'actions'];
    try {
      const stored = localStorage.getItem(COLUMN_STORAGE_KEY);
      if (!stored) return defaultColumns;
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return defaultColumns;
      const validColumns = new Set([
        'date',
        'category',
        'amount',
        'description',
        'merchant',
        'importBatch',
        'actions'
      ]);
      const sanitized = parsed.filter((col) => validColumns.has(col));
      if (!sanitized.includes('actions')) sanitized.push('actions');
      const ordered = ['date', 'category', 'amount', 'description', 'merchant', 'importBatch', 'actions']
        .filter((col) => sanitized.includes(col));
      return ordered.length ? ordered : defaultColumns;
    } catch {
      return defaultColumns;
    }
  });

  useEffect(() => {
    loadData();
  }, [categoryFilter, currentPage]);

  useEffect(() => {
    try {
      localStorage.setItem(COLUMN_STORAGE_KEY, JSON.stringify(visibleColumns));
    } catch {
      // Ignore persistence errors
    }
  }, [visibleColumns]);

  useEffect(() => {
    if (!columnMenuOpen) return undefined;
    const handleClick = (event) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target)) {
        setColumnMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [columnMenuOpen]);

  const loadData = async () => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * ITEMS_PER_PAGE;
      const [txnData, catData] = await Promise.all([
        getTransactions({ 
          categoryId: categoryFilter || undefined,
          skip,
          take: ITEMS_PER_PAGE
        }),
        getCategories()
      ]);
      setTransactions(txnData.transactions || []);
      setTotalCount(txnData.pagination?.total || 0);
      setCategories(catData || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (transaction) => {
    setDeleteConfirm(transaction);
  };

  const handleEditClick = (transaction) => {
    setEditError(null);
    setEditFieldErrors({ date: false, description: false, amount: false });
    setEditTransactionItem(transaction);
    setEditForm({
      date: transaction.date ? new Date(transaction.date).toISOString().slice(0, 10) : '',
      description: transaction.description || '',
      amount: transaction.amount !== undefined ? String(transaction.amount) : '',
      merchant: transaction.merchant || '',
      notes: transaction.notes || '',
      categoryId: transaction.categoryId || ''
    });
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value
    }));
    if (editFieldErrors[field]) {
      setEditFieldErrors((prev) => ({
        ...prev,
        [field]: false
      }));
    }
  };

  const handleEditSave = async () => {
    if (!editTransactionItem) return;
    const nextFieldErrors = {
      date: !editForm.date,
      description: !editForm.description.trim(),
      amount: editForm.amount === '' || Number.isNaN(Number(editForm.amount))
    };
    setEditFieldErrors(nextFieldErrors);
    if (nextFieldErrors.date || nextFieldErrors.description || nextFieldErrors.amount) {
      setEditError('Date, description, and amount are required.');
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      const payload = {
        date: editForm.date,
        description: editForm.description.trim(),
        amount: editForm.amount === '' ? undefined : parseFloat(editForm.amount),
        merchant: editForm.merchant.trim() || null,
        notes: editForm.notes.trim() || null,
        categoryId: editForm.categoryId || null
      };
      const updated = await updateTransaction(editTransactionItem.id, payload);
      setTransactions((prev) => prev.map((txn) => {
        if (txn.id !== updated.id) return txn;
        return {
          ...txn,
          ...updated,
          transactionImport: txn.transactionImport || null
        };
      }));
      setEditTransactionItem(null);
    } catch (err) {
      setEditError('Failed to update transaction: ' + err.message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteTransaction(deleteConfirm.id);
      setTransactions(transactions.filter(txn => txn.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete transaction: ' + err.message);
      setDeleteConfirm(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const columns = useMemo(() => ([
    { key: 'date', label: 'Date', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'description', label: 'Description', sortable: true },
    { key: 'merchant', label: 'Merchant', sortable: true },
    { key: 'importBatch', label: 'Import Batch', sortable: true },
    { key: 'actions', label: 'Actions', sortable: false }
  ]), []);

  const getSortValue = (txn, columnKey) => {
    switch (columnKey) {
      case 'date':
        return new Date(txn.date).getTime();
      case 'category':
        return txn.category?.name || '';
      case 'amount':
        return txn.amount ?? 0;
      case 'description':
        return txn.description || '';
      case 'merchant':
        return txn.merchant || '';
      case 'importBatch':
        return txn.transactionImport?.filename || '';
      default:
        return '';
    }
  };

  const sortedTransactions = useMemo(() => {
    const sorted = [...transactions];
    sorted.sort((a, b) => {
      const aValue = getSortValue(a, sortColumn);
      const bValue = getSortValue(b, sortColumn);

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const result = String(aValue).localeCompare(String(bValue), undefined, {
        sensitivity: 'base'
      });
      return sortDirection === 'asc' ? result : -result;
    });
    return sorted;
  }, [transactions, sortColumn, sortDirection]);

  const visibleColumnDefinitions = useMemo(() => {
    const visibleSet = new Set(visibleColumns);
    return columns.filter((column) => visibleSet.has(column.key));
  }, [columns, visibleColumns]);

  const toggleColumn = (columnKey) => {
    if (columnKey === 'actions') return;
    const orderedKeys = ['date', 'category', 'amount', 'description', 'merchant', 'importBatch', 'actions'];
    setVisibleColumns((prev) => {
      const next = prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey];
      if (!next.includes('actions')) next.push('actions');
      return orderedKeys.filter((key) => next.includes(key));
    });
  };

  const handleSort = (columnKey) => {
    if (columnKey === 'actions') return;
    if (columnKey === sortColumn) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortColumn(columnKey);
    setSortDirection('asc');
  };

  if (loading) {
    return (
      <div className="page">
        <header className="page__header">
          <div className="page__header-icon">
            <ArrowLeftRight />
          </div>
          <div className="page__header-text">
            <h1 className="page__title">Transactions</h1>
            <p className="page__subtitle">Browse, search, and filter your imported transactions.</p>
          </div>
        </header>
        <section className="section">
          <p className="loading">Loading transactions...</p>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <header className="page__header">
          <div className="page__header-icon">
            <ArrowLeftRight />
          </div>
          <div className="page__header-text">
            <h1 className="page__title">Transactions</h1>
            <p className="page__subtitle">Browse, search, and filter your imported transactions.</p>
          </div>
        </header>
        <section className="section">
          <div className="alert alert--error"><AlertCircle size={20} /><span>Error: {error}</span></div>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page__header">
        <div className="page__header-icon">
          <ArrowLeftRight />
        </div>
        <div className="page__header-text">
          <h1 className="page__title">Transactions</h1>
          <p className="page__subtitle">Browse, search, and filter your imported transactions.</p>
        </div>
      </header>

      <section className="section">

        {/* Transactions Table */}
        {transactions.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No transactions found</h3>
            <p>Start by importing transactions from the Import page</p>
          </div>
        ) : (
          <>
            <div className="transactions-summary">
              <span className="summary-text">
                Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </span>
              <div className="summary-actions">
                <div className="column-chooser" ref={columnMenuRef}>
                  <button
                    type="button"
                    className="column-chooser__button"
                    onClick={() => setColumnMenuOpen((prev) => !prev)}
                    aria-expanded={columnMenuOpen}
                    aria-haspopup="menu"
                  >
                    <Settings size={16} />
                    Columns
                    <ChevronDown size={14} />
                  </button>
                  {columnMenuOpen && (
                    <div className="column-chooser__menu" role="menu">
                      {columns.map((column) => (
                        <label key={column.key} className="column-chooser__item">
                          <input
                            type="checkbox"
                            checked={visibleColumns.includes(column.key)}
                            onChange={() => toggleColumn(column.key)}
                            disabled={column.key === 'actions'}
                          />
                          <span className="column-chooser__label">{column.label}</span>
                          {column.key === 'actions' && (
                            <span className="column-chooser__locked">Required</span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="transactions-table-wrapper">
              <table className="transactions-table">
                <thead>
                  <tr>
                    {visibleColumnDefinitions.map((column) => (
                      <th
                        key={column.key}
                        className={column.sortable ? 'sortable-header' : undefined}
                      >
                        {column.sortable ? (
                          <button
                            type="button"
                            className={
                              column.key === sortColumn
                                ? 'sortable-header__button is-sorted'
                                : 'sortable-header__button'
                            }
                            onClick={() => handleSort(column.key)}
                          >
                            <span>{column.label}</span>
                            {column.key === sortColumn ? (
                              sortDirection === 'asc' ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
                              )
                            ) : (
                              <ArrowUpDown size={14} />
                            )}
                          </button>
                        ) : (
                          column.label
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedTransactions.map((txn) => (
                    <tr key={txn.id}>
                      {visibleColumns.includes('date') && (
                        <td className="date-cell">{formatDate(txn.date)}</td>
                      )}
                      {visibleColumns.includes('category') && (
                        <td className="category-cell">
                          {txn.category ? (
                            <div className="category-badge" style={{ backgroundColor: txn.category.color }}>
                              <span>{txn.category.icon}</span>
                              <span>{txn.category.name}</span>
                            </div>
                          ) : (
                            <span className="uncategorized">Uncategorized</span>
                          )}
                        </td>
                      )}
                      {visibleColumns.includes('amount') && (
                        <td className={`amount-cell ${txn.amount < 0 ? 'negative' : 'positive'}`}>
                          {formatAmount(txn.amount)}
                        </td>
                      )}
                      {visibleColumns.includes('description') && (
                        <td className="description-cell">
                          <div className="description">{txn.description}</div>
                          {txn.notes && (
                            <div className="notes">{txn.notes}</div>
                          )}
                        </td>
                      )}
                      {visibleColumns.includes('merchant') && (
                        <td className="merchant-cell">{txn.merchant || '-'}</td>
                      )}
                      {visibleColumns.includes('importBatch') && (
                        <td className="import-cell">
                          {txn.transactionImport ? (
                            <div className="import-badge">
                              <Download size={14} />
                              <div className="import-info">
                                <div className="import-filename">{txn.transactionImport.filename}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="manual-entry">Manual</span>
                          )}
                        </td>
                      )}
                      {visibleColumns.includes('actions') && (
                        <td className="actions-cell">
                          <div className="actions-buttons">
                            <button
                              className="btn-icon"
                              onClick={() => handleEditClick(txn)}
                              title="Edit transaction"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="btn-icon btn-icon-danger"
                              onClick={() => handleDeleteClick(txn)}
                              title="Delete transaction"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalCount > ITEMS_PER_PAGE && (
              <div className="pagination">
                <button
                  className="pagination__button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  title="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="pagination__info">
                  Page {currentPage} of {Math.ceil(totalCount / ITEMS_PER_PAGE)}
                </div>
                <button
                  className="pagination__button"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage >= Math.ceil(totalCount / ITEMS_PER_PAGE)}
                  title="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {editTransactionItem && (
        <>
          <div className="editModalOverlay" onClick={() => setEditTransactionItem(null)} />
          <div className="editModal">
            <div className="editModal__header">
              <h3>Edit Transaction</h3>
              <button
                className="editModal__close"
                onClick={() => setEditTransactionItem(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="editModal__body">
              {editError && <p className="editModal__error">{editError}</p>}
              <div className="editModal__grid">
                <label className="editModal__field">
                  Date
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => handleEditChange('date', e.target.value)}
                    className={editFieldErrors.date ? 'editModal__input--error' : undefined}
                  />
                </label>
                <label className="editModal__field">
                  Amount
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.amount}
                    onChange={(e) => handleEditChange('amount', e.target.value)}
                    className={editFieldErrors.amount ? 'editModal__input--error' : undefined}
                  />
                </label>
                <label className="editModal__field editModal__field--full">
                  Description
                  <input
                    type="text"
                    value={editForm.description}
                    onChange={(e) => handleEditChange('description', e.target.value)}
                    className={editFieldErrors.description ? 'editModal__input--error' : undefined}
                  />
                </label>
                <label className="editModal__field">
                  Merchant
                  <input
                    type="text"
                    value={editForm.merchant}
                    onChange={(e) => handleEditChange('merchant', e.target.value)}
                  />
                </label>
                <label className="editModal__field">
                  Category
                  <select
                    value={editForm.categoryId}
                    onChange={(e) => handleEditChange('categoryId', e.target.value)}
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="editModal__field editModal__field--full">
                  Notes
                  <textarea
                    rows={3}
                    value={editForm.notes}
                    onChange={(e) => handleEditChange('notes', e.target.value)}
                  />
                </label>
              </div>
            </div>
            <div className="editModal__actions">
              <button
                className="btn btn--ghost"
                onClick={() => setEditTransactionItem(null)}
                disabled={editSaving}
              >
                Cancel
              </button>
              <button
                className="btn"
                onClick={handleEditSave}
                disabled={editSaving}
              >
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </>
      )}

      {deleteConfirm && (
        <>
          <div className="deleteConfirmOverlay" onClick={() => setDeleteConfirm(null)} />
          <div className="deleteConfirmModal">
            <div className="deleteConfirmModal__header">
              <div className="deleteConfirmModal__icon">
                <AlertCircle size={24} />
              </div>
              <h3>Delete Transaction?</h3>
              <button
                className="deleteConfirmModal__close"
                onClick={() => setDeleteConfirm(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="deleteConfirmModal__body">
              <p>Are you sure you want to delete this transaction?</p>
              <div className="deleteConfirmModal__details">
                <strong>{deleteConfirm.description}</strong>
                <span>{formatAmount(deleteConfirm.amount)} on {formatDate(deleteConfirm.date)}</span>
              </div>
              <p className="deleteConfirmModal__note">This action cannot be undone.</p>
            </div>
            <div className="deleteConfirmModal__actions">
              <button
                className="btn btn--ghost"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn--danger"
                onClick={handleDeleteConfirm}
              >
                Delete Transaction
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

