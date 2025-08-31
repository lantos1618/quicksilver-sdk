import { HttpClient } from '../http';

export interface KycInitiatePayload {
  account_id: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth?: string;
  address?: {
    street: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  };
}

export interface KycStatus {
  account_id: string;
  status: 'pending' | 'in_review' | 'verified' | 'rejected';
  verified_at?: string;
  rejection_reason?: string;
  kyc_provider?: string;
  kyc_data?: Record<string, any>;
}

export interface KycInitiateResponse {
  success: boolean;
  verification_url?: string;
  session_id?: string;
  message?: string;
}

/**
 * KYC (Know Your Customer) resource for identity verification.
 * Note: KYC functionality is currently in development in the Engine.
 */
export class KycResource {
  constructor(private httpClient: HttpClient) {}

  /**
   * Initiate KYC verification for an account.
   * @param payload - The KYC initiation details.
   */
  async initiate(payload: KycInitiatePayload): Promise<KycInitiateResponse> {
    return this.httpClient.post<KycInitiateResponse>('/kyc/initiate', payload);
  }

  /**
   * Get KYC status for an account.
   * @param accountId - The ID of the account.
   */
  async getStatus(accountId: string): Promise<KycStatus> {
    return this.httpClient.get<KycStatus>(`/kyc/status/${accountId}`);
  }

  /**
   * Process KYC webhook (internal use).
   * This is typically called by the KYC provider's webhook system.
   * @param webhookData - The webhook payload from the KYC provider.
   * @private
   */
  async processWebhook(webhookData: any): Promise<{ success: boolean }> {
    return this.httpClient.post<{ success: boolean }>('/kyc/webhook', webhookData);
  }
}