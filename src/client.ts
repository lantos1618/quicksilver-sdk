import { HttpClient } from './http';
import { AccountsResource } from './resources/accounts';
import { TransactionsResource } from './resources/transactions';
import { StreamsResource } from './resources/streams';
import { AdminResource } from './resources/admin';
import { GatewaysResource } from './resources/gateways';
import { KycResource } from './resources/kyc';
import { ConditionBuilder } from './builders/condition';
import { ProductBuilder } from './builders/product';
import { Account } from './models/account';
import { Transaction } from './models/transaction';

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
  public readonly admin: AdminResource;
  public readonly gateways: GatewaysResource;
  public readonly kyc: KycResource;

  private httpClient: HttpClient;
  private readonly apiKey: string;
  private readonly baseURL: string;

  constructor(apiKey: string, options: ClientOptions = {}) {
    this.apiKey = apiKey;
    this.baseURL = options.baseURL ?? (options.env === 'sandbox'
      ? 'http://localhost:3000'
      : 'https://api.quicksilver.com'); // This should match your actual API host

    this.httpClient = new HttpClient(apiKey, this.baseURL, options.timeout);

    // Initialize resource controllers
    this.accounts = new AccountsResource(this.httpClient);
    this.transactions = new TransactionsResource(this.httpClient);
    this.streams = new StreamsResource(this.httpClient, this.baseURL, this.apiKey);
    this.admin = new AdminResource(this.httpClient);
    this.gateways = new GatewaysResource(this.httpClient);
    this.kyc = new KycResource(this.httpClient);
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
   * Creates an Account object from account data
   */
  createAccount(data: any): Account {
    return new Account(data, this.httpClient);
  }

  /**
   * Creates a Transaction object from transaction data
   */
  createTransaction(data: any): Transaction {
    return new Transaction(data, this.httpClient);
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
  async ping(): Promise<{ pong: boolean; timestamp: string }> {
    return this.httpClient.get<{ pong: boolean; timestamp: string }>('/ping');
  }

  /**
   * Get API health status
   */
  async health(): Promise<{ status: string; version: string; timestamp: string }> {
    return this.httpClient.get<{ status: string; version: string; timestamp: string }>('/health');
  }

  /**
   * Get the OpenAPI specification for the API
   */
  async getOpenApiSpec(): Promise<any> {
    return this.httpClient.get<any>('/openapi.json');
  }
}

// Dummy interface for the query builder example
interface TransactionQuery {
  where(predicate: (t: any) => boolean): this;
  orderBy(field: string, direction: 'asc' | 'desc'): this;
  limit(count: number): this;
} 