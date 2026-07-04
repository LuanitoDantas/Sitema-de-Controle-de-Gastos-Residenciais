import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { getAllPeople, createPerson, deletePerson } from '../services/peopleService';
import type { Person } from '../types';

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
    <main style={{ padding: '2rem' }}>
      <h1>Pessoas</h1>

      {/* Inline feedback message */}
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

      {/* Add Person Form */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Adicionar Pessoa</h2>
        <form onSubmit={handleAddPerson} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="form-input"
          />
          <input
            type="number"
            placeholder="Idade"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            min={1}
            className="form-input"
            style={{ width: '100px' }}
          />
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Adicionando...' : 'Adicionar'}
          </button>
        </form>
      </section>

      {/* People Table */}
      <section>
        <h2>Lista de Pessoas</h2>
        {people.length === 0 ? (
          <p>Nenhuma pessoa cadastrada.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Idade</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person) => (
                <tr key={person.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#555' }}>{person.id}</td>
                  <td>{person.name}</td>
                  <td>{person.age}</td>
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
        )}
      </section>
    </main>
  );
}
