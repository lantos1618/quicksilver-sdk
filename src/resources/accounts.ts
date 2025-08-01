import { HttpClient } from '../http';
import type { 
  Account, 
  CreateAccountPayload, 
  PaginationParams, 
  PaginatedResponse 
} from '../types';

export class AccountsResource {
  constructor(private httpClient: HttpClient) {}

  /**
   * Create a new account.
   * @param payload - The details of the account to create.
   */
  async create(payload: CreateAccountPayload): Promise<Account> {
    return this.httpClient.post<Account>('/accounts', payload);
  }

  /**
   * Retrieve an account by its ID.
   * @param id - The ID of the account to retrieve.
   */
  async retrieve(id: string): Promise<Account> {
    return this.httpClient.get<Account>(`/accounts/${id}`);
  }

  /**
   * List all accounts with optional pagination.
   * @param params - Pagination parameters.
   */
  async list(params?: PaginationParams): Promise<PaginatedResponse<Account>> {
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
    const url = queryString ? `/accounts?${queryString}` : '/accounts';
    
    return this.httpClient.get<PaginatedResponse<Account>>(url);
  }

  /**
   * Update an account.
   * @param id - The ID of the account to update.
   * @param payload - The updated account details.
   */
  async update(id: string, payload: Partial<CreateAccountPayload>): Promise<Account> {
    return this.httpClient.put<Account>(`/accounts/${id}`, payload);
  }

  /**
   * Delete an account.
   * @param id - The ID of the account to delete.
   */
  async delete(id: string): Promise<void> {
    return this.httpClient.delete<void>(`/accounts/${id}`);
  }

  /**
   * Get all child accounts of a parent account.
   * @param parentId - The ID of the parent account.
   * @param params - Pagination parameters.
   */
  async getChildren(parentId: string, params?: PaginationParams): Promise<PaginatedResponse<Account>> {
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
      ? `/accounts/${parentId}/children?${queryString}` 
      : `/accounts/${parentId}/children`;
    
    return this.httpClient.get<PaginatedResponse<Account>>(url);
  }
} 