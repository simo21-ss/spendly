import { useEffect, useMemo, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { BarChart3, TrendingUp, PieChart, LineChart } from 'lucide-react'
import { getAllTransactions, getCategories } from '../api/client'
import './Charts.css'

const PALETTE = ['#059669', '#0891b2', '#10b981', '#22d3ee', '#64748b', '#94a3b8', '#0f766e', '#f97316']

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
})

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric'
})

const toMonthKey = (dateString) => {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return null
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const toMonthLabel = (monthKey) => {
  const [year, month] = monthKey.split('-')
  return monthFormatter.format(new Date(Number(year), Number(month) - 1, 1))
}

export default function ChartsPage() {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [categoryData, transactionData] = await Promise.all([
          getCategories(),
          getAllTransactions({ sortBy: 'date', sortOrder: 'asc' })
        ])
        if (!isMounted) return
        setCategories(categoryData || [])
        setTransactions(transactionData || [])
      } catch (err) {
        if (!isMounted) return
        setError(err.message)
      } finally {
        if (!isMounted) return
        setLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [])

  const categoryLookup = useMemo(() => {
    const lookup = new Map()
    categories.forEach((category, index) => {
      lookup.set(category.id, {
        name: category.name,
        color: category.color || PALETTE[index % PALETTE.length]
      })
    })
    return lookup
  }, [categories])

  const expenseTransactions = useMemo(
    () => transactions.filter((transaction) => typeof transaction.amount === 'number' && transaction.amount < 0),
    [transactions]
  )

  const incomeTransactions = useMemo(
    () => transactions.filter((transaction) => typeof transaction.amount === 'number' && transaction.amount > 0),
    [transactions]
  )

  const categoryTotals = useMemo(() => {
    const totals = new Map()
    expenseTransactions.forEach((transaction) => {
      const categoryId = transaction.categoryId || 'uncategorized'
      const lookup = categoryLookup.get(categoryId)
      const name = lookup?.name || 'Uncategorized'
      const color = lookup?.color || '#64748b'
      const current = totals.get(categoryId) || {
        id: categoryId,
        name,
        value: 0,
        itemStyle: { color, borderWidth: 0 }
      }
      current.value += Math.abs(transaction.amount)
      totals.set(categoryId, current)
    })

    const sorted = Array.from(totals.values()).sort((a, b) => b.value - a.value)
    if (sorted.length <= 8) return sorted

    const top = sorted.slice(0, 8)
    const rest = sorted.slice(8)
    const otherValue = rest.reduce((sum, item) => sum + item.value, 0)
    if (otherValue > 0) {
      top.push({ id: 'other', name: 'Other', value: otherValue, itemStyle: { color: '#94a3b8', borderWidth: 0 } })
    }
    return top
  }, [expenseTransactions, categoryLookup])

  const monthlySpendingLine = useMemo(() => {
    const monthTotals = new Map()
    expenseTransactions.forEach((transaction) => {
      const key = toMonthKey(transaction.date)
      if (!key) return
      const current = monthTotals.get(key) || 0
      monthTotals.set(key, current + Math.abs(transaction.amount))
    })

    const labels = Array.from(monthTotals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key]) => toMonthLabel(key))

    const values = Array.from(monthTotals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => Math.round(value))

    return { labels, values }
  }, [expenseTransactions])

  const incomeExpenseBars = useMemo(() => {
    const monthTotals = new Map()

    transactions.forEach((transaction) => {
      const key = toMonthKey(transaction.date)
      if (!key) return
      const current = monthTotals.get(key) || { income: 0, expenses: 0 }
      if (transaction.amount > 0) current.income += transaction.amount
      if (transaction.amount < 0) current.expenses += Math.abs(transaction.amount)
      monthTotals.set(key, current)
    })

    const labels = Array.from(monthTotals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key]) => toMonthLabel(key))

    const income = Array.from(monthTotals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => Math.round(value.income))

    const expenses = Array.from(monthTotals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => Math.round(value.expenses))

    return { labels, income, expenses }
  }, [transactions])

  const totalSpend = useMemo(
    () => expenseTransactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0),
    [expenseTransactions]
  )

  const totalIncome = useMemo(
    () => incomeTransactions.reduce((sum, transaction) => sum + transaction.amount, 0),
    [incomeTransactions]
  )

  const hasTransactions = transactions.length > 0

  return (
    <div className="page">
      <header className="page__header">
        <div className="page__header-icon">
          <BarChart3 />
        </div>
        <div className="page__header-text">
          <h1 className="page__title">Charts & Analytics</h1>
          <p className="page__subtitle">Visual insights into your spending patterns and cashflow.</p>
        </div>
      </header>

      <section className="section charts-section">
        <div className="section__header">
          <h2 className="section__title"><TrendingUp /> Analytics overview</h2>
          <div className="section__actions">
            <div className="charts-totals">
              <div>
                <p className="charts-totals__label">Total spend</p>
                <p className="charts-totals__value">{currencyFormatter.format(totalSpend)}</p>
              </div>
              <div>
                <p className="charts-totals__label">Total income</p>
                <p className="charts-totals__value charts-totals__value--accent">
                  {currencyFormatter.format(totalIncome)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="loading">
            <div className="loading-spinner" />
            <p>Loading analytics...</p>
          </div>
        )}

        {!loading && error && (
          <div className="alert alert--error">
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && !hasTransactions && (
          <div className="empty-state">
            <BarChart3 className="empty-state__icon" />
            <h3 className="empty-state__title">No analytics yet</h3>
            <p className="empty-state__description">
              Import transactions to unlock spending trends and category insights.
            </p>
          </div>
        )}

        {!loading && !error && hasTransactions && (
          <div className="charts-grid">
            <article className="chart-card chart-card--half">
              <div className="chart-card__header">
                <h3 className="chart-card__title"><PieChart /> Category breakdown</h3>
                <p className="chart-card__meta">Top spending categories</p>
              </div>
              <div className="chart-area chart-area--pie">
                {categoryTotals.length === 0 ? (
                  <div className="chart-empty">No expense data</div>
                ) : (
                  <ReactECharts
                    style={{ height: '100%' }}
                    option={{
                      tooltip: {
                        trigger: 'item',
                        backgroundColor: 'rgba(12, 30, 23, 0.92)',
                        borderWidth: 0,
                        textStyle: { color: '#ffffff', fontFamily: 'var(--font-body)' },
                        formatter: (params) => {
                          const value = currencyFormatter.format(params.value)
                          return `${params.name}<br/>${value}`
                        }
                      },
                      legend: {
                        orient: 'vertical',
                        right: 8,
                        top: 'center',
                        itemWidth: 10,
                        itemHeight: 10,
                        textStyle: { color: '#8a9f97', fontFamily: 'var(--font-body)' }
                      },
                      series: [
                        {
                          type: 'pie',
                          radius: ['60%', '82%'],
                          center: ['36%', '50%'],
                          itemStyle: { borderRadius: 8, borderWidth: 0 },
                          label: { show: false },
                          data: categoryTotals
                        }
                      ]
                    }}
                  />
                )}
              </div>
            </article>

            <article className="chart-card chart-card--half">
              <div className="chart-card__header">
                <h3 className="chart-card__title"><LineChart /> Monthly spending trend</h3>
                <p className="chart-card__meta">Expenses grouped by month</p>
              </div>
              <div className="chart-area chart-area--line">
                {monthlySpendingLine.labels.length === 0 ? (
                  <div className="chart-empty">No expense data</div>
                ) : (
                  <ReactECharts
                    style={{ height: '100%' }}
                    option={{
                      tooltip: {
                        trigger: 'axis',
                        backgroundColor: 'rgba(12, 30, 23, 0.92)',
                        borderWidth: 0,
                        textStyle: { color: '#ffffff', fontFamily: 'var(--font-body)' },
                        formatter: (params) => {
                          const point = params[0]
                          return `${point.axisValue}<br/>${currencyFormatter.format(point.data)}`
                        }
                      },
                      grid: { top: 20, left: 54, right: 24, bottom: 30 },
                      xAxis: {
                        type: 'category',
                        data: monthlySpendingLine.labels,
                        axisLine: { lineStyle: { color: '#edf2ef' } },
                        axisLabel: { color: '#8a9f97', rotate: -15 }
                      },
                      yAxis: {
                        type: 'value',
                        axisLine: { show: false },
                        splitLine: { lineStyle: { color: '#edf2ef' } },
                        axisLabel: {
                          color: '#8a9f97',
                          formatter: (value) => currencyFormatter.format(value)
                        }
                      },
                      series: [
                        {
                          data: monthlySpendingLine.values,
                          type: 'line',
                          smooth: true,
                          symbol: 'circle',
                          symbolSize: 7,
                          lineStyle: { color: '#059669', width: 3 },
                          itemStyle: { color: '#059669' },
                          areaStyle: { color: 'rgba(5, 150, 105, 0.12)' }
                        }
                      ]
                    }}
                  />
                )}
              </div>
            </article>

            <article className="chart-card chart-card--wide">
              <div className="chart-card__header">
                <h3 className="chart-card__title"><TrendingUp /> Income vs expenses</h3>
                <p className="chart-card__meta">Monthly cashflow balance</p>
              </div>
              <div className="chart-area chart-area--bar">
                {incomeExpenseBars.labels.length === 0 ? (
                  <div className="chart-empty">No cashflow data</div>
                ) : (
                  <ReactECharts
                    style={{ height: '100%' }}
                    option={{
                      tooltip: {
                        trigger: 'axis',
                        axisPointer: { type: 'shadow' },
                        backgroundColor: 'rgba(12, 30, 23, 0.92)',
                        borderWidth: 0,
                        textStyle: { color: '#ffffff', fontFamily: 'var(--font-body)' },
                        formatter: (params) => {
                          const lines = params.map((item) => (
                            `${item.seriesName}: ${currencyFormatter.format(item.data)}`
                          ))
                          return `${params[0].axisValue}<br/>${lines.join('<br/>')}`
                        }
                      },
                      legend: {
                        data: ['Income', 'Expenses'],
                        bottom: 0,
                        textStyle: { color: '#8a9f97', fontFamily: 'var(--font-body)' }
                      },
                      grid: { top: 20, left: 54, right: 24, bottom: 40 },
                      xAxis: {
                        type: 'category',
                        data: incomeExpenseBars.labels,
                        axisLine: { lineStyle: { color: '#edf2ef' } },
                        axisLabel: { color: '#8a9f97', rotate: -15 }
                      },
                      yAxis: {
                        type: 'value',
                        axisLine: { show: false },
                        splitLine: { lineStyle: { color: '#edf2ef' } },
                        axisLabel: {
                          color: '#8a9f97',
                          formatter: (value) => currencyFormatter.format(value)
                        }
                      },
                      series: [
                        {
                          name: 'Income',
                          type: 'bar',
                          stack: 'total',
                          data: incomeExpenseBars.income,
                          itemStyle: { color: '#059669', borderRadius: [6, 6, 0, 0] }
                        },
                        {
                          name: 'Expenses',
                          type: 'bar',
                          stack: 'total',
                          data: incomeExpenseBars.expenses,
                          itemStyle: { color: '#0891b2', borderRadius: [6, 6, 0, 0] }
                        }
                      ]
                    }}
                  />
                )}
              </div>
            </article>
          </div>
        )}
      </section>
    </div>
  )
}
