import { useState, useEffect } from 'react';
import { getTotals } from '../services/totalsService';
import type { TotalsResponse } from '../types';

/** Formats a number as Brazilian Real currency. */
function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Determines the CSS color for a balance cell.
 * - Positive balance → green  (person has more income than expenses)
 * - Negative balance → red    (expenses exceed income)
 * - Zero balance     → gray   (exactly balanced)
 */
function balanceColor(balance: number): string {
  if (balance > 0) return '#2e7d32';
  if (balance < 0) return '#c62828';
  return '#757575';
}

export default function TotalsPage() {
  const [totals, setTotals] = useState<TotalsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTotals()
      .then(setTotals)
      .catch(() => setError('Erro ao carregar totais.'));
  }, []);

  if (error) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Totais</h1>
        <p style={{ color: '#c62828' }}>{error}</p>
      </main>
    );
  }

  if (!totals) {
    return (
      <main style={{ padding: '2rem' }}>
        <h1>Totais</h1>
        <p>Carregando...</p>
      </main>
    );
  }

  const { people, grandTotal } = totals;

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Totais</h1>

      {people.length === 0 ? (
        <p>Nenhum dado disponível.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Total Receitas</th>
              <th>Total Despesas</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {people.map((pt) => (
              <tr key={pt.personId}>
                <td>{pt.name}</td>
                <td>{formatBRL(pt.totalIncome)}</td>
                <td>{formatBRL(pt.totalExpenses)}</td>
                {/* Balance color reflects financial standing: green = positive, red = negative, gray = neutral */}
                <td style={{ color: balanceColor(pt.balance), fontWeight: 600 }}>
                  {formatBRL(pt.balance)}
                </td>
              </tr>
            ))}
          </tbody>
          {/* Grand total row styled distinctly to stand out from per-person rows */}
          <tfoot>
            <tr
              style={{
                backgroundColor: '#37474f',
                color: '#ffffff',
                fontWeight: 'bold',
              }}
            >
              <td>Total Geral</td>
              <td>{formatBRL(grandTotal.totalIncome)}</td>
              <td>{formatBRL(grandTotal.totalExpenses)}</td>
              <td style={{ color: balanceColor(grandTotal.balance) }}>
                {formatBRL(grandTotal.balance)}
              </td>
            </tr>
          </tfoot>
        </table>
      )}
    </main>
  );
}
