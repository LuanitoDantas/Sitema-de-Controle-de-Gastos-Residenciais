export interface Person {
  id: string;
  name: string;
  age: number;
}

export interface Transaction {
  id: string;
  description: string;
  value: number;
  type: 'expense' | 'income';
  personId: string;
}

export interface PersonTotals {
  personId: string;
  name: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface TotalsResponse {
  people: PersonTotals[];
  grandTotal: {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
  };
}
