import { HttpClient } from './http';
import { AccountsResource } from './resources/accounts';
import { TransactionsResource } from './resources/transactions';
import { StreamsResource } from './resources/streams';
import { ConditionBuilder } from './builders/condition';
import { ProductBuilder } from './builders/product';

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
   * Creates a new Condition builder.
   * This is the entry point for creating all conditional logic.
   * @example
   * client.condition()
   *   .when(Event.ApiCallSuccess)
   *   .then(Action.pay(100));
   */
  condition(): ConditionBuilder {
    return new ConditionBuilder();
  }

  /**
   * Creates a new Product builder.
   * This is the entry point for defining programmable products and services.
   * @example
   * client.product('translation-service')
   *   .charge(0.01, 'per_word')
   *   .guarantee({ quality: 0.98 });
   */
  product(id: string): ProductBuilder {
    return new ProductBuilder(id);
  }

  /**
   * A fluent query builder for finding transactions.
   * (Illustrative - matches the vision doc)
   */
  async findTransactions(query: (t: TransactionQuery) => TransactionQuery) {
    // In a real implementation, this would build and send a query
    console.log('Querying transactions with:', query);
    return [];
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

// Dummy interface for the query builder example
interface TransactionQuery {
  where(predicate: (t: any) => boolean): this;
  orderBy(field: string, direction: 'asc' | 'desc'): this;
  limit(count: number): this;
} 