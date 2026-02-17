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
      <header className="pageHeader">
        <div className="pageHeader__icon">
          <Tags />
        </div>
        <div className="pageHeader__text">
          <h1 className="pageTitle">Categories</h1>
          <p className="muted">View all transaction categories</p>
        </div>
      </header>

      <section className="panel">
        {loading ? (
          <div className="categoriesLoading">Loading categories...</div>
        ) : (
          <div className="categoriesGrid">
            {categories.map(category => (
              <div key={category.id} className="categoryCard">
                <div className="categoryCard__icon" style={{ backgroundColor: category.color }}>
                  {category.icon}
                </div>
                <div className="categoryCard__body">
                  <h3 className="categoryCard__name">{category.name}</h3>
                  <div className="categoryCard__stats">
                    <span>{category._count.rules} rules</span>
                    <span>•</span>
                    <span>{category._count.transactions} transactions</span>
                  </div>
                </div>
                {category.isSystem && (
                  <div className="categoryCard__badge">System</div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

