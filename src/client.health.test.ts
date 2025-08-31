import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { QuicksilverClient } from './client';

describe('QuicksilverClient Health Methods', () => {
  let client: QuicksilverClient;

  beforeEach(() => {
    client = new QuicksilverClient('test-api-key', { baseURL: 'http://localhost:8080' });
  });

  describe('ping()', () => {
    it('should return pong response', async () => {
      const mockResponse = { pong: true, timestamp: '2025-08-29T12:00:00Z' };
      
      // Mock the httpClient.get method
      (client as any).httpClient.get = mock(() => Promise.resolve(mockResponse));

      const result = await client.ping();

      expect((client as any).httpClient.get).toHaveBeenCalledWith('/ping');
      expect(result).toEqual(mockResponse);
      expect(result.pong).toBe(true);
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('health()', () => {
    it('should return health status', async () => {
      const mockResponse = { 
        status: 'healthy', 
        version: '1.0.0', 
        timestamp: '2025-08-29T12:00:00Z' 
      };
      
      // Mock the httpClient.get method
      (client as any).httpClient.get = mock(() => Promise.resolve(mockResponse));

      const result = await client.health();

      expect((client as any).httpClient.get).toHaveBeenCalledWith('/health');
      expect(result).toEqual(mockResponse);
      expect(result.status).toBe('healthy');
      expect(result.version).toBe('1.0.0');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('getOpenApiSpec()', () => {
    it('should return OpenAPI spec', async () => {
      const mockSpec = {
        openapi: '3.0.0',
        info: {
          title: 'Quicksilver Engine API',
          version: '1.0.0'
        },
        paths: {}
      };
      
      // Mock the httpClient.get method
      (client as any).httpClient.get = mock(() => Promise.resolve(mockSpec));

      const result = await client.getOpenApiSpec();

      expect((client as any).httpClient.get).toHaveBeenCalledWith('/openapi.json');
      expect(result).toEqual(mockSpec);
      expect(result.info.title).toBe('Quicksilver Engine API');
    });
  });
});