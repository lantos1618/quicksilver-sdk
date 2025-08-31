import { HttpClient } from '../http';

export interface GatewayInfo {
  name: string;
  type: string;
  enabled: boolean;
  supported_currencies?: string[];
}

export interface GatewayTransaction {
  id: string;
  gateway: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  external_id?: string;
  error?: string;
  created_at: string;
  completed_at?: string;
}

/**
 * Gateways resource for payment gateway operations.
 */
export class GatewaysResource {
  constructor(private httpClient: HttpClient) {}

  /**
   * List available payment gateways.
   * @returns List of available payment gateways.
   */
  async list(): Promise<GatewayInfo[]> {
    const response = await this.httpClient.get<{ gateways: GatewayInfo[], count: number }>('/gateways');
    return response.gateways;
  }

  /**
   * Execute a transaction through a payment gateway.
   * @param transactionId - The ID of the transaction to execute.
   * @returns The gateway transaction result.
   */
  async executeTransaction(transactionId: string): Promise<GatewayTransaction> {
    return this.httpClient.post<GatewayTransaction>(
      `/transactions/${transactionId}/gateway/execute`, 
      {}
    );
  }
}