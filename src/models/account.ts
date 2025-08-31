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

  // Getters for common properties
  get name(): string {
    return this.data.name;
  }

  get accountType(): string {
    return this.data.account_type;
  }

  get parentId(): string | null {
    return this.data.parent_id || null;
  }

  get meta(): Record<string, any> {
    return this.data.meta;
  }

  get limits(): { daily?: number | null; per_transaction?: number | null; total?: number | null } {
    return this.data.limits;
  }

  get createdAt(): string {
    return this.data.created_at;
  }

  get updatedAt(): string {
    return this.data.updated_at;
  }

  get children(): string[] {
    return this.data.children;
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

  /**
   * Check if the account is verified.
   */
  isVerified(): boolean {
    return this.data.verification.status === 'verified';
  }

  /**
   * Check if the account is a root account (no parent).
   */
  isRootAccount(): boolean {
    return !this.data.parent_id;
  }

  /**
   * Submit KYC verification documents.
   */
  async submitKYC(kycData: {
    document_type: string;
    document_number: string;
    document_file?: File | Blob;
  }): Promise<this> {
    const formData = new FormData();
    formData.append('document_type', kycData.document_type);
    formData.append('document_number', kycData.document_number);
    
    if (kycData.document_file) {
      formData.append('document_file', kycData.document_file);
    }

    this.data = await this.http.post<AccountData>(`/accounts/${this.id}/kyc`, formData);
    return this;
  }

  /**
   * Verify the account (admin function - requires special permissions).
   */
  async verify(verifiedBy: string): Promise<this> {
    this.data = await this.http.post<AccountData>(`/accounts/${this.id}/verify`, {
      verified_by: verifiedBy,
      verified_at: new Date().toISOString()
    });
    return this;
  }

  /**
   * Reject verification (admin function - requires special permissions).
   */
  async rejectVerification(reason: string): Promise<this> {
    this.data = await this.http.post<AccountData>(`/accounts/${this.id}/reject-verification`, {
      reason,
      rejected_at: new Date().toISOString()
    });
    return this;
  }

  /**
   * Get verification status and details.
   */
  getVerificationStatus(): {
    status: 'unverified' | 'pending' | 'verified' | 'rejected';
    verified_at?: string | null;
    kyc_data?: {
      document_type?: string;
      document_number?: string;
      verified_by?: string;
    } | null;
  } {
    return this.data.verification;
  }

  /**
   * Check if the account can perform transactions (must be verified).
   */
  canTransact(): boolean {
    return this.isVerified();
  }

  /**
   * Check if the account can delegate to other accounts (must be verified).
   */
  canDelegate(): boolean {
    return this.isVerified();
  }
} 