import { useState, useEffect } from 'react';
import { Tags } from 'lucide-react';
import { getCategories } from '../api/client';
import './Categories.css';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="page__header">
        <div className="page__header-icon">
          <Tags />
        </div>
        <div className="page__header-text">
          <h1 className="page__title">Categories</h1>
          <p className="page__subtitle">View all transaction categories</p>
        </div>
      </header>

      <section className="section">
        {loading ? (
          <div className="loading">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <Tags className="empty-state__icon" />
            <h3 className="empty-state__title">No categories yet</h3>
            <p className="empty-state__description">Categories will appear here as you create and manage them</p>
          </div>
        ) : (
          <div className="card-grid">
            {categories.map(category => (
              <div key={category.id} className="card">
                <div className="card__header">
                  <div className="card__icon card__icon--primary" style={{ backgroundColor: category.color }}>
                    {category.icon}
                  </div>
                  <div className="card__content">
                    <h3 className="card__title">{category.name}</h3>
                    <p className="card__description">
                      {category._count.rules} rules • {category._count.transactions} transactions
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

