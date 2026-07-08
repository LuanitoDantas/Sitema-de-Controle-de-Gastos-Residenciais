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
        <span className="navbar-brand">
          <span className="navbar-brand-mark" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </span>
          Controle de Gastos
        </span>
        <div className="navbar-links">
          <NavLink to="/people">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Pessoas
          </NavLink>
          <NavLink to="/transactions">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
            Transações
          </NavLink>
          <NavLink to="/totais">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10M12 20V4M6 20v-6" />
            </svg>
            Totais
          </NavLink>
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
