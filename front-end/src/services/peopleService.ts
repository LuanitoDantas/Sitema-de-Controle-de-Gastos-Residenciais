import apiClient from '../config/api';
import type { Person } from '../types';

/**
 * Fetches all registered people from the API.
 */
export async function getAllPeople(): Promise<Person[]> {
  const response = await apiClient.get<Person[]>('/people');
  return response.data;
}

/**
 * Creates a new person record in the API.
 * @param name - Full name of the person.
 * @param age  - Age must be a positive integer (enforced by the form).
 */
export async function createPerson(name: string, age: number): Promise<Person> {
  const response = await apiClient.post<Person>('/people', { name, age });
  return response.data;
}

/**
 * Deletes a person by ID.
 * Note: the API handles cascade deletion of transactions linked to this person.
 */
export async function deletePerson(id: string): Promise<void> {
  await apiClient.delete(`/people/${id}`);
}
