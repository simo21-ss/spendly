import { Link } from 'react-router-dom'
import {
  Upload,
  BarChart3,
  Tags,
  ArrowRight,
  Receipt,
  Layers,
  DollarSign,
} from 'lucide-react'

const features = [
  {
    icon: Upload,
    iconClass: 'card__icon card__icon--emerald',
    title: 'Import',
    desc: 'Upload CSV or JSON files — preview, map columns, and save.',
    pill: 'Coming soon',
    pillClass: 'pill',
    to: '/import',
    btnLabel: 'Go to Import',
  },
  {
    icon: BarChart3,
    iconClass: 'card__icon card__icon--cyan',
    title: 'Analytics',
    desc: 'Monthly spend trends, category breakdowns, and insights.',
    pill: 'Coming soon',
    pillClass: 'pill',
    to: '/charts',
    btnLabel: 'View Charts',
  },
  {
    icon: Tags,
    iconClass: 'card__icon card__icon--violet',
    title: 'Rules',
    desc: 'Auto-categorize with keyword and merchant matching rules.',
    pill: '',
    pillClass: 'pill',
    to: '/rules',
    btnLabel: 'Manage Rules',
  },
]

const stats = [
  {
    icon: Receipt,
    iconClass: 'stat__icon stat__icon--emerald',
    value: '0',
    label: 'Transactions',
  },
  {
    icon: Layers,
    iconClass: 'stat__icon stat__icon--cyan',
    value: '0',
    label: 'Categories',
  },
  {
    icon: DollarSign,
    iconClass: 'stat__icon stat__icon--amber',
    value: '$0.00',
    label: 'This Month',
  },
]

export default function Home() {
  return (
    <div className="page">
      <section className="hero">
        <div className="hero__layout">
          <div className="hero__content">
            <div className="hero__eyebrow">Spendly</div>
            <h1 className="hero__title">
              Track, categorize &<br />understand your money
            </h1>
            <p className="hero__subtitle">
              Import transactions from any source, organize with smart rules, and
              visualize where every dollar goes.
            </p>
            <div className="hero__actions">
              <Link className="btn btn--primary" to="/import">
                <Upload size={16} />
                Import Transactions
              </Link>
              <Link className="btn btn--ghost" to="/charts">
                <BarChart3 size={16} />
                View Analytics
              </Link>
            </div>
          </div>

          <div className="hero__statsRight">
            {stats.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="heroStat">
                  <div className={s.iconClass}>
                    <Icon />
                  </div>
                  <div className="heroStat__body">
                    <div className="heroStat__value">{s.value}</div>
                    <div className="heroStat__label">{s.label}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="grid3">
        {features.map((f) => {
          const Icon = f.icon
          return (
            <div key={f.title} className="card">
              <div className="card__top">
                <div className={f.iconClass}>
                  <Icon />
                </div>
                <div className="card__info">
                  <h2 className="card__title">{f.title}</h2>
                  <p className="card__desc">{f.desc}</p>
                </div>
                {f.pill && <span className={f.pillClass}>{f.pill}</span>}
              </div>
              <Link className="btn btn--secondary" to={f.to}>
                {f.btnLabel}
                <ArrowRight size={14} />
              </Link>
            </div>
          )
        })}
      </section>

    </div>
  )
}
