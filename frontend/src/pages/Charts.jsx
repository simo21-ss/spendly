import { BarChart3, TrendingUp } from 'lucide-react'

export default function ChartsPage() {
  return (
    <div className="page">
      <header className="page__header">
        <div className="page__header-icon">
          <BarChart3 />
        </div>
        <div className="page__header-text">
          <h1 className="page__title">Charts & Analytics</h1>
          <p className="page__subtitle">Visual insights into your spending patterns.</p>
        </div>
      </header>

      <section className="section">
        <div className="section__header">
          <h2 className="section__title"><TrendingUp /> Planned charts</h2>
        </div>
        <ul className="bullet-list">
          <li>Spending breakdown by category</li>
          <li>Monthly trend lines</li>
          <li>Income vs. expenses comparison</li>
        </ul>
      </section>
    </div>
  )
}
