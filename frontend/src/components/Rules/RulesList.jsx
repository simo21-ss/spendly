import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Edit2, Trash2, Eye, EyeOff, Plus, AlertCircle, X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { getRules, toggleRuleActive, deleteRule } from '../../api/client';
import './RulesList.css';

const RulesList = forwardRef(({ onEditRule, onCreateRule }, ref) => {
  const ITEMS_PER_PAGE = 25;
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterActive, setFilterActive] = useState(null);
  const [filterSystem, setFilterSystem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sortColumn, setSortColumn] = useState('priority');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  useImperativeHandle(ref, () => ({
    addOrUpdateRule: (savedRule) => {
      setRules(currentRules => {
        const existingIndex = currentRules.findIndex(r => r.id === savedRule.id);
        if (existingIndex >= 0) {
          // Update existing rule
          const updated = [...currentRules];
          updated[existingIndex] = savedRule;
          return updated;
        } else {
          // Add new rule at the beginning
          return [savedRule, ...currentRules];
        }
      });
    }
  }));

  useEffect(() => {
    loadRules();
    setCurrentPage(1);
  }, [filterActive, filterSystem]);

  async function loadRules() {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (filterActive !== null) filters.isActive = filterActive;
      if (filterSystem !== null) filters.isSystemRule = filterSystem;

      const data = await getRules({ ...filters, take: 1000 });
      setRules(data.rules || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive(ruleId) {
    try {
      await toggleRuleActive(ruleId);
      // Update state directly without reloading
      setRules(rules.map(r => 
        r.id === ruleId ? { ...r, isActive: !r.isActive } : r
      ));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirm) return;
    try {
      await deleteRule(deleteConfirm.id);
      // Update state directly without reloading
      setRules(rules.filter(r => r.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message);
      setDeleteConfirm(null);
    }
  }

  function handleDeleteClick(rule) {
    setDeleteConfirm(rule);
  }

  function handleSort(column) {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }

  function getSortedRules() {
    return [...rules].sort((a, b) => {
      let aVal, bVal;

      switch (sortColumn) {
        case 'priority':
          aVal = a.priority;
          bVal = b.priority;
          break;
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'field':
          aVal = a.field;
          bVal = b.field;
          break;
        case 'operator':
          aVal = a.operator;
          bVal = b.operator;
          break;
        case 'category':
          aVal = a.category?.name?.toLowerCase() || '';
          bVal = b.category?.name?.toLowerCase() || '';
          break;
        case 'type':
          aVal = a.isSystemRule ? 0 : 1;
          bVal = b.isSystemRule ? 0 : 1;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  function getPaginatedRules() {
    const sorted = getSortedRules();
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sorted.slice(start, start + ITEMS_PER_PAGE);
  }

  const SortIcon = ({ column }) => {
    if (sortColumn === column) {
      return sortDirection === 'asc' ? 
        <ChevronUp size={14} /> : 
        <ChevronDown size={14} />;
    }
    return <ArrowUpDown size={14} />;
  };

  if (loading) {
    return <div className="rulesLoading">Loading rules...</div>;
  }

  return (
    <div className="rulesList">
      {error && <div className="rulesError">{error}</div>}

      <div className="rulesList__header">
        <div className="rulesList__controls">
          <button
            className={`ruleFilter ${filterActive === true ? 'active' : ''}`}
            onClick={() => setFilterActive(filterActive === true ? null : true)}
          >
            Active Only
          </button>
          <button
            className={`ruleFilter ${filterSystem === false ? 'active' : ''}`}
            onClick={() => setFilterSystem(filterSystem === false ? null : false)}
          >
            Custom Rules
          </button>
          <button
            className={`ruleFilter ${filterSystem === true ? 'active' : ''}`}
            onClick={() => setFilterSystem(filterSystem === true ? null : true)}
          >
            System Rules
          </button>
        </div>
        <button className="btn btn--primary" onClick={onCreateRule}>
          <Plus size={16} /> Create Rule
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="rulesEmpty">
          <p>No rules found. {filterActive === true || filterSystem !== null ? 'Try adjusting filters.' : 'Create one to get started!'}</p>
        </div>
      ) : (
        <div className="rulesTable">
          <div className="rulesTable__header">
            <div 
              className={`rulesTable__col rulesTable__col--priority rulesTable__col--sortable ${sortColumn === 'priority' ? 'sorted' : ''}`}
              onClick={() => handleSort('priority')}
            >
              Priority <SortIcon column="priority" />
            </div>
            <div 
              className={`rulesTable__col rulesTable__col--name rulesTable__col--sortable ${sortColumn === 'name' ? 'sorted' : ''}`}
              onClick={() => handleSort('name')}
            >
              Name <SortIcon column="name" />
            </div>
            <div 
              className={`rulesTable__col rulesTable__col--field rulesTable__col--sortable ${sortColumn === 'field' ? 'sorted' : ''}`}
              onClick={() => handleSort('field')}
            >
              Field <SortIcon column="field" />
            </div>
            <div 
              className={`rulesTable__col rulesTable__col--rule rulesTable__col--sortable ${sortColumn === 'operator' ? 'sorted' : ''}`}
              onClick={() => handleSort('operator')}
            >
              Rule <SortIcon column="operator" />
            </div>
            <div 
              className={`rulesTable__col rulesTable__col--category rulesTable__col--sortable ${sortColumn === 'category' ? 'sorted' : ''}`}
              onClick={() => handleSort('category')}
            >
              Category <SortIcon column="category" />
            </div>
            <div 
              className={`rulesTable__col rulesTable__col--type rulesTable__col--sortable ${sortColumn === 'type' ? 'sorted' : ''}`}
              onClick={() => handleSort('type')}
            >
              Type <SortIcon column="type" />
            </div>
            <div className="rulesTable__col rulesTable__col--actions">Actions</div>
          </div>

          <div className="rulesTable__body">
            {getPaginatedRules().map((rule) => (
              <div key={rule.id} className="rulesTable__row">
                <div className="rulesTable__col rulesTable__col--priority">
                  <span className="rulePriority">{rule.priority}</span>
                </div>
                <div className="rulesTable__col rulesTable__col--name">
                  <span className="ruleName">{rule.name}</span>
                </div>
                <div className="rulesTable__col rulesTable__col--field">
                  <span className="ruleBadge ruleBadge--field">{rule.field}</span>
                </div>
                <div className="rulesTable__col rulesTable__col--rule">
                  <span className="ruleCondition">
                    {rule.operator} "{rule.value}"
                  </span>
                </div>
                <div className="rulesTable__col rulesTable__col--category">
                  <span
                    className="ruleCategoryBadge"
                    style={{ backgroundColor: rule.category?.color }}
                  >
                    {rule.category?.icon} {rule.category?.name}
                  </span>
                </div>
                <div className="rulesTable__col rulesTable__col--type">
                  {rule.isSystemRule && (
                    <span className="ruleBadge ruleBadge--system">System</span>
                  )}
                  {!rule.isSystemRule && (
                    <span className="ruleBadge ruleBadge--custom">Custom</span>
                  )}
                </div>
                <div className="rulesTable__col rulesTable__col--actions">
                  <button
                    className="ruleAction ruleAction--toggle"
                    onClick={() => handleToggleActive(rule.id)}
                    title={rule.isActive ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                  >
                    {rule.isActive ? (
                      <Eye size={14} />
                    ) : (
                      <EyeOff size={14} />
                    )}
                  </button>
                  <button
                    className="ruleAction ruleAction--edit"
                    onClick={() => onEditRule(rule)}
                    title="Edit rule"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="ruleAction ruleAction--delete"
                    onClick={() => handleDeleteClick(rule)}
                    title="Delete rule"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {getSortedRules().length > ITEMS_PER_PAGE && (
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
                Page {currentPage} of {Math.ceil(getSortedRules().length / ITEMS_PER_PAGE)}
              </div>
              <button
                className="pagination__button"
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= Math.ceil(getSortedRules().length / ITEMS_PER_PAGE)}
                title="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {deleteConfirm && (
        <>
          <div className="deleteConfirmOverlay" onClick={() => setDeleteConfirm(null)} />
          <div className="deleteConfirmModal">
            <div className="deleteConfirmModal__header">
              <div className="deleteConfirmModal__icon">
                <AlertCircle size={24} />
              </div>
              <h3>Delete Rule?</h3>
              <button
                className="deleteConfirmModal__close"
                onClick={() => setDeleteConfirm(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="deleteConfirmModal__body">
              <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?</p>
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
                Delete Rule
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default RulesList;
