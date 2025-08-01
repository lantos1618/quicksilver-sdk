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
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.cursor) {
      queryParams.append('cursor', params.cursor);
    }
    if (params?.from) {
      queryParams.append('from', params.from);
    }
    if (params?.to) {
      queryParams.append('to', params.to);
    }
    if (params?.transaction_type) {
      queryParams.append('transaction_type', params.transaction_type);
    }
    if (params?.state) {
      queryParams.append('state', params.state);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/transactions?${queryString}` : '/transactions';
    
    const response = await this.httpClient.get<PaginatedResponse<TransactionData>>(url);
    return {
      ...response,
      data: response.data.map(transactionData => new Transaction(transactionData, this.httpClient))
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
    return this.httpClient.delete<void>(`/transactions/${id}`);
  }

  /**
   * Get all child transactions of a parent transaction.
   * @param parentId - The ID of the parent transaction.
   * @param params - Pagination parameters.
   */
  async getChildren(parentId: string, params?: PaginationParams): Promise<PaginatedResponse<Transaction>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.cursor) {
      queryParams.append('cursor', params.cursor);
    }

    const queryString = queryParams.toString();
    const url = queryString 
      ? `/transactions/${parentId}/children?${queryString}` 
      : `/transactions/${parentId}/children`;
    
    const response = await this.httpClient.get<PaginatedResponse<TransactionData>>(url);
    return {
      ...response,
      data: response.data.map(transactionData => new Transaction(transactionData, this.httpClient))
    };
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
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.cursor) {
      queryParams.append('cursor', params.cursor);
    }
    if (params?.transaction_type) {
      queryParams.append('transaction_type', params.transaction_type);
    }
    if (params?.state) {
      queryParams.append('state', params.state);
    }

    const queryString = queryParams.toString();
    const url = queryString 
      ? `/accounts/${accountId}/transactions?${queryString}` 
      : `/accounts/${accountId}/transactions`;
    
    const response = await this.httpClient.get<PaginatedResponse<TransactionData>>(url);
    return {
      ...response,
      data: response.data.map(transactionData => new Transaction(transactionData, this.httpClient))
    };
  }
} 