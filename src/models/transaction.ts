import { HttpClient } from '../http';
import { Transaction as TransactionData } from '../types';
import { ConditionBuilder } from '../builders/condition';

export class Transaction {
  public readonly id: string;
  public data: TransactionData;
  private http: HttpClient;

  constructor(data: TransactionData, http: HttpClient) {
    this.id = data.id;
    this.data = data;
    this.http = http;
  }

  /**
   * Execute the transaction.
   */
  async execute(): Promise<this> {
    if (this.data.state !== 'Draft') {
      throw new Error(`Cannot execute transaction in state: ${this.data.state}`);
    }

    this.data = await this.http.post<TransactionData>(`/transactions/${this.id}/execute`);
    return this;
  }

  /**
   * Cancel the transaction.
   */
  async cancel(): Promise<this> {
    if (this.data.state === 'Completed' || this.data.state === 'Failed') {
      throw new Error(`Cannot cancel transaction in state: ${this.data.state}`);
    }

    this.data = await this.http.post<TransactionData>(`/transactions/${this.id}/cancel`);
    return this;
  }

  /**
   * Trigger an event on this transaction (for conditional logic).
   */
  async triggerEvent(event: string, context: any = {}): Promise<this> {
    this.data = await this.http.post<TransactionData>(`/transactions/${this.id}/trigger`, {
      event,
      context
    });
    return this;
  }

  /**
   * Get the cost of this transaction.
   */
  async getCost(): Promise<number> {
    // For simple transactions, return the amount
    if (this.data.transaction_type === 'Payment' || this.data.transaction_type === 'Escrow') {
      return this.data.amount;
    }

    // For streaming transactions, calculate based on duration
    if (this.data.transaction_type === 'Stream') {
      const streamInfo = await this.http.get<any>(`/transactions/${this.id}/stream-info`);
      return streamInfo.accumulated || 0;
    }

    return this.data.amount;
  }

  /**
   * Refresh the transaction's data from the server.
   */
  async refresh(): Promise<this> {
    this.data = await this.http.get<TransactionData>(`/transactions/${this.id}`);
    return this;
  }

  /**
   * Check if the transaction is in a final state.
   */
  isFinal(): boolean {
    return ['Completed', 'Failed', 'Cancelled'].includes(this.data.state);
  }

  /**
   * Check if the transaction is pending execution.
   */
  isPending(): boolean {
    return ['Draft', 'Pending'].includes(this.data.state);
  }

  /**
   * Get child transactions (for complex transactions with sub-transactions).
   */
  async getChildren(): Promise<Transaction[]> {
    const childrenData = await this.http.get<TransactionData[]>(`/transactions/${this.id}/children`);
    return childrenData.map(data => new Transaction(data, this.http));
  }

  /**
   * Add conditions to the transaction.
   */
  withConditions(conditionBuilder: ConditionBuilder): this {
    this.data.conditions = conditionBuilder.getConditions();
    return this;
  }

  /**
   * Get transaction metadata.
   */
  getMeta(): Record<string, any> {
    return this.data.meta || {};
  }

  /**
   * Update transaction metadata.
   */
  async updateMeta(meta: Record<string, any>): Promise<this> {
    this.data = await this.http.patch<TransactionData>(`/transactions/${this.id}`, { meta });
    return this;
  }
} 