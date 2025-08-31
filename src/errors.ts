import type { APIError } from './types';

/**
 * Base error class for all Quicksilver SDK errors
 */
export class QuicksilverError extends Error {
  public readonly statusCode?: number;
  public readonly details?: Record<string, any>;

  constructor(message: string, statusCode?: number, details?: Record<string, any>) {
    super(message);
    this.name = 'QuicksilverError';
    if (statusCode !== undefined) {
      this.statusCode = statusCode;
    }
    if (details !== undefined) {
      this.details = details;
    }
  }
}

/**
 * Error thrown when the API returns an error response
 */
export class APIErrorResponse extends QuicksilverError {
  public readonly apiError: APIError;

  constructor(apiError: APIError) {
    super(apiError.message, apiError.status_code, apiError.details);
    this.name = 'APIErrorResponse';
    this.apiError = apiError;
  }
}

/**
 * Error thrown when there's a network connectivity issue
 */
export class NetworkError extends QuicksilverError {
  constructor(message: string, originalError?: Error) {
    super(message);
    this.name = 'NetworkError';
    if (originalError) {
      // Use Error.cause for Node.js 16+ compatibility
      Object.defineProperty(this, 'cause', {
        value: originalError,
        writable: false,
        enumerable: false,
        configurable: true
      });
    }
  }
}

/**
 * Error thrown when the API key is invalid or missing
 */
export class AuthenticationError extends QuicksilverError {
  constructor(message: string = 'Invalid or missing API key') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Error thrown when a resource is not found
 */
export class NotFoundError extends QuicksilverError {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} with ID '${id}' not found`
      : `${resource} not found`;
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Error thrown when the request is invalid
 */
export class ValidationError extends QuicksilverError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown when the rate limit is exceeded
 */
export class RateLimitError extends QuicksilverError {
  constructor(message: string = 'Rate limit exceeded', retryAfter?: number) {
    const details = retryAfter !== undefined ? { retryAfter } : undefined;
    super(message, 429, details);
    this.name = 'RateLimitError';
  }
}

/**
 * Error thrown when there's a server error
 */
export class ServerError extends QuicksilverError {
  constructor(message: string = 'Internal server error') {
    super(message, 500);
    this.name = 'ServerError';
  }
} 