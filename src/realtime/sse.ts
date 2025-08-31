import { EventEmitter } from 'events';
import type { SSEStreamEvent, SSEBatchCreatedEvent } from '../types';

// Define the events and their corresponding payload types
export declare interface StreamConnection {
  on(event: 'stream_event', listener: (data: SSEStreamEvent) => void): this;
  on(event: 'batch_created', listener: (data: SSEBatchCreatedEvent) => void): this;
  on(event: 'open', listener: () => void): this;
  on(event: 'error', listener: (error: Event) => void): this;
  on(event: 'close', listener: () => void): this;
  on(event: string, listener: (...args: any[]) => void): this;
}

export class StreamConnection extends EventEmitter {
  private eventSource: EventSource;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000; // Start with 1 second
  private isReconnecting: boolean = false;

  constructor(url: URL, apiKey?: string) {
    super();
    
    // Add API key to URL if provided
    if (apiKey) {
      url.searchParams.append('api_key', apiKey);
    }
    
    this.eventSource = new EventSource(url.toString());
    this.setupListeners();
  }

  private setupListeners() {
    this.eventSource.onopen = () => {
      this.emit('open');
      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      this.reconnectDelay = 1000; // Reset delay
    };

    this.eventSource.onerror = (error) => {
      this.emit('error', error);
      
      // Handle reconnection logic
      if (this.eventSource.readyState === EventSource.CLOSED && !this.isReconnecting) {
        this.handleReconnection();
      }
    };

    this.eventSource.addEventListener('stream_event', (event) => {
      try {
        const data: SSEStreamEvent = JSON.parse(event.data);
        this.emit('stream_event', data);
      } catch (error) {
        this.emit('error', new Error(`Failed to parse stream_event: ${error}`));
      }
    });

    this.eventSource.addEventListener('batch_created', (event) => {
      try {
        const data: SSEBatchCreatedEvent = JSON.parse(event.data);
        this.emit('batch_created', data);
      } catch (error) {
        this.emit('error', new Error(`Failed to parse batch_created: ${error}`));
      }
    });

    // Handle custom events
    this.eventSource.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit('message', data);
      } catch (error) {
        // If it's not JSON, emit as raw message
        this.emit('message', event.data);
      }
    });
  }

  private handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('error', new Error('Max reconnection attempts reached'));
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    setTimeout(() => {
      try {
        // Create new EventSource with same URL
        const url = new URL(this.eventSource.url);
        this.eventSource.close();
        this.eventSource = new EventSource(url.toString());
        this.setupListeners();
        this.isReconnecting = false;
      } catch (error) {
        this.isReconnecting = false;
        this.emit('error', new Error(`Reconnection failed: ${error}`));
      }
    }, this.reconnectDelay);

    // Exponential backoff
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000); // Max 30 seconds
  }

  /**
   * Get the current connection state
   */
  get readyState(): number {
    return this.eventSource.readyState;
  }

  /**
   * Get the connection URL
   */
  get url(): string {
    return this.eventSource.url;
  }

  /**
   * Closes the connection to the server.
   */
  public close() {
    this.eventSource.close();
    this.emit('close');
  }

  /**
   * Set the maximum number of reconnection attempts
   */
  public setMaxReconnectAttempts(maxAttempts: number) {
    this.maxReconnectAttempts = maxAttempts;
  }

  /**
   * Set the initial reconnection delay
   */
  public setReconnectDelay(delay: number) {
    this.reconnectDelay = delay;
  }
} 