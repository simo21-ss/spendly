# Design System - Quick Reference Guide

## Common Component Patterns

### Before vs After

#### Page Structure

**BEFORE:**
```jsx
<div className="page">
  <header className="pageHeader">
    <div className="pageHeader__icon"><Icon /></div>
    <div className="pageHeader__text">
      <h1 className="pageTitle">Page Title</h1>
      <p className="muted">Description</p>
    </div>
  </header>
  
  <div className="panel">
    {/* content */}
  </div>
</div>
```

**AFTER:**
```jsx
<div className="page">
  <header className="page__header">
    <div className="page__header-icon"><Icon /></div>
    <div className="page__header-text">
      <h1 className="page__title">Page Title</h1>
      <p className="page__subtitle">Description</p>
    </div>
  </header>
  
  <section className="section">
    {/* content */}
  </section>
</div>
```

#### Section with Header

**BEFORE:**
```jsx
<div className="panel">
  <h2 className="panel__title">Title</h2>
  {/* content */}
</div>
```

**AFTER:**
```jsx
<section className="section">
  <div className="section__header">
    <h2 className="section__title">Title</h2>
    <div className="section__actions">
      <button className="btn btn--primary">Action</button>
    </div>
  </div>
  {/* content */}
</section>
```

#### Card Grid

**BEFORE:**
```jsx
<div className="grid3">
  {items.map(item => (
    <div key={item.id} className="card">
      <div className="card__top">
        <div className="card__icon card__icon--emerald">
          <Icon />
        </div>
        <div className="card__info">
          <h2 className="card__title">{item.title}</h2>
          <p className="card__desc">{item.desc}</p>
        </div>
      </div>
      <Link className="btn btn--secondary" to={item.to}>
        {item.btnLabel}
      </Link>
    </div>
  ))}
</div>
```

**AFTER:**
```jsx
<div className="card-grid">
  {items.map(item => (
    <div key={item.id} className="card">
      <div className="card__header">
        <div className="card__icon card__icon--primary">
          <Icon />
        </div>
        <div className="card__content">
          <h3 className="card__title">{item.title}</h3>
          <p className="card__description">{item.desc}</p>
        </div>
      </div>
      <div className="card__footer">
        <Link className="btn btn--secondary" to={item.to}>
          {item.btnLabel}
        </Link>
      </div>
    </div>
  ))}
</div>
```

#### Table

**BEFORE:**
```jsx
<div className="transactions-table-wrapper">
  <table className="transactions-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      {/* rows */}
    </tbody>
  </table>
</div>
```

**AFTER:**
```jsx
<div className="table-wrapper">
  <table className="table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      {/* rows */}
    </tbody>
  </table>
</div>
```

#### Modal

**BEFORE:**
```jsx
{isOpen && (
  <>
    <div className="ruleFormOverlay" onClick={handleClose} />
    <div className="ruleFormModal">
      <div className="ruleForm__header">
        <h2>Modal Title</h2>
        <button className="ruleForm__close">×</button>
      </div>
      <div className="ruleForm">
        {/* content */}
      </div>
      <div className="ruleForm__actions">
        <button className="btn btn--secondary">Cancel</button>
        <button className="btn btn--primary">Save</button>
      </div>
    </div>
  </>
)}
```

**AFTER:**
```jsx
{isOpen && (
  <div className="modal-overlay" onClick={handleClose}>
    <div className="modal">
      <div className="modal__header">
        <h2>Modal Title</h2>
        <button className="modal__close">×</button>
      </div>
      <div className="modal__body">
        {/* content */}
      </div>
      <div className="modal__footer">
        <button className="btn btn--secondary">Cancel</button>
        <button className="btn btn--primary">Save</button>
      </div>
    </div>
  </div>
)}
```

#### Alert/Status Message

**BEFORE:**
```jsx
<div className="error-message">
  <XCircle size={20} />
  <span>Error message</span>
</div>
```

**AFTER:**
```jsx
<div className="alert alert--error">
  <AlertCircle size={18} />
  <span>Error message</span>
</div>
```

#### Empty State

**BEFORE:**
```jsx
<div className="empty-state">
  <FileText size={48} />
  <h3>No items found</h3>
  <p>Description</p>
</div>
```

**AFTER:**
```jsx
<div className="empty-state">
  <FileText className="empty-state__icon" />
  <h3 className="empty-state__title">No items found</h3>
  <p className="empty-state__description">Description</p>
  <a href="#" className="empty-state__action btn btn--primary">Get Started</a>
</div>
```

#### Buttons

**BEFORE:**
```jsx
<button className="btn btn--primary">Primary</button>
<button className="btn btn--secondary">Secondary</button>
<button className="btn btn--ghost">Ghost</button>
<button className="btn-icon">Icon</button>
```

