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
    <main style={{ padding: '2rem' }}>
      <h1>Transações</h1>

      {message && (
        <p
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '4px',
            backgroundColor: message.isError ? '#fdecea' : '#e8f5e9',
            color: message.isError ? '#b71c1c' : '#1b5e20',
            marginBottom: '1rem',
          }}
        >
          {message.text}
        </p>
      )}

      {/* Add Transaction Form */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Adicionar Transação</h2>
        <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '480px' }}>
          <input
            type="text"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="form-input"
          />

          <input
            type="number"
            placeholder="Valor (R$)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            min="0.01"
            step="0.01"
            className="form-input"
          />

          {/* Person selector */}
          <div>
            <label htmlFor="person-select" style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
              Pessoa
            </label>
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
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>Tipo</label>

            {/* Business rule warning shown when the selected person is under 18 */}
            {isMinor && (
              <p style={{ color: '#e65100', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                Menor de idade: apenas despesas permitidas
              </p>
            )}

            <label style={{ marginRight: '1.5rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="type"
                value="expense"
                checked={type === 'expense'}
                onChange={() => setType('expense')}
                style={{ marginRight: '0.3rem' }}
              />
              Despesa
            </label>

            <label
              style={{
                cursor: isMinor ? 'not-allowed' : 'pointer',
                opacity: isMinor ? 0.4 : 1,
              }}
            >
              <input
                type="radio"
                name="type"
                value="income"
                checked={type === 'income'}
                onChange={() => setType('income')}
                disabled={isMinor}
                style={{ marginRight: '0.3rem' }}
              />
              Receita
            </label>
          </div>

          <button type="submit" disabled={loading || people.length === 0} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            {loading ? 'Adicionando...' : 'Adicionar'}
          </button>
        </form>
      </section>

      {/* Transactions Table */}
      <section>
        <h2>Lista de Transações</h2>
        {transactions.length === 0 ? (
          <p>Nenhuma transação registrada.</p>
        ) : (
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
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        backgroundColor: tx.type === 'income' ? '#e8f5e9' : '#fdecea',
                        color: tx.type === 'income' ? '#2e7d32' : '#c62828',
                      }}
                    >
                      {tx.type === 'income' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td>{resolvePersonName(tx.personId)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
