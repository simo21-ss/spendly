import { useState, useRef } from 'react'
import { Zap } from 'lucide-react'
import RulesList from '../components/Rules/RulesList'
import RuleForm from '../components/Rules/RuleForm'
import './Rules.css'

export default function RulesPage() {
  const [isCreating, setIsCreating] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const rulesListRef = useRef(null)

  const handleCreateClick = () => {
    setEditingRule(null)
    setIsCreating(true)
  }

  const handleEditClick = (rule) => {
    setEditingRule(rule)
    setIsCreating(true)
  }

  const handleFormClose = () => {
    setIsCreating(false)
    setEditingRule(null)
  }

  const handleFormSuccess = (savedRule) => {
    setIsCreating(false)
    setEditingRule(null)
    if (rulesListRef.current?.addOrUpdateRule) {
      rulesListRef.current.addOrUpdateRule(savedRule)
    }
  }

  return (
    <div className="page">
      <header className="pageHeader">
        <div className="pageHeader__icon">
          <Zap />
        </div>
        <div className="pageHeader__text">
          <h1 className="pageTitle">Categorization Rules</h1>
          <p className="muted">Create and manage automatic transaction categorization rules.</p>
        </div>
      </header>

      <section className="panel">
        <RulesList
          ref={rulesListRef}
          onCreateRule={handleCreateClick}
          onEditRule={handleEditClick}
        />
      </section>

      {isCreating && (
        <RuleForm
          rule={editingRule}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
