// Main client export
export { QuicksilverClient } from './client';
export type { ClientOptions } from './client';

// Resource classes
export { AccountsResource } from './resources/accounts';
export { TransactionsResource } from './resources/transactions';
export { StreamsResource } from './resources/streams';

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
  Account,
  Transaction,
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