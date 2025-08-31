import { HttpClient } from '../http';
import type { 
  Account as AccountData, 
  CreateAccountPayload, 
  PaginationParams, 
  PaginatedResponse 
} from '../types';
import { Account } from '../models/account';

export class AccountsResource {
  constructor(private httpClient: HttpClient) {}

  /**
   * Create a new account.
   * @param payload - The details of the account to create.
   */
  async create(payload: CreateAccountPayload): Promise<Account> {
    // Set root accounts (no parent_id) as verified by default
    const enhancedPayload = {
      ...payload,
      verification: payload.verification || {
        status: !payload.parent_id ? 'verified' : 'unverified',
        verified_at: !payload.parent_id ? new Date().toISOString() : undefined,
        kyc_data: !payload.parent_id ? {
          verified_by: 'system',
          document_type: 'root_account'
        } : undefined
      }
    };

    const accountData = await this.httpClient.post<AccountData>('/accounts', enhancedPayload);
    return new Account(accountData, this.httpClient);
  }

  /**
   * Retrieve an account by its ID.
   * @param id - The ID of the account to retrieve.
   */
  async retrieve(id: string): Promise<Account> {
    const accountData = await this.httpClient.get<AccountData>(`/accounts/${id}`);
    return new Account(accountData, this.httpClient);
  }

  /**
   * List all accounts with optional pagination.
   * @param params - Pagination parameters.
   */
  async list(params?: PaginationParams): Promise<PaginatedResponse<Account>> {
    const response = await this.httpClient.get<PaginatedResponse<AccountData>>('/accounts', params);
    return {
      ...response,
      data: response.data.map(accountData => new Account(accountData, this.httpClient))
    };
  }

  /**
   * Update an account.
   * @param id - The ID of the account to update.
   * @param payload - The updated account details.
   */
  async update(id: string, payload: Partial<CreateAccountPayload>): Promise<Account> {
    const accountData = await this.httpClient.put<AccountData>(`/accounts/${id}`, payload);
    return new Account(accountData, this.httpClient);
  }

  /**
   * Delete an account.
   * @param id - The ID of the account to delete.
   */
  async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/accounts/${id}`);
  }

  /**
   * Get all child accounts of a parent account.
   * @param parentId - The ID of the parent account.
   * @param params - Pagination parameters.
   */
  async getChildren(parentId: string, params?: PaginationParams): Promise<PaginatedResponse<Account>> {
    const response = await this.httpClient.get<PaginatedResponse<AccountData>>(`/accounts/${parentId}/children`, params);
    return {
      ...response,
      data: response.data.map(accountData => new Account(accountData, this.httpClient))
    };
  }
} 