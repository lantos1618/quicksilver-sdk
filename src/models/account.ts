import { HttpClient } from '../http';
import { Account as AccountData, Transaction as TransactionData, CreateAccountPayload } from '../types';
import { Transaction } from './transaction';
import { Product } from '../builders/product';

export class Account {
  public readonly id: string;
  public data: AccountData;
  private http: HttpClient;

  constructor(data: AccountData, http: HttpClient) {
    this.id = data.id;
    this.data = data;
    this.http = http;
  }

  /**
   * Delegates a new sub-agent from this account.
   */
  async delegate(options: { name: string, limits: { daily: number } }): Promise<Account> {
    const payload: CreateAccountPayload = {
      name: options.name,
      account_type: 'AgentDelegated',
      parent_id: this.id,
      limits: options.limits
    };

    const subAccountData = await this.http.post<AccountData>('/accounts', payload);
    return new Account(subAccountData, this.http);
  }

  /**
   * Creates a new transaction originating from this account.
   * Returns a fluent Transaction object.
   */
  transaction(details: Omit<TransactionData, 'from' | 'id' | 'state' | 'created_at' | 'updated_at' | 'children'>): Transaction {
    const txData: TransactionData = { 
      ...details, 
      from: this.id,
      id: '', // Will be set by the API
      state: 'Draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      children: []
    };
    return new Transaction(txData, this.http);
  }
  
  /**
   * Purchase a programmable product.
   */
  async purchase(product: Product, options: { [key: string]: any }): Promise<Transaction> {
    const txData = await this.http.post<TransactionData>(`/accounts/${this.id}/purchase`, {
      productId: product.id,
      options,
    });
    return new Transaction(txData, this.http);
  }

  /**
   * Refresh the account's data from the server.
   */
  async refresh(): Promise<this> {
    this.data = await this.http.get<AccountData>(`/accounts/${this.id}`);
    return this;
  }

  /**
   * Get child accounts (delegated sub-agents).
   */
  async getChildren(): Promise<Account[]> {
    const childrenData = await this.http.get<AccountData[]>(`/accounts/${this.id}/children`);
    return childrenData.map(data => new Account(data, this.http));
  }

  /**
   * Update account limits.
   */
  async updateLimits(limits: { daily?: number; per_transaction?: number; total?: number }): Promise<this> {
    this.data = await this.http.patch<AccountData>(`/accounts/${this.id}`, { limits });
    return this;
  }

  /**
   * Get account balance (if supported by the API).
   */
  async getBalance(): Promise<{ amount: number; currency: string }> {
    const balance = await this.http.get<{ amount: number; currency: string }>(`/accounts/${this.id}/balance`);
    return balance;
  }
} 