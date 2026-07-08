import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { getAllPeople, createPerson, deletePerson } from '../services/peopleService';
import type { Person } from '../types';

/** Derives a two-letter avatar initial from a person's full name. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  /** Loads the current list of people from the API on mount. */
  useEffect(() => {
    fetchPeople();
  }, []);

  async function fetchPeople() {
    try {
      const data = await getAllPeople();
      setPeople(data);
    } catch {
      showMessage('Erro ao carregar pessoas.', true);
    }
  }

  function showMessage(text: string, isError: boolean) {
    setMessage({ text, isError });
    setTimeout(() => setMessage(null), 4000);
  }

  async function handleAddPerson(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !age) return;

    setLoading(true);
    try {
      await createPerson(name.trim(), Number(age));
      setName('');
      setAge('');
      showMessage('Pessoa adicionada com sucesso!', false);
      await fetchPeople();
    } catch {
      showMessage('Erro ao adicionar pessoa.', true);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Deletes a person after user confirmation.
   * Note: the API handles cascade deletion of transactions linked to this person.
   */
  async function handleDelete(person: Person) {
    const confirmed = window.confirm(
      `Deseja excluir "${person.name}"? Esta ação também removerá todas as transações vinculadas.`,
    );
    if (!confirmed) return;

    try {
      await deletePerson(person.id);
      showMessage(`"${person.name}" excluído com sucesso.`, false);
      await fetchPeople();
    } catch {
      showMessage('Erro ao excluir pessoa.', true);
    }
  }

  return (
    <main>
      <header className="page-header">
        <span className="page-eyebrow">Pessoas</span>
        <h1>Quem faz parte da casa</h1>
        <p className="page-subtitle">Cadastre as pessoas para depois vincular receitas e despesas a cada uma.</p>
      </header>

      {message && (
        <p className={`message-banner ${message.isError ? 'error' : 'success'}`}>{message.text}</p>
      )}

      {/* Add Person Form */}
      <section className="card">
        <h2>Adicionar pessoa</h2>
        <form onSubmit={handleAddPerson} className="form-row" style={{ alignItems: 'flex-end' }}>
          <div className="form-field">
            <label className="form-label" htmlFor="person-name">Nome</label>
            <input
              id="person-name"
              type="text"
              placeholder="Ex: Maria Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <div className="form-field" style={{ flex: '0 1 120px' }}>
            <label className="form-label" htmlFor="person-age">Idade</label>
            <input
              id="person-age"
              type="number"
              placeholder="30"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
              min={1}
              className="form-input"
            />
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Adicionando…' : 'Adicionar'}
          </button>
        </form>
      </section>

      {/* People Table */}
      <section style={{ marginTop: '1.5rem' }}>
        <h2>Lista de pessoas</h2>
        {people.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              </svg>
            </span>
            <p>Nenhuma pessoa cadastrada ainda.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pessoa</th>
                  <th>Idade</th>
                  <th>ID</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr key={person.id}>
                    <td>
                      <div className="person-cell">
                        <span className="avatar" aria-hidden="true">{initials(person.name)}</span>
                        {person.name}
                      </div>
                    </td>
                    <td>{person.age} anos</td>
                    <td className="cell-muted">{person.id}</td>
                    <td>
                      <button
                        onClick={() => handleDelete(person)}
                        className="btn btn-danger"
                      >
                        Excluir
                      </button>
                    </td>
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
