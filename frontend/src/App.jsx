import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/Layout/MainLayout'
import CategoriesPage from './pages/Categories'
import ChartsPage from './pages/Charts'
import Home from './pages/Home'
import ImportPage from './pages/Import'
import RulesPage from './pages/Rules'
import TransactionsPage from './pages/Transactions'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/charts" element={<ChartsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/rules" element={<RulesPage />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
