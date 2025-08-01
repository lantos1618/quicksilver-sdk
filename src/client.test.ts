import { describe, it, expect, beforeEach } from "bun:test";
import { QuicksilverClient } from "./client";

describe("QuicksilverClient", () => {
  let client: QuicksilverClient;

  beforeEach(() => {
    client = new QuicksilverClient("test-api-key");
  });

  it("should initialize with API key", () => {
    expect(client).toBeDefined();
    expect(client.getApiKey()).toBe("test****-key");
  });

  it("should have resource properties", () => {
    expect(client.accounts).toBeDefined();
    expect(client.transactions).toBeDefined();
    expect(client.streams).toBeDefined();
  });

  it("should get base URL", () => {
    expect(client.getBaseURL()).toBe("https://api.quicksilver.com");
  });

  it("should initialize with sandbox environment", () => {
    const sandboxClient = new QuicksilverClient("test-api-key", { env: "sandbox" });
    expect(sandboxClient.getBaseURL()).toBe("https://sandbox.api.quicksilver.com");
  });

  it("should throw error for empty API key", () => {
    expect(() => new QuicksilverClient("")).toThrow("Quicksilver API key is required.");
  });
}); 