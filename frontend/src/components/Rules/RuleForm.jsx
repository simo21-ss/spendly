import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createRule, updateRule, getCategories } from '../../api/client';
import './RuleForm.css';

const FIELD_OPTIONS = [
  { value: 'description', label: 'Description' },
  { value: 'merchant', label: 'Merchant/Payee' }
];

const OPERATOR_OPTIONS = [
  { value: 'contains', label: 'Contains' },
  { value: 'equals', label: 'Equals' },
  { value: 'startsWith', label: 'Starts with' }
];

export default function RuleForm({ rule, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    field: 'description',
    operator: 'contains',
    value: '',
    priority: 1000,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCategories();
    if (rule) {
      setFormData({
        name: rule.name,
        categoryId: rule.categoryId,
        field: rule.field,
        operator: rule.operator,
        value: rule.value,
        priority: rule.priority,
      });
    } else {
      setFormData({
        name: '',
        categoryId: '',
        field: 'description',
        operator: 'contains',
        value: '',
        priority: 1000,
      });
    }
    setError(null);
  }, [rule]);

  async function loadCategories() {
    try {
      const data = await getCategories();
      setCategories(data);
      if (!rule && data.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: data[0].id }));
      }
    } catch (err) {
      setError('Failed to load categories');
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'priority' ? parseInt(value) || 0 : value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Rule name is required');
      return;
    }

    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }

    if (!formData.value.trim()) {
      setError('Match value is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let savedRule;
      if (rule) {
        savedRule = await updateRule(rule.id, formData);
      } else {
        savedRule = await createRule(formData);
      }

      onSuccess?.(savedRule);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="ruleFormOverlay" onClick={onClose} />
      <div className="ruleFormModal">
        <div className="ruleForm__header">
          <h2>{rule ? 'Edit Rule' : 'Create New Rule'}</h2>
          <button
            className="ruleForm__close"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ruleForm">
          {error && <div className="ruleFormError">{error}</div>}

          {/* Rule Name */}
          <div className="formGroup">
            <label className="formLabel">Rule Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="formInput"
              placeholder="e.g., Starbucks Coffee"
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div className="formGroup">
            <label className="formLabel">Category</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="formInput"
              disabled={loading}
            >
              <option value="">Select a category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Match Field & Operator */}
          <div className="formRow">
            <div className="formGroup">
              <label className="formLabel">Match Field</label>
              <select
                name="field"
                value={formData.field}
                onChange={handleChange}
                className="formInput"
                disabled={loading}
              >
                {FIELD_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="formGroup">
              <label className="formLabel">Operator</label>
              <select
                name="operator"
                value={formData.operator}
                onChange={handleChange}
                className="formInput"
                disabled={loading}
              >
                {OPERATOR_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Match Value */}
          <div className="formGroup">
            <label className="formLabel">Match Value</label>
            <input
              type="text"
              name="value"
              value={formData.value}
              onChange={handleChange}
              className="formInput"
              placeholder="Enter the value to match"
              disabled={loading}
            />
            <p className="formHint">This is case-insensitive</p>
          </div>

          {/* Priority */}
          <div className="formGroup">
            <label className="formLabel">Priority (Higher = Evaluated First)</label>
            <input
              type="number"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="formInput"
              min={0}
              disabled={loading}
            />
            <p className="formHint">System rules: 100-999, Custom rules: 1000+</p>
          </div>

          {/* Form Actions */}
          <div className="ruleForm__actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn--secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (rule ? 'Update Rule' : 'Create Rule')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
