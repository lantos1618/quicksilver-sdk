import { describe, expect, it, beforeEach, mock } from 'bun:test';
import { KycResource } from './kyc';
import { HttpClient } from '../http';

describe('KycResource', () => {
  let httpClient: HttpClient;
  let kycResource: KycResource;

  beforeEach(() => {
    httpClient = new HttpClient('test-api-key', 'https://test.api.com');
    kycResource = new KycResource(httpClient);
  });

  describe('initiate()', () => {
    it('should initiate KYC verification', async () => {
      const mockResponse = {
        success: true,
        verification_url: 'https://verify.example.com/session123',
        session_id: 'session123',
      };

      httpClient.post = mock(() => Promise.resolve(mockResponse));

      const payload = {
        account_id: 'acc_123',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
      };

      const result = await kycResource.initiate(payload);

      expect(httpClient.post).toHaveBeenCalledWith('/kyc/initiate', payload);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getStatus()', () => {
    it('should get KYC status for an account', async () => {
      const mockStatus = {
        account_id: 'acc_123',
        status: 'verified' as const,
        verified_at: '2025-08-28T00:00:00Z',
      };

      httpClient.get = mock(() => Promise.resolve(mockStatus));

      const result = await kycResource.getStatus('acc_123');

      expect(httpClient.get).toHaveBeenCalledWith('/kyc/status/acc_123');
      expect(result).toEqual(mockStatus);
    });
  });

  describe('processWebhook()', () => {
    it('should process webhook data', async () => {
      const mockResponse = { success: true };
      const webhookData = { event: 'verification.completed', data: {} };

      httpClient.post = mock(() => Promise.resolve(mockResponse));

      const result = await kycResource.processWebhook(webhookData);

      expect(httpClient.post).toHaveBeenCalledWith('/kyc/webhook', webhookData);
      expect(result).toEqual(mockResponse);
    });
  });
});