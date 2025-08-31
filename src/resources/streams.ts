import { HttpClient } from '../http';
import { StreamConnection } from '../realtime/sse';
import type { 
  StreamingTransaction, 
  StatusResponse, 
  PaginationParams,
  PaginatedResponse
} from '../types';

export class StreamsResource {
  constructor(
    private httpClient: HttpClient, 
    private baseURL: string,
    private apiKey: string
  ) {}

  /**
   * Retrieve the current state of a streaming transaction.
   * @param id - The ID of the stream.
   */
  async retrieve(id: string): Promise<StreamingTransaction> {
    return this.httpClient.get<StreamingTransaction>(`/streams/${id}`);
  }

  /**
   * List all streaming transactions with optional pagination.
   * @param params - Pagination parameters and optional filters.
   */
  async list(params?: PaginationParams & {
    from?: string;
    to?: string;
    state?: string;
  }): Promise<PaginatedResponse<StreamingTransaction>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.cursor) {
      queryParams.append('cursor', params.cursor);
    }
    if (params?.from) {
      queryParams.append('from', params.from);
    }
    if (params?.to) {
      queryParams.append('to', params.to);
    }
    if (params?.state) {
      queryParams.append('state', params.state);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/streams?${queryString}` : '/streams';
    
    return this.httpClient.get<PaginatedResponse<StreamingTransaction>>(url);
  }

  /**
   * Pause a running stream.
   * @param id - The ID of the stream to pause.
   */
  async pause(id: string): Promise<StatusResponse> {
    return this.httpClient.post<StatusResponse>(`/streams/${id}/pause`);
  }

  /**
   * Resume a paused stream.
   * @param id - The ID of the stream to resume.
   */
  async resume(id: string): Promise<StatusResponse> {
    return this.httpClient.post<StatusResponse>(`/streams/${id}/resume`);
  }

  /**
   * Permanently stop a stream.
   * @param id - The ID of the stream to stop.
   */
  async stop(id: string): Promise<StatusResponse> {
    return this.httpClient.post<StatusResponse>(`/streams/${id}/stop`);
  }

  /**
   * Update stream configuration.
   * @param id - The ID of the stream to update.
   * @param payload - The updated stream configuration.
   */
  async update(id: string, payload: {
    rate?: number;
    rate_unit?: string;
    end_time?: string;
  }): Promise<StreamingTransaction> {
    return this.httpClient.put<StreamingTransaction>(`/streams/${id}`, payload);
  }

  /**
   * Get all streams for a specific account.
   * @param accountId - The ID of the account.
   * @param params - Pagination parameters and optional filters.
   */
  async getForAccount(accountId: string, params?: PaginationParams & {
    state?: string;
  }): Promise<PaginatedResponse<StreamingTransaction>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.cursor) {
      queryParams.append('cursor', params.cursor);
    }
    if (params?.state) {
      queryParams.append('state', params.state);
    }

    const queryString = queryParams.toString();
    const url = queryString 
      ? `/accounts/${accountId}/streams?${queryString}` 
      : `/accounts/${accountId}/streams`;
    
    return this.httpClient.get<PaginatedResponse<StreamingTransaction>>(url);
  }

  /**
   * Subscribe to real-time events for a specific stream.
   * @param id - The ID of the stream to subscribe to.
   * @returns A StreamConnection object to handle event listeners.
   */
  subscribe(id: string): StreamConnection {
    const url = new URL(`${this.baseURL}/sse/streams/${id}`);
    return new StreamConnection(url, this.apiKey);
  }

  /**
   * Subscribe to real-time events for all streams of an account.
   * @param accountId - The ID of the account.
   * @returns A StreamConnection object to handle event listeners.
   */
  subscribeToAccount(accountId: string): StreamConnection {
    const url = new URL(`${this.baseURL}/sse/accounts/${accountId}/streams`);
    return new StreamConnection(url, this.apiKey);
  }

  /**
   * Subscribe to real-time events for all streams (global).
   * @returns A StreamConnection object to handle event listeners.
   */
  subscribeToAll(): StreamConnection {
    const url = new URL(`${this.baseURL}/sse/streams`);
    return new StreamConnection(url, this.apiKey);
  }
} 