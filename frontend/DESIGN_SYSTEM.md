# Design System - Standardized Component Classes

This document outlines all standardized design components and their CSS classes for consistent usage across the application.

## Page Structure

### Page Container
- `class="page"` - Main page container with max-width and flexbox layout

### Page Headers
- `class="page__header"` - Header section for pages
- `class="page__header-icon"` - Icon container (48x48px)
- `class="page__header-text"` - Text content area
- `class="page__title"` - Page title (h1/h2)
- `class="page__subtitle"` - Page subtitle/description

**Usage:**
```jsx
<div className="page">
  <header className="page__header">
    <div className="page__header-icon">
      <IconComponent />
    </div>
    <div className="page__header-text">
      <h1 className="page__title">Page Title</h1>
      <p className="page__subtitle">Page description</p>
    </div>
  </header>
  ...
</div>
```

## Sections & Panels

### Section
- `class="section"` - Content section with card styling
- `class="section__header"` - Section header with title and actions
- `class="section__title"` - Section title
- `class="section__actions"` - Actions/buttons area

**Usage:**
```jsx
<section className="section">
  <div className="section__header">
    <h2 className="section__title">Section Title</h2>
    <div className="section__actions">
      <button className="btn btn--primary">Action</button>
    </div>
  </div>
  {/* content */}
</section>
```

## Buttons

### Button Styles
- `class="btn"` - Base button
- `class="btn--primary"` - Primary action (green background)
- `class="btn--secondary"` - Secondary action (white background)
- `class="btn--ghost"` - Ghost button (transparent, dark theme)
- `class="btn--icon"` - Icon-only button (small square)

**Usage:**
```jsx
<button className="btn btn--primary">
  <Icon size={16} />
  Button Label
</button>
```

## Tables

### Table Structure
- `class="table-wrapper"` - Wrapper for horizontal scrolling
- `class="table"` - Main table element
- `class="table__cell-label"` - Small uppercase labels in cells
- `class="table__actions"` - Action buttons container in cells

**Usage:**
```jsx
<div className="table-wrapper">
  <table className="table">
    <thead>
      <tr>
        <th>Column</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data</td>
        <td className="table__actions">
          <button className="btn btn--icon">Edit</button>
          <button className="btn btn--icon">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## Forms

### Form Elements
- `class="form"` - Form container
- `class="form-group"` - Form field group
- `class="form-control"` - Text input, select, textarea
- `class="form-error"` - Error message
- `class="form-helper"` - Helper text below field

**Usage:**
```jsx
<form className="form">
  <div className="form-group">
    <label htmlFor="name" className="required">Name</label>
    <input type="text" id="name" className="form-control" />
    {error && <div className="form-error">{error}</div>}
  </div>
</form>
```

## Modals & Dialogs

### Modal Structure
- `class="modal-overlay"` - Backdrop overlay
- `class="modal"` - Modal container
- `class="modal__header"` - Modal header with close button
- `class="modal__body"` - Modal content
- `class="modal__footer"` - Modal footer with actions

**Usage:**
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
        <button className="btn btn--primary">Confirm</button>
      </div>
    </div>
  </div>
)}
```

## Cards

### Card Layout
- `class="card"` - Card container
- `class="card-grid"` - Responsive grid of cards
- `class="card__header"` - Card header section
- `class="card__icon"` - Icon in card header
- `class="card__content"` - Card content area
- `class="card__title"` - Card title
- `class="card__description"` - Card description
- `class="card__footer"` - Card footer section

### Card Icons
- `class="card__icon--primary"` - Green gradient background
- `class="card__icon--accent"` - Cyan gradient background
- `class="card__icon--secondary"` - Purple/violet gradient background

**Usage:**
```jsx
<div className="card-grid">
  <div className="card">
    <div className="card__header">
      <div className="card__icon card__icon--primary">
        <IconComponent />
      </div>
      <div className="card__content">
        <h3 className="card__title">Card Title</h3>
        <p className="card__description">Card description</p>
      </div>
    </div>
    <div className="card__footer">
      <button className="btn btn--secondary">Action</button>
    </div>
  </div>
</div>
```

## Badges & Pills

### Badge Styles
- `class="badge"` - Default badge (green background)
- `class="badge--outline"` - Outlined badge
- `class="badge--success"` - Success badge
- `class="badge--warning"` - Warning badge
- `class="badge--error"` - Error badge

**Usage:**
```jsx
<span className="badge">Status</span>
<span className="badge badge--error">Failed</span>
```

## Status Messages & Alerts

### Alert Styles
- `class="alert alert--success"` - Success message (green)
- `class="alert alert--warning"` - Warning message (orange)
- `class="alert alert--error"` - Error message (red)
- `class="alert alert--info"` - Info message (blue)

**Usage:**
```jsx
<div className="alert alert--error">
  <AlertCircle size={18} />
  <span>Error message content</span>
</div>
```

## Empty States

### Empty State
- `class="empty-state"` - Empty state container
- `class="empty-state__icon"` - Icon (usually 64x64px)
- `class="empty-state__title"` - Empty state title
- `class="empty-state__description"` - Empty state description
- `class="empty-state__action"` - Action button

**Usage:**
```jsx
<div className="empty-state">
  <IconComponent className="empty-state__icon" />
  <h3 className="empty-state__title">No data found</h3>
  <p className="empty-state__description">Create your first item to get started</p>
  <a href="#" className="empty-state__action btn btn--primary">Get Started</a>
</div>
```

## Loading States

### Loading
- `class="loading"` - Loading container
- `class="loading-spinner"` - Animated spinner

**Usage:**
```jsx
<div className="loading">
  <div className="loading-spinner"></div>
  <p>Loading...</p>
</div>
```

## Lists

### List Components
- `class="list"` - List container
- `class="list-item"` - Individual list item
- `class="list-item__content"` - Item content area
- `class="list-item__label"` - Item label
- `class="list-item__value"` - Item value (right-aligned)
- `class="bullet-list"` - Bulleted list with dot separators

**Usage:**
```jsx
<ul className="list">
  <li className="list-item">
    <div className="list-item__content">
      <span className="list-item__label">Label</span>
    </div>
    <span className="list-item__value">Value</span>
  </li>
</ul>

<ul className="bullet-list">
  <li>Bullet point</li>
</ul>
```

## Filters & Controls

### Filter Bar
- `class="filter-bar"` - Filter container
- `class="filter-group"` - Individual filter group
- `class="filter-select"` - Filter select input

**Usage:**
```jsx
<div className="filter-bar">
  <div className="filter-group">
    <label htmlFor="category">Category</label>
    <select id="category" className="filter-select">
      <option>All</option>
    </select>
  </div>
</div>
```

## Dropdowns

### Dropdown Menu
- `class="dropdown"` - Dropdown container
- `class="dropdown__menu"` - Menu popup
- `class="dropdown__item"` - Menu item
- `class="dropdown__separator"` - Visual separator

**Usage:**
```jsx
<div className="dropdown">
  <button onClick={toggleMenu}>Menu</button>
  {isOpen && (
    <div className="dropdown__menu">
      <button className="dropdown__item">Option 1</button>
      <div className="dropdown__separator"></div>
      <button className="dropdown__item">Option 2</button>
    </div>
  )}
</div>
```

## Utility Classes

### Text Utilities
- `class="text-muted"` - Muted text color
- `class="text-secondary"` - Secondary text color
- `class="text-center"` - Center text align
- `class="text-right"` - Right text align

### Layout Utilities
- `class="flex-between"` - Flex with space-between
- `class="flex-center"` - Flex with center alignment

### Spacing Utilities
- `class="mt-0/1/2/3/4"` - Margin top (0/4/8/12/16px)
- `class="mb-0/1/2/3/4"` - Margin bottom (0/4/8/12/16px)
- `class="gap-1/2/3/4"` - Gap spacing (4/8/12/16px)

## CSS Custom Properties (Variables)

All components use CSS custom properties defined in `index.css`:

### Colors
- `--primary: #059669` - Primary green
- `--primary-light: #10b981` - Light green
- `--primary-dark: #047857` - Dark green
- `--accent: #0891b2` - Cyan
- `--accent-light: #22d3ee` - Light cyan
- `--text: #0f1f1a` - Main text
- `--text-secondary: #4a635b` - Secondary text
- `--text-muted: #8a9f97` - Muted text

### Surfaces
- `--surface-50: #f8faf9` - Lightest background
- `--surface-100: #f1f5f3` - Light background
- `--surface-200: #e2e8e5` - Medium background
- `--surface-card: #ffffff` - Card background

### Sizing
- `--radius: 14px` - Default border radius
- `--radius-sm: 10px` - Small border radius
- `--radius-lg: 20px` - Large border radius

### Shadows
- `--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)`
- `--shadow: 0 4px 16px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)`
- `--shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04)`

## Best Practices

1. **Always use standardized classes** - Don't create custom styles for common components
2. **Use BEM naming convention** - Block__Element--Modifier (e.g., `card__header`)
3. **Compose classes together** - Combine base classes with modifiers (e.g., `btn btn--primary`)
4. **Use custom properties** - Reference CSS variables instead of hardcoding colors/sizes
5. **Keep consistency** - All pages and components should follow the same patterns
6. **Responsive design** - Styles automatically adapt to mobile (< 768px) viewports
