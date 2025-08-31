import { HttpClient } from '../http';
import { Transaction as TransactionData } from '../types';
import { ConditionBuilder } from '../builders/condition';
import { StreamConnection } from '../realtime/sse';

export class Transaction {
  public readonly id: string;
  public data: TransactionData;
  private http: HttpClient;

  constructor(data: TransactionData, http: HttpClient) {
    this.id = data.id;
    this.data = data;
    this.http = http;
  }

  // Getters for common properties
  get transactionType(): string {
    return this.data.transaction_type;
  }

  get amount(): number {
    return this.data.amount;
  }

  get currency(): string {
    return typeof this.data.currency === 'string' ? this.data.currency : this.data.currency.Custom;
  }

  get from(): string {
    return this.data.from;
  }

  get to(): string | null {
    return this.data.to || null;
  }

  get state(): string {
    return this.data.state;
  }

  get meta(): Record<string, any> {
    return this.data.meta;
  }

  get createdAt(): string {
    return this.data.created_at;
  }

  get updatedAt(): string {
    return this.data.updated_at;
  }

  get executedAt(): string | null {
    return this.data.executed_at || null;
  }

  get children(): string[] {
    return this.data.children;
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

  /**
   * Subscribe to real-time events for this transaction.
   */
  subscribe(): StreamConnection {
    const baseURL = this.http.getBaseURL?.() || 'https://api.quicksilver.com';
    const url = new URL(`${baseURL}/sse/transactions/${this.id}`);
    return new StreamConnection(url);
  }

  /**
   * Get the transaction status.
   */
  getStatus(): string {
    return this.data.state;
  }

  /**
   * Get transaction metadata (alias for getMeta).
   */
  getMetadata(): Record<string, any> {
    return this.getMeta();
  }

  /**
   * Add metadata to the transaction (fluent interface).
   */
  withMetadata(metadata: Record<string, any>): this {
    this.data.meta = { ...this.data.meta, ...metadata };
    return this;
  }

  /**
   * Add conditional logic to the transaction (fluent interface).
   */
  withCondition(condition: ConditionBuilder): this {
    return this.withConditions(condition);
  }

  /**
   * Convert this transaction to a streaming transaction.
   */
  async toStream(options: { rate: number; rate_unit: string }): Promise<any> {
    const streamData = await this.http.post<any>(`/transactions/${this.id}/stream`, options);
    return streamData;
  }

  /**
   * Start streaming this transaction.
   */
  async startStreaming(rate: number, unit: string): Promise<any> {
    return this.toStream({ rate, rate_unit: unit });
  }

  /**
   * Update the transaction.
   */
  async update(updates: Partial<TransactionData>): Promise<this> {
    this.data = await this.http.put<TransactionData>(`/transactions/${this.id}`, updates);
    return this;
  }

  /**
   * Check if transaction is completed.
   */
  isCompleted(): boolean {
    return this.data.state === 'Completed';
  }

  /**
   * Check if transaction is failed.
   */
  isFailed(): boolean {
    return this.data.state === 'Failed';
  }

  /**
   * Get transaction conditions.
   */
  getConditions(): any {
    return this.data.conditions;
  }

  /**
   * String representation.
   */
  toString(): string {
    return `Transaction(${this.id}, ${this.data.amount} ${this.data.currency}, ${this.data.state})`;
  }
} 