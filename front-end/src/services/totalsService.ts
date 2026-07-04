import apiClient from '../config/api';
import type { TotalsResponse } from '../types';

/**
 * Fetches aggregated income/expense totals for all people plus a grand total.
 * The API computes these values server-side from the transactions table.
 */
export async function getTotals(): Promise<TotalsResponse> {
  const response = await apiClient.get<TotalsResponse>('/totals');
  return response.data;
}