**AFTER:**
```jsx
<button className="btn btn--primary">Primary</button>
<button className="btn btn--secondary">Secondary</button>
<button className="btn btn--ghost">Ghost</button>
<button className="btn btn--icon">Icon</button>
```

#### Badges/Pills

**BEFORE:**
```jsx
<span className="pill">System</span>
<span className="pill pill--planned">Planned</span>
```

**AFTER:**
```jsx
<span className="badge">Default</span>
<span className="badge badge--outline">Outline</span>
<span className="badge badge--success">Success</span>
<span className="badge badge--warning">Warning</span>
<span className="badge badge--error">Error</span>
```

#### Lists

**BEFORE:**
```jsx
<ul className="bullets">
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

**AFTER:**
```jsx
<ul className="bullet-list">
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

<!-- Or for more structured lists: -->
<ul className="list">
  <li className="list-item">
    <div className="list-item__content">
      <span className="list-item__label">Label</span>
    </div>
    <span className="list-item__value">Value</span>
  </li>
</ul>
```

## Color Icon Variants

### Card Icons
- `card__icon--primary` - Green gradient
- `card__icon--accent` - Cyan gradient
- `card__icon--secondary` - Purple gradient

### Badge Variants
- `badge` - Default (primary green)
- `badge--outline` - Bordered, neutral
- `badge--success` - Green
- `badge--warning` - Orange
- `badge--error` - Red

### Alert Variants
- `alert--success` - Green background
- `alert--warning` - Orange background
- `alert--error` - Red background
- `alert--info` - Blue background

## Spacing Utilities

```jsx
/* Margin Top */
<div className="mt-0">Margin: 0</div>
<div className="mt-1">Margin: 4px</div>
<div className="mt-2">Margin: 8px</div>
<div className="mt-3">Margin: 12px</div>
<div className="mt-4">Margin: 16px</div>

/* Margin Bottom */
<div className="mb-0">Margin: 0</div>
<div className="mb-1">Margin: 4px</div>
<div className="mb-2">Margin: 8px</div>
<div className="mb-3">Margin: 12px</div>
<div className="mb-4">Margin: 16px</div>

/* Gap */
<div className="gap-1">Gap: 4px</div>
<div className="gap-2">Gap: 8px</div>
<div className="gap-3">Gap: 12px</div>
<div className="gap-4">Gap: 16px</div>
```

## Text Utilities

```jsx
<p className="text-muted">Muted text</p>
<p className="text-secondary">Secondary text</p>
<p className="text-center">Centered text</p>
<p className="text-right">Right-aligned text</p>
```

## Layout Utilities

```jsx
<!-- Flex with space-between -->
<div className="flex-between">
  <span>Left</span>
  <span>Right</span>
</div>

<!-- Flex with center alignment -->
<div className="flex-center">
  <Icon size={18} />
  <span>Centered content</span>
</div>
```

## CSS Variables Available

```css
/* Primary Colors */
--primary: #059669
--primary-light: #10b981
--primary-dark: #047857
--primary-glow: rgba(5, 150, 105, 0.15)

/* Accent Colors */
--accent: #0891b2
--accent-light: #22d3ee
--accent-glow: rgba(8, 145, 178, 0.12)

/* Text Colors */
--text: #0f1f1a
--text-secondary: #4a635b
--text-muted: #8a9f97

/* Surface Colors */
--surface-50: #f8faf9
--surface-100: #f1f5f3
--surface-200: #e2e8e5
--surface-card: #ffffff

/* Borders */
--border: #dce5e1
--border-light: #edf2ef

/* Sizing */
--radius: 14px
--radius-sm: 10px
--radius-lg: 20px

/* Shadows */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)
--shadow: 0 4px 16px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)
--shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)
--shadow-primary: 0 4px 20px rgba(5, 150, 105, 0.25)

/* Fonts */
--font-display: 'Plus Jakarta Sans', sans-serif
--font-body: 'DM Sans', sans-serif
```

## Responsive Breakpoints

Styles automatically adapt for:
- **Tablet**: max-width 768px
- **Mobile**: max-width 640px

Tables convert to card layout on mobile devices automatically.

## Tips for Consistency

1. **Always use the `.page` container** for all page layouts
2. **Use `.page__header` for page titles** instead of custom headers
3. **Wrap content in `.section`** instead of `.panel`
4. **Use `.card-grid` for responsive card layouts** instead of `.grid3`
5. **Prefer `.section__header` for section titles** with actions
6. **Use `.modal` classes for all modals and dialogs**
7. **Use `.alert` classes for all status messages**
8. **Use `.badge` for all labels and status indicators**
9. **Reference `DESIGN_SYSTEM.md`** for complete documentation

---

Document version: 1.0
Last updated: February 17, 2026
