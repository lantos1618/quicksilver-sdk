import { HttpClient } from './http';
import { AccountsResource } from './resources/accounts';
import { TransactionsResource } from './resources/transactions';
import { StreamsResource } from './resources/streams';

export interface ClientOptions {
  /** The API environment to use. Defaults to 'production'. */
  env?: 'production' | 'sandbox';
  /** Override the default base URL. */
  baseURL?: string;
  /** Request timeout in milliseconds. Defaults to 30000 (30 seconds). */
  timeout?: number;
}

export class QuicksilverClient {
  public readonly accounts: AccountsResource;
  public readonly transactions: TransactionsResource;
  public readonly streams: StreamsResource;

  private httpClient: HttpClient;
  private readonly apiKey: string;
  private readonly baseURL: string;

  constructor(apiKey: string, options: ClientOptions = {}) {
    if (!apiKey) {
      throw new Error('Quicksilver API key is required.');
    }

    this.apiKey = apiKey;
    this.baseURL = options.baseURL ?? (options.env === 'sandbox'
      ? 'https://sandbox.api.quicksilver.com'
      : 'https://api.quicksilver.com'); // This should match your actual API host

    this.httpClient = new HttpClient(apiKey, this.baseURL, options.timeout);

    // Initialize resource controllers
    this.accounts = new AccountsResource(this.httpClient);
    this.transactions = new TransactionsResource(this.httpClient);
    this.streams = new StreamsResource(this.httpClient, this.baseURL, this.apiKey);
  }

  /**
   * Get the current API key (masked for security)
   */
  getApiKey(): string {
    if (this.apiKey.length <= 8) {
      return '*'.repeat(this.apiKey.length);
    }
    return this.apiKey.substring(0, 4) + '*'.repeat(this.apiKey.length - 8) + this.apiKey.substring(this.apiKey.length - 4);
  }

  /**
   * Get the base URL being used for API requests
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Test the API connection
   */
  async ping(): Promise<{ status: string; timestamp: string }> {
    return this.httpClient.get<{ status: string; timestamp: string }>('/ping');
  }

  /**
   * Get API health status
   */
  async health(): Promise<{ status: string; version: string; uptime: number }> {
    return this.httpClient.get<{ status: string; version: string; uptime: number }>('/health');
  }
} 