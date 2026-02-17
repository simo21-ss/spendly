import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Upload,
  BarChart3,
  Tags,
  ArrowRight,
  Receipt,
  DollarSign,
} from 'lucide-react'
import { getTransactions, getCategories } from '../api/client'

const features = [
  {
    icon: Upload,
    iconClass: 'card__icon card__icon--emerald',
    title: 'Import',
    desc: 'Upload CSV or JSON files — preview, map columns, and save.',
    pill: '',
    pillClass: 'pill',
    to: '/import',
    btnLabel: 'Go to Import',
  },
  {
    icon: BarChart3,
    iconClass: 'card__icon card__icon--cyan',
    title: 'Analytics',
    desc: 'Monthly spend trends, category breakdowns, and insights.',
    pill: '',
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

const COLORS = {
  income: '#10b981',
  expense: '#ef4444',
}

export default function Home() {
  const [stats, setStats] = useState({
    transactionCount: 0,
    categoryCount: 0,
    income: 0,
    expenses: 0,
    balance: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const getMonthRange = () => {
    // February 2026 (current context date is Feb 17, 2026)
    const start = new Date(2026, 1, 1) // Month is 0-indexed
    const end = new Date(2026, 1, 28, 23, 59, 59)
    return { start, end }
  }

  const isTransactionInMonth = (transaction) => {
    const { start, end } = getMonthRange()
    const txDate = new Date(transaction.date)
    return txDate >= start && txDate <= end
  }

  const calculateStats = (txns, cats) => {
    // Filter transactions for current month
    const monthlyTxns = txns.filter(isTransactionInMonth)

    let income = 0
    let expenses = 0

    monthlyTxns.forEach((txn) => {
      const amount = parseFloat(txn.amount) || 0
      if (amount > 0) {
        income += amount
      } else if (amount < 0) {
        expenses += Math.abs(amount)
      }
    })

    return {
      transactionCount: txns.length,
      categoryCount: cats.length,
      income: parseFloat(income.toFixed(2)),
      expenses: parseFloat(expenses.toFixed(2)),
      balance: parseFloat((income - expenses).toFixed(2)),
    }
  }

  const loadData = async () => {
    try {
      const [txnData, catData] = await Promise.all([
        getTransactions({ take: 1000 }),
        getCategories(),
      ])

      const txns = txnData.transactions || []
      const cats = catData || []

      // Calculate stats
      const calculatedStats = calculateStats(txns, cats)
      setStats(calculatedStats)
    } catch (err) {
      console.error('Error loading home data:', err)
    }
  }

  const statsList = [
    {
      icon: Receipt,
      iconClass: 'stat__icon stat__icon--emerald',
      value: stats.transactionCount.toString(),
      label: 'Transactions',
    },
    {
      icon: DollarSign,
      iconClass: 'stat__icon stat__icon--emerald',
      value: `$${stats.income.toFixed(2)}`,
      label: 'Income',
    },
    {
      icon: DollarSign,
      iconClass: 'stat__icon stat__icon--amber',
      value: `$${stats.expenses.toFixed(2)}`,
      label: 'Expenses',
    },
  ]

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
            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#9ca3af', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                February 2026
              </div>
            </div>
            {statsList.map((s) => {
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
