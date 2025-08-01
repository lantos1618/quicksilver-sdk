// --- Enums and Union Types ---

export type AccountType = "Human" | "AgentMain" | "AgentDelegated";
export type TransactionType = "Payment" | "Escrow" | "Stream" | "Scheduled" | "Fund" | "Refund";
export type TransactionState = "Draft" | "Pending" | "Executing" | "Completed" | "Failed" | "Cancelled";
export type StreamRateUnit = "PerSecond" | "PerMinute" | "PerHour" | "PerWord" | "PerToken" | { Custom: string };
export type Currency = "USD" | "USDC" | "EUR" | { Custom: string };

// --- New DSL Types ---

export enum QuickSilverEvent {
  MilestoneApproved = 'milestone_approved',
  TimeElapsed = 'time_elapsed',
  ApiCallSuccess = 'api_call_success',
  ApiCallFailure = 'api_call_failure',
  PaymentReceived = 'payment_received',
  StreamStarted = 'stream_started',
  StreamStopped = 'stream_stopped',
  Custom = 'custom'
}

export interface Action {
  type: string;
  toJSON(): object;
}

export interface Condition {
  trigger: QuickSilverEvent | ((ctx: any) => boolean);
  predicate?: (ctx: any) => boolean;
  actions: Action[];
}

export interface ProductDefinition {
  id: string;
  pricing: {
    model: 'per_unit' | 'streaming';
    rate: number;
    unit: string;
    currency: Currency;
  };
  guarantees: Record<string, any>;
  workflow: Array<{
    name: string;
    delegateTo: string;
    charge: number;
  }>;
}

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
  verification: {
    status: 'unverified' | 'pending' | 'verified' | 'rejected';
    verified_at?: string | null;
    kyc_data?: {
      document_type?: string;
      document_number?: string;
      verified_by?: string;
    } | null;
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
  conditions?: Condition[] | null; // Now properly typed
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
  verification?: {
    status?: 'unverified' | 'pending' | 'verified' | 'rejected';
    verified_at?: string;
    kyc_data?: {
      document_type?: string;
      document_number?: string;
      verified_by?: string;
    };
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
  conditions?: Condition[]; // Now properly typed
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