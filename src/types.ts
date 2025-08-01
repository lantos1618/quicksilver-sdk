// --- Enums and Union Types ---

export type AccountType = "Human" | "AgentMain" | "AgentDelegated";
export type TransactionType = "Payment" | "Escrow" | "Stream" | "Scheduled" | "Fund" | "Refund";
export type TransactionState = "Draft" | "Pending" | "Executing" | "Completed" | "Failed" | "Cancelled";
export type StreamRateUnit = "PerSecond" | "PerMinute" | "PerHour" | "PerWord" | "PerToken" | { Custom: string };
export type Currency = "USD" | "USDC" | "EUR" | { Custom: string };

// --- Main Data Models ---

export interface Account {
  id: string;
  name: string;
  account_type: AccountType;
  parent_id?: string | null;
  public_key?: string | null;
  meta: Record<string, any>;
  limits: {
    daily?: number | null;
    per_transaction?: number | null;
    total?: number | null;
  };
  created_at: string; // ISO 8601 DateTime string
  updated_at: string; // ISO 8601 DateTime string
  children: string[];
}

export interface Transaction {
  id: string;
  transaction_type: TransactionType;
  amount: number;
  currency: Currency;
  from: string;
  to?: string | null;
  parent_id?: string | null;
  children: string[];
  state: TransactionState;
  conditions?: any | null; // Placeholder for the future conditional logic schema
  meta: Record<string, any>;
  created_at: string;
  updated_at: string;
  executed_at?: string | null;
}

export interface StreamingTransaction {
  base: Transaction;
  rate: number;
  rate_unit: StreamRateUnit;
  start_time: string;
  end_time?: string | null;
  accumulated: number;
  last_batch: string;
}

// --- API Payload Types ---

export interface CreateAccountPayload {
  name: string;
  account_type: AccountType;
  parent_id?: string;
  public_key?: string;
  meta?: Record<string, any>;
  limits?: {
    daily?: number;
    per_transaction?: number;
    total?: number;
  };
}

export interface CreateTransactionPayload {
  amount: number;
  currency: Currency;
  transaction_type: TransactionType;
  from: string;
  to?: string;
  parent_id?: string;
  meta?: Record<string, any>;
  // This will be added based on your roadmap
  // conditions?: ConditionsPayload;
}

export interface CreateStreamingTransactionPayload {
  rate: number;
  rate_unit: StreamRateUnit;
  start_time?: string;
  end_time?: string;
}

// --- API Response Types ---

export interface StatusResponse {
  status: 'paused' | 'resumed' | 'stopped';
  stream_id: string;
  timestamp: string;
}

// --- Real-time Event Types (from docs/streaming_api.md) ---

export interface SSEStreamEvent {
  stream_id: string;
  event_type: 'streamstarted' | 'paused' | 'resumed' | 'stopped' | 'completed';
  timestamp: string;
}

export interface SSEBatchCreatedEvent {
  stream_id: string;
  batch_transaction_id: string;
  amount: number;
  timestamp: string;
}

// --- Error Types ---

export interface APIError {
  error: string;
  message: string;
  status_code: number;
  details?: Record<string, any>;
}

// --- Pagination Types ---

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
    next_cursor?: string;
  };
} 