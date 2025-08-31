import {
  AuthenticationError,
  NetworkError,
  APIErrorResponse,
  RateLimitError,
  ServerError,
  ValidationError,
  NotFoundError,
  QuicksilverError,
} from './errors';
import type { APIError } from './types';

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

export class HttpClient {
  private readonly apiKey: string;
  private readonly baseURL: string;
  private readonly defaultTimeout: number;

  constructor(apiKey: string, baseURL: string, timeout: number = 30000) {
    this.apiKey = apiKey;
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.defaultTimeout = timeout;
  }

  /**
   * Get the base URL being used for API requests
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Make a GET request
   */
  async get<T>(path: string, params?: Record<string, any>, headers?: Record<string, string>): Promise<T> {
    let url = path;
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url = `${path}${path.includes('?') ? '&' : '?'}${queryString}`;
      }
    }
    return this.request<T>({
      method: 'GET',
      url,
      headers: headers || {},
    });
  }

  /**
   * Make a POST request
   */
  async post<T>(path: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({
      method: 'POST',
      url: path,
      data,
      headers: headers || {},
    });
  }

  /**
   * Make a PUT request
   */
  async put<T>(path: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({
      method: 'PUT',
      url: path,
      data,
      headers: headers || {},
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({
      method: 'DELETE',
      url: path,
      headers: headers || {},
    });
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(path: string, data?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>({
      method: 'PATCH',
      url: path,
      data,
      headers: headers || {},
    });
  }

  /**
   * Internal request method that handles all HTTP requests
   */
  private async request<T>(options: RequestOptions): Promise<T> {
    const { method, url, data, headers = {}, timeout = this.defaultTimeout } = options;

    const fullURL = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'quicksilver-sdk/1.0.0',
      ...headers,
    };

    // Only add Authorization header if API key is provided
    if (this.apiKey) {
      requestHeaders['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: requestHeaders,
        signal: controller.signal,
      };

      if (data !== undefined) {
        fetchOptions.body = JSON.stringify(data);
      }

      const response = await fetch(fullURL, fetchOptions);

      clearTimeout(timeoutId);

      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleRequestError(error);
    }
  }

  /**
   * Handle the response and parse the data
   */
  private async handleResponse<T>(response: globalThis.Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      let errorData: APIError | null = null;
      
      try {
        if (isJson) {
          errorData = await response.json();
        }
      } catch {
        // If we can't parse the error response, we'll use a generic error
      }

      throw this.createErrorFromResponse(response.status, errorData);
    }

    if (response.status === 204) {
      // No content
      return {} as T;
    }

    if (isJson) {
      return await response.json();
    }

    return await response.text() as T;
  }

  /**
   * Handle request errors (network, timeout, etc.)
   */
  private handleRequestError(error: unknown): QuicksilverError {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return new NetworkError('Request timeout');
      }
      
      if (error.message.includes('fetch')) {
        return new NetworkError('Network error', error);
      }
    }

    return new NetworkError('Unknown network error');
  }

  /**
   * Create appropriate error based on HTTP status code
   */
  private createErrorFromResponse(statusCode: number, apiError?: APIError | null): QuicksilverError {
    if (apiError) {
      return new APIErrorResponse(apiError);
    }

    switch (statusCode) {
      case 400:
        return new ValidationError('Bad request');
      case 401:
        return new AuthenticationError();
      case 404:
        return new NotFoundError('Resource');
      case 429:
        const retryAfter = this.parseRetryAfterHeader();
        return new RateLimitError('Rate limit exceeded', retryAfter);
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError();
      default:
        return new QuicksilverError(`HTTP ${statusCode} error`, statusCode);
    }
  }

  /**
   * Parse Retry-After header for rate limiting
   */
  private parseRetryAfterHeader(): number | undefined {
    // This would need to be implemented if we have access to response headers
    // For now, return undefined
    return undefined;
  }
} 