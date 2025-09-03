import { describe, it, expect, beforeEach, afterEach, mock, spyOn } from "bun:test";
import { HttpClient } from "./http";

describe("HttpClient", () => {
  let httpClient: HttpClient;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    httpClient = new HttpClient(
      "test-api-key",
      "https://api.quicksilver.com"
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("Constructor", () => {
    it("should initialize with base URL and API key", () => {
      expect(httpClient).toBeDefined();
      expect(httpClient.getBaseURL()).toBe("https://api.quicksilver.com");
    });

    it("should initialize with custom timeout", () => {
      const clientWithTimeout = new HttpClient(
        "test-api-key",
        "https://api.quicksilver.com",
        60000
      );

      expect(clientWithTimeout).toBeDefined();
      expect(clientWithTimeout.getBaseURL()).toBe("https://api.quicksilver.com");
    });
  });

  describe("GET requests", () => {
    it("should make a successful GET request", async () => {
      const mockResponse = { id: "123", name: "Test" };
      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );

      const result = await httpClient.get("/test");
      
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.quicksilver.com/test",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "Authorization": "Bearer test-api-key",
            "Content-Type": "application/json",
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle GET request errors", async () => {
      global.fetch = mock(() =>
        Promise.resolve({
          ok: false,
          status: 404,
          statusText: "Not Found",
          text: () => Promise.resolve("Resource not found"),
        } as Response)
      );

      await expect(httpClient.get("/notfound")).rejects.toThrow();
    });

    it("should handle GET with query parameters", async () => {
      const mockResponse = { results: [] };
      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );

      await httpClient.get("/test?page=1&limit=10");
      
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.quicksilver.com/test?page=1&limit=10",
        expect.anything()
      );
    });
  });

  describe("POST requests", () => {
    it("should make a successful POST request", async () => {
      const requestData = { name: "New Item" };
      const mockResponse = { id: "123", ...requestData };
      
      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );

      const result = await httpClient.post("/items", requestData);
      
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.quicksilver.com/items",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Authorization": "Bearer test-api-key",
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(requestData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle POST request errors", async () => {
      global.fetch = mock(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          statusText: "Bad Request",
          text: () => Promise.resolve("Invalid data"),
        } as Response)
      );

      await expect(httpClient.post("/items", {})).rejects.toThrow();
    });
  });

  describe("PUT requests", () => {
    it("should make a successful PUT request", async () => {
      const updateData = { name: "Updated Item" };
      const mockResponse = { id: "123", ...updateData };
      
      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );

      const result = await httpClient.put("/items/123", updateData);
      
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.quicksilver.com/items/123",
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            "Authorization": "Bearer test-api-key",
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(updateData),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("DELETE requests", () => {
    it("should make a successful DELETE request", async () => {
      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          status: 204,
          json: () => Promise.resolve(null),
        } as Response)
      );

      const result = await httpClient.delete("/items/123");
      
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.quicksilver.com/items/123",
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            "Authorization": "Bearer test-api-key",
          }),
        })
      );
      expect(result).toBeNull();
    });
  });

  describe("PATCH requests", () => {
    it("should make a successful PATCH request", async () => {
      const patchData = { status: "updated" };
      const mockResponse = { id: "123", ...patchData };
      
      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );

      const result = await httpClient.patch("/items/123", patchData);
      
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.quicksilver.com/items/123",
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({
            "Authorization": "Bearer test-api-key",
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(patchData),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("Error handling", () => {
    it("should handle network errors", async () => {
      global.fetch = mock(() =>
        Promise.reject(new Error("Network error"))
      );

      await expect(httpClient.get("/test")).rejects.toThrow("Network error");
    });

    it("should handle 401 unauthorized errors", async () => {
      global.fetch = mock(() =>
        Promise.resolve({
          ok: false,
          status: 401,
          statusText: "Unauthorized",
          text: () => Promise.resolve("Invalid API key"),
        } as Response)
      );

      await expect(httpClient.get("/test")).rejects.toThrow();
    });

    it("should handle 500 server errors", async () => {
      global.fetch = mock(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
          text: () => Promise.resolve("Server error"),
        } as Response)
      );

      await expect(httpClient.get("/test")).rejects.toThrow();
    });
  });

  describe("Request headers", () => {
    it("should include custom headers in requests", async () => {
      const mockResponse = { success: true };
      global.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse),
        } as Response)
      );

      // Pass custom headers with the request
      await httpClient.get("/test", {}, { "X-Request-ID": "test-123" });
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Request-ID": "test-123",
          }),
        })
      );
    });
  });

  describe("Rate limiting", () => {
    it("should handle rate limit responses", async () => {
      global.fetch = mock(() =>
        Promise.resolve({
          ok: false,
          status: 429,
          statusText: "Too Many Requests",
          headers: new Headers({
            "Retry-After": "60",
          }),
          text: () => Promise.resolve("Rate limit exceeded"),
        } as Response)
      );

      await expect(httpClient.get("/test")).rejects.toThrow();
    });
  });
});