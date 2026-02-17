import { NavLink } from 'react-router-dom'
import {
  Home,
  LayoutDashboard,
  ArrowLeftRight,
  Upload,
  BarChart3,
  Tags,
  Zap,
  Wallet,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/import', label: 'Import Data', icon: Upload },
  { to: '/charts', label: 'Analytics', icon: BarChart3 },
  { to: '/categories', label: 'Categories', icon: Tags },
  { to: '/rules', label: 'Rules', icon: Zap },
]

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={collapsed ? 'sidebar sidebar--collapsed' : 'sidebar'}>
      <div className={collapsed ? 'sidebar__top sidebar__top--collapsed' : 'sidebar__top'}>
        <div className="brand">
          <div className="brand__mark" aria-hidden="true">
            <Wallet strokeWidth={2} />
          </div>
          {!collapsed && (
            <div className="brand__text">
              <div className="brand__name">Spendly</div>
              <div className="brand__tag">Smart finance</div>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            type="button"
            className="toggle-btn"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            title="Collapse"
          >
            <PanelLeftClose />
          </button>
        )}
        {collapsed && (
          <button
            type="button"
            className="toggle-btn"
            onClick={onToggle}
            aria-label="Expand sidebar"
            title="Expand"
          >
            <PanelLeftOpen />
          </button>
        )}
      </div>

      <nav className="nav" aria-label="Primary">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? 'nav__link nav__link--active' : 'nav__link'
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="nav__icon" strokeWidth={1.8} />
              {!collapsed && <span className="nav__label">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="sidebar__footer">
          <div className="sidebar__version">v0.1.0</div>
        </div>
      )}
    </aside>
  )
}
