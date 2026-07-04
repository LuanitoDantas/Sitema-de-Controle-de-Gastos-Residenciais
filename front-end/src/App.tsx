import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import PeoplePage from './pages/PeoplePage';
import TransactionsPage from './pages/TransactionsPage';
import TotalsPage from './pages/TotalsPage';

/**
 * Root application component.
 * Sets up client-side routing and renders the fixed top navigation bar.
 */
export default function App() {
  return (
    <BrowserRouter>
      {/* Fixed navbar — NavLink automatically applies the "active" class when the route matches */}
      <nav className="navbar">
        <span className="navbar-brand">Controle de Gastos</span>
        <div className="navbar-links">
          <NavLink to="/people">Pessoas</NavLink>
          <NavLink to="/transactions">Transações</NavLink>
          <NavLink to="/totais">Totais</NavLink>
        </div>
      </nav>

      {/* Page content rendered below the fixed navbar */}
      <div className="page-container">
        <Routes>
          <Route path="/" element={<Navigate to="/people" replace />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/totais" element={<TotalsPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
