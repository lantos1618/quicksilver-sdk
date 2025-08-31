import { HttpClient } from '../http';
import type { Account, Transaction, StreamingTransaction } from '../types';

export interface SystemStats {
  total_accounts: number;
  total_transactions: number;
  active_streams: number;
}

/**
 * Admin resource for administrative operations.
 * These endpoints require admin privileges on the engine.
 */
export class AdminResource {
  constructor(private httpClient: HttpClient) {}

  /**
   * Get system statistics.
   * @returns System statistics including account and transaction counts.
   */
  async getStats(): Promise<SystemStats> {
    return this.httpClient.get<SystemStats>('/admin/stats');
  }

  /**
   * List all accounts in the system.
   * Admin endpoint - requires admin privileges.
   * @returns List of all accounts.
   */
  async listAccounts(): Promise<Account[]> {
    return this.httpClient.get<Account[]>('/admin/accounts');
  }

  /**
   * List all transactions in the system.
   * Admin endpoint - requires admin privileges.
   * @returns List of all transactions.
   */
  async listTransactions(): Promise<Transaction[]> {
    return this.httpClient.get<Transaction[]>('/admin/transactions');
  }

  /**
   * List all active streaming transactions.
   * Admin endpoint - requires admin privileges.
   * @returns List of active streams.
   */
  async listActiveStreams(): Promise<StreamingTransaction[]> {
    return this.httpClient.get<StreamingTransaction[]>('/admin/streams');
  }
}