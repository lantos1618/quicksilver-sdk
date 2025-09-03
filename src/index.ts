// Main client export
export { QuicksilverClient } from './client';
export type { ClientOptions } from './client';

// Active models
export { Account } from './models/account';
export { Transaction } from './models/transaction';

// Builders (the heart of the fluent DSL)
export { ConditionBuilder } from './builders/condition';
export { ProductBuilder } from './builders/product';
export type { Product } from './builders/product';
export { Action, ActionBuilder } from './builders/action';

// Core types and enums
export { QuickSilverEvent } from './types';

// Resource classes (for advanced usage)
export { AccountsResource } from './resources/accounts';
export { TransactionsResource } from './resources/transactions';
export { StreamsResource } from './resources/streams';
export { AdminResource } from './resources/admin';
export { GatewaysResource } from './resources/gateways';
export { KycResource } from './resources/kyc';
export type { KycInitiatePayload, KycStatus, KycInitiateResponse } from './resources/kyc';

// Real-time functionality
export { StreamConnection } from './realtime/sse';

// Error classes
export {
  QuicksilverError,
  APIErrorResponse,
  NetworkError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
} from './errors';

// Type definitions
export type {
  // Core types
  Account as AccountData,
  Transaction as TransactionData,
  StreamingTransaction,
  AccountType,
  TransactionType,
  TransactionState,
  StreamRateUnit,
  Currency,
  
  // API payloads
  CreateAccountPayload,
  CreateTransactionPayload,
  CreateStreamingTransactionPayload,
  
  // API responses
  StatusResponse,
  
  // Real-time events
  SSEStreamEvent,
  SSEBatchCreatedEvent,
  
  // Error types
  APIError,
  
  // Pagination
  PaginationParams,
  PaginatedResponse,
} from './types';

// HTTP client (for advanced usage)
export { HttpClient } from './http';
export type { RequestOptions, ApiResponse } from './http'; 