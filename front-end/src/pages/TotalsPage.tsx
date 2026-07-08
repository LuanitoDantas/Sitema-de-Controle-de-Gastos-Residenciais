import { useState, useEffect } from 'react';
import { getTotals } from '../services/totalsService';
import type { TotalsResponse } from '../types';

/** Formats a number as Brazilian Real currency. */
function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Determines the CSS class for a balance value.
 * - Positive balance → green  (more income than expenses)
 * - Negative balance → red    (expenses exceed income)
 * - Zero balance     → neutral gray
 */
function balanceClass(balance: number): string {
  if (balance > 0) return 'amount-positive';
  if (balance < 0) return 'amount-negative';
  return 'amount-neutral';
}

export default function TotalsPage() {
  const [totals, setTotals] = useState<TotalsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTotals()
      .then(setTotals)
      .catch(() => setError('Erro ao carregar totais.'));
  }, []);

  return (
    <main>
      <header className="page-header">
        <span className="page-eyebrow">Totais</span>
        <h1>Panorama financeiro</h1>
        <p className="page-subtitle">Receitas, despesas e saldo, por pessoa e no total da casa.</p>
      </header>

      {error && <p className="message-banner error">{error}</p>}

      {!error && !totals && <p className="page-subtitle">Carregando…</p>}

      {totals && (
        <>
          {/* Stat tiles — headline figures for the whole household */}
          <div className="stat-grid">
            <div className="stat-tile">
              <span className="stat-label">
                <span className="stat-dot" style={{ backgroundColor: 'var(--good)' }} />
                Receita total
              </span>
              <div className="stat-value amount-positive">{formatBRL(totals.grandTotal.totalIncome)}</div>
            </div>
            <div className="stat-tile">
              <span className="stat-label">
                <span className="stat-dot" style={{ backgroundColor: 'var(--critical)' }} />
                Despesa total
              </span>
              <div className="stat-value amount-negative">{formatBRL(totals.grandTotal.totalExpenses)}</div>
            </div>
            <div className="stat-tile">
              <span className="stat-label">
                <span className="stat-dot" style={{ backgroundColor: 'var(--primary)' }} />
                Saldo geral
              </span>
              <div className={`stat-value ${balanceClass(totals.grandTotal.balance)}`}>
                {formatBRL(totals.grandTotal.balance)}
              </div>
            </div>
          </div>

          {/* Per-person breakdown */}
          {totals.people.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20V10M12 20V4M6 20v-6" />
                </svg>
              </span>
              <p>Nenhum dado disponível ainda.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Total receitas</th>
                    <th>Total despesas</th>
                    <th>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {totals.people.map((pt) => (
                    <tr key={pt.personId}>
                      <td>{pt.name}</td>
                      <td>{formatBRL(pt.totalIncome)}</td>
                      <td>{formatBRL(pt.totalExpenses)}</td>
                      <td className={balanceClass(pt.balance)}>{formatBRL(pt.balance)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total geral</td>
                    <td>{formatBRL(totals.grandTotal.totalIncome)}</td>
                    <td>{formatBRL(totals.grandTotal.totalExpenses)}</td>
                    <td className={balanceClass(totals.grandTotal.balance)}>
                      {formatBRL(totals.grandTotal.balance)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
