import { HttpClient } from '../http';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version?: string;
  services?: {
    database: 'connected' | 'disconnected';
    redis?: 'connected' | 'disconnected';
  };
}

export interface PingResponse {
  message: string;
  timestamp: string;
}

/**
 * Resource for health check operations
 */
export class HealthResource {
  constructor(private client: HttpClient) {}

  /**
   * Check the health status of the service
   */
  async check(): Promise<HealthStatus> {
    return this.client.get<HealthStatus>('/health');
  }

  /**
   * Ping the service to check if it's responsive
   */
  async ping(): Promise<PingResponse> {
    return this.client.get<PingResponse>('/ping');
  }
}