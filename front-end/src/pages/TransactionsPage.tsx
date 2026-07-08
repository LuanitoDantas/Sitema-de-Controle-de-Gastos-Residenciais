import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { getAllTransactions, createTransaction } from '../services/transactionService';
import { getAllPeople } from '../services/peopleService';
import type { Transaction, Person } from '../types';

/** Extracts the backend's error message, falling back to a generic one. */
function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  return fallback;
}

/** Formats a number as Brazilian Real currency (e.g. R$ 1.234,56). */
function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [description, setDescription] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [personId, setPersonId] = useState('');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [txData, peopleData] = await Promise.all([getAllTransactions(), getAllPeople()]);
      setTransactions(txData);
      setPeople(peopleData);
      // Pre-select the first person if available
      if (peopleData.length > 0 && !personId) {
        setPersonId(peopleData[0].id);
      }
    } catch (error) {
      showMessage(getErrorMessage(error, 'Erro ao carregar dados.'), true);
    }
  }

  function showMessage(text: string, isError: boolean) {
    setMessage({ text, isError });
    setTimeout(() => setMessage(null), 4000);
  }

  /**
   * Business rule: a person under 18 years old is not allowed to have income
   * transactions. Only expenses are permitted for minors.
   * This is enforced on the frontend by disabling the 'income' option and
   * resetting the type to 'expense' whenever such a person is selected.
   */
  const selectedPerson = people.find((p) => p.id === personId) ?? null;
  const isMinor = selectedPerson !== null && selectedPerson.age < 18;

  function handlePersonChange(newPersonId: string) {
    setPersonId(newPersonId);
    const person = people.find((p) => p.id === newPersonId);
    // Enforce minor restriction: reset type to 'expense' if selected person is under 18
    if (person && person.age < 18) {
      setType('expense');
    }
  }

  async function handleAddTransaction(e: FormEvent) {
    e.preventDefault();
    if (!description.trim() || !value || !personId) return;

    const numericValue = parseFloat(value);
    if (numericValue <= 0) {
      showMessage('O valor deve ser maior que zero.', true);
      return;
    }

    setLoading(true);
    try {
      await createTransaction(description.trim(), numericValue, type, personId);
      setDescription('');
      setValue('');
      setType('expense');
      showMessage('Transação adicionada com sucesso!', false);
      const txData = await getAllTransactions();
      setTransactions(txData);
    } catch (error) {
      showMessage(getErrorMessage(error, 'Erro ao adicionar transação.'), true);
    } finally {
      setLoading(false);
    }
  }

  /** Resolves a person's display name from the in-memory people list. */
  function resolvePersonName(pId: string): string {
    return people.find((p) => p.id === pId)?.name ?? '—';
  }

  return (
    <main>
      <header className="page-header">
        <span className="page-eyebrow">Transações</span>
        <h1>Receitas e despesas</h1>
        <p className="page-subtitle">Registre cada movimentação financeira e vincule à pessoa responsável.</p>
      </header>

      {message && (
        <p className={`message-banner ${message.isError ? 'error' : 'success'}`}>{message.text}</p>
      )}

      {/* Add Transaction Form */}
      <section className="card">
        <h2>Adicionar transação</h2>
        <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', maxWidth: '520px' }}>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label" htmlFor="tx-description">Descrição</label>
              <input
                id="tx-description"
                type="text"
                placeholder="Ex: Supermercado"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-field">
              <label className="form-label" htmlFor="tx-value">Valor (R$)</label>
              <input
                id="tx-value"
                type="number"
                placeholder="0,00"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                min="0.01"
                step="0.01"
                className="form-input"
              />
            </div>
          </div>

          {/* Person selector */}
          <div className="form-field">
            <label className="form-label" htmlFor="person-select">Pessoa</label>
            <select
              id="person-select"
              value={personId}
              onChange={(e) => handlePersonChange(e.target.value)}
              required
              className="form-input"
            >
              {people.length === 0 && <option value="">Nenhuma pessoa cadastrada</option>}
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age} anos)
                </option>
              ))}
            </select>
          </div>

          {/* Type selector — income is disabled for minors */}
          <div className="form-field">
            <span className="form-label">Tipo</span>

            {/* Business rule warning shown when the selected person is under 18 */}
            {isMinor && (
              <span className="inline-warning">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <path d="M12 9v4M12 17h.01" />
                </svg>
                Menor de idade: apenas despesas permitidas
              </span>
            )}

            <div className="segmented">
              <label className={`segmented-option expense ${type === 'expense' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={type === 'expense'}
                  onChange={() => setType('expense')}
                />
                Despesa
              </label>

              <label className={`segmented-option income ${type === 'income' ? 'selected' : ''} ${isMinor ? 'disabled' : ''}`}>
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={type === 'income'}
                  onChange={() => setType('income')}
                  disabled={isMinor}
                />
                Receita
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading || people.length === 0} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            {loading ? 'Adicionando…' : 'Adicionar'}
          </button>
        </form>
      </section>

      {/* Transactions Table */}
      <section style={{ marginTop: '1.5rem' }}>
        <h2>Lista de transações</h2>
        {transactions.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 1l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 23l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            </span>
            <p>Nenhuma transação registrada ainda.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Valor</th>
                  <th>Tipo</th>
                  <th>Pessoa</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{tx.description}</td>
                    <td>{formatBRL(tx.value)}</td>
                    <td>
                      <span className={`badge ${tx.type === 'income' ? 'badge-income' : 'badge-expense'}`}>
                        {tx.type === 'income' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                    <td>{resolvePersonName(tx.personId)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
