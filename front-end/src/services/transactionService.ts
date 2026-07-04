import apiClient from '../config/api';
import type { Transaction } from '../types';

/**
 * Fetches all transactions from the API.
 */
export async function getAllTransactions(): Promise<Transaction[]> {
  const response = await apiClient.get<Transaction[]>('/transactions');
  return response.data;
}

/**
 * Creates a new transaction linked to a specific person.
 * @param description - Human-readable description of the transaction.
 * @param value       - Monetary amount (must be > 0, validated by the form).
 * @param type        - 'income' or 'expense'. The frontend restricts under-18
 *                      persons to 'expense' only before this call is made.
 * @param personId    - ID of the person this transaction belongs to.
 */
export async function createTransaction(
  description: string,
  value: number,
  type: 'expense' | 'income',
  personId: string,
): Promise<Transaction> {
  const response = await apiClient.post<Transaction>('/transactions', {
    description,
    value,
    type,
    personId,
  });
  return response.data;
}
