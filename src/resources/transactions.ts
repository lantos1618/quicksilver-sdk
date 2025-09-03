import { HttpClient } from '../http';
import type { 
  Transaction as TransactionData, 
  CreateTransactionPayload, 
  StreamingTransaction, 
  CreateStreamingTransactionPayload,
  PaginationParams, 
  PaginatedResponse 
} from '../types';
import { Transaction } from '../models/transaction';

export class TransactionsResource {
  constructor(private httpClient: HttpClient) {}

  /**
   * Create a new transaction.
   * @param payload - The details of the transaction.
   */
  async create(payload: CreateTransactionPayload): Promise<Transaction> {
    const transactionData = await this.httpClient.post<TransactionData>('/transactions', payload);
    return new Transaction(transactionData, this.httpClient);
  }

  /**
   * Retrieve a transaction by its ID.
   * @param id - The ID of the transaction.
   */
  async retrieve(id: string): Promise<Transaction> {
    const transactionData = await this.httpClient.get<TransactionData>(`/transactions/${id}`);
    return new Transaction(transactionData, this.httpClient);
  }

  /**
   * List all transactions with optional pagination and filtering.
   * @param params - Pagination parameters and optional filters.
   */
  async list(params?: PaginationParams & {
    from?: string;
    to?: string;
    transaction_type?: string;
    state?: string;
  }): Promise<PaginatedResponse<Transaction>> {
    const response = await this.httpClient.get<PaginatedResponse<TransactionData>>('/transactions', params);
    return {
      ...response,
      data: response.data.map(txData => new Transaction(txData, this.httpClient))
    };
  }

  /**
   * Update a transaction.
   * @param id - The ID of the transaction to update.
   * @param payload - The updated transaction details.
   */
  async update(id: string, payload: Partial<CreateTransactionPayload>): Promise<Transaction> {
    const transactionData = await this.httpClient.put<TransactionData>(`/transactions/${id}`, payload);
    return new Transaction(transactionData, this.httpClient);
  }

  /**
   * Delete a transaction.
   * @param id - The ID of the transaction to delete.
   */
  async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/transactions/${id}`);
  }

  /**
   * Get all child transactions of a parent transaction.
   * @param parentId - The ID of the parent transaction.
   * @param params - Pagination parameters.
   */
  async getChildren(parentId: string, params?: PaginationParams): Promise<PaginatedResponse<Transaction>> {
    const response = await this.httpClient.get<PaginatedResponse<TransactionData>>(`/transactions/${parentId}/children`, params);
    return {
      ...response,
      data: response.data.map(transactionData => new Transaction(transactionData, this.httpClient))
    };
  }

  /**
   * Execute a transaction through a gateway.
   * @param transactionId - The ID of the transaction to execute.
   * @param gatewayId - The ID of the gateway to use.
   */
  async execute(transactionId: string, gatewayId: string): Promise<TransactionData> {
    return this.httpClient.post<TransactionData>(`/transactions/${transactionId}/execute`, { gateway_id: gatewayId });
  }

  /**
   * Converts a base transaction into a streaming transaction.
   * @param baseTransactionId - The ID of the transaction to convert into a stream.
   * @param payload - The configuration for the stream.
   */
  async createStream(baseTransactionId: string, payload: CreateStreamingTransactionPayload): Promise<StreamingTransaction> {
    // Note: The payload in the backend has base_transaction_id, we simplify it here.
    const apiPayload = { ...payload, base_transaction_id: baseTransactionId };
    return this.httpClient.post<StreamingTransaction>(`/transactions/${baseTransactionId}/stream`, apiPayload);
  }

  /**
   * Get all transactions for a specific account.
   * @param accountId - The ID of the account.
   * @param params - Pagination parameters and optional filters.
   */
  async getForAccount(accountId: string, params?: PaginationParams & {
    transaction_type?: string;
    state?: string;
  }): Promise<PaginatedResponse<Transaction>> {
    const response = await this.httpClient.get<PaginatedResponse<TransactionData>>(`/accounts/${accountId}/transactions`, params);
    return {
      ...response,
      data: response.data.map(transactionData => new Transaction(transactionData, this.httpClient))
    };
  }
} 