import { describe, it, expect, beforeEach, mock } from "bun:test";
import { AccountsResource } from "./accounts";
import { HttpClient } from "../http";
import { Account as AccountData } from "../types";

describe("AccountsResource", () => {
  let accountsResource: AccountsResource;
  let mockHttpClient: HttpClient;

  beforeEach(() => {
    mockHttpClient = {
      post: mock(() => Promise.resolve()),
      get: mock(() => Promise.resolve()),
      put: mock(() => Promise.resolve()),
      delete: mock(() => Promise.resolve()),
    } as any;

    accountsResource = new AccountsResource(mockHttpClient);
  });

  describe("create()", () => {
    it("should create a new account", async () => {
      const newAccountData = {
        name: "Test Account",
        email: "test@example.com",
        meta: { category: "business" },
      };
      
      const createdAccount: AccountData = {
        id: "acc_123",
        ...newAccountData,
        balance: 0,
        currency: "USD",
        state: "active",
        children: [],
        parent_id: null,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      };

      mockHttpClient.post = mock(() => Promise.resolve(createdAccount));

      const result = await accountsResource.create(newAccountData);

      expect(mockHttpClient.post).toHaveBeenCalledWith("/accounts", newAccountData);
      expect(result.id).toBe("acc_123");
      expect(result.data).toEqual(createdAccount);
    });

    it("should handle creation errors", async () => {
      mockHttpClient.post = mock(() => Promise.reject(new Error("Creation failed")));

      await expect(accountsResource.create({ name: "Test" }))
        .rejects.toThrow("Creation failed");
    });
  });

  describe("retrieve()", () => {
    it("should retrieve an account by ID", async () => {
      const accountData: AccountData = {
        id: "acc_123",
        name: "Test Account",
        email: "test@example.com",
        balance: 100,
        currency: "USD",
        state: "active",
        children: [],
        parent_id: null,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      };

      mockHttpClient.get = mock(() => Promise.resolve(accountData));

      const result = await accountsResource.retrieve("acc_123");

      expect(mockHttpClient.get).toHaveBeenCalledWith("/accounts/acc_123");
      expect(result.id).toBe("acc_123");
      expect(result.data).toEqual(accountData);
    });

    it("should handle retrieval errors", async () => {
      mockHttpClient.get = mock(() => Promise.reject(new Error("Not found")));

      await expect(accountsResource.retrieve("acc_invalid"))
        .rejects.toThrow("Not found");
    });
  });

  describe("list()", () => {
    it("should list accounts with pagination", async () => {
      const accountsList = {
        data: [
          {
            id: "acc_1",
            name: "Account 1",
            balance: 100,
            currency: "USD",
            state: "active",
            children: [],
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z",
          },
          {
            id: "acc_2",
            name: "Account 2",
            balance: 200,
            currency: "EUR",
            state: "active",
            children: [],
            created_at: "2025-01-02T00:00:00Z",
            updated_at: "2025-01-02T00:00:00Z",
          },
        ],
        has_more: false,
        total: 2,
      };

      mockHttpClient.get = mock(() => Promise.resolve(accountsList));

      const result = await accountsResource.list({ limit: 10, offset: 0 });

      expect(mockHttpClient.get).toHaveBeenCalledWith("/accounts", { limit: 10, offset: 0 });
      expect(result.data).toHaveLength(2);
      expect(result.has_more).toBe(false);
    });

    it("should handle list without parameters", async () => {
      const accountsList = {
        data: [],
        has_more: false,
        total: 0,
      };

      mockHttpClient.get = mock(() => Promise.resolve(accountsList));

      const result = await accountsResource.list();

      expect(mockHttpClient.get).toHaveBeenCalledWith("/accounts", {});
      expect(result.data).toHaveLength(0);
    });
  });

  describe("update()", () => {
    it("should update an account", async () => {
      const updates = {
        name: "Updated Account",
        meta: { category: "premium" },
      };

      const updatedAccount: AccountData = {
        id: "acc_123",
        name: "Updated Account",
        email: "test@example.com",
        balance: 100,
        currency: "USD",
        state: "active",
        children: [],
        parent_id: null,
        meta: { category: "premium" },
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-02T00:00:00Z",
      };

      mockHttpClient.put = mock(() => Promise.resolve(updatedAccount));

      const result = await accountsResource.update("acc_123", updates);

      expect(mockHttpClient.put).toHaveBeenCalledWith("/accounts/acc_123", updates);
      expect(result.data.name).toBe("Updated Account");
    });

    it("should handle update errors", async () => {
      mockHttpClient.put = mock(() => Promise.reject(new Error("Update failed")));

      await expect(accountsResource.update("acc_123", { name: "New" }))
        .rejects.toThrow("Update failed");
    });
  });

  describe("delete()", () => {
    it("should delete an account", async () => {
      mockHttpClient.delete = mock(() => Promise.resolve({ success: true }));

      await accountsResource.delete("acc_123");

      expect(mockHttpClient.delete).toHaveBeenCalledWith("/accounts/acc_123");
    });

    it("should handle deletion errors", async () => {
      mockHttpClient.delete = mock(() => Promise.reject(new Error("Delete failed")));

      await expect(accountsResource.delete("acc_123"))
        .rejects.toThrow("Delete failed");
    });
  });

  describe("getChildren()", () => {
    it("should get child accounts", async () => {
      const childAccounts = [
        {
          id: "acc_child1",
          name: "Child 1",
          parent_id: "acc_123",
          balance: 50,
          currency: "USD",
          state: "active",
          children: [],
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
        {
          id: "acc_child2",
          name: "Child 2",
          parent_id: "acc_123",
          balance: 75,
          currency: "USD",
          state: "active",
          children: [],
          created_at: "2025-01-02T00:00:00Z",
          updated_at: "2025-01-02T00:00:00Z",
        },
      ];

      mockHttpClient.get = mock(() => Promise.resolve(childAccounts));

      const result = await accountsResource.getChildren("acc_123");

      expect(mockHttpClient.get).toHaveBeenCalledWith("/accounts/acc_123/children");
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("acc_child1");
      expect(result[1].id).toBe("acc_child2");
    });

    it("should handle empty children list", async () => {
      mockHttpClient.get = mock(() => Promise.resolve([]));

      const result = await accountsResource.getChildren("acc_123");

      expect(result).toEqual([]);
    });
  });

  describe("getTransactions()", () => {
    it("should get transactions for an account", async () => {
      const transactions = {
        data: [
          {
            id: "txn_1",
            from: "acc_123",
            to: "acc_456",
            amount: 50,
            currency: "USD",
            state: "completed",
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z",
          },
          {
            id: "txn_2",
            from: "acc_789",
            to: "acc_123",
            amount: 100,
            currency: "USD",
            state: "pending",
            created_at: "2025-01-02T00:00:00Z",
            updated_at: "2025-01-02T00:00:00Z",
          },
        ],
        has_more: false,
        total: 2,
      };

      mockHttpClient.get = mock(() => Promise.resolve(transactions));

      const result = await accountsResource.getTransactions("acc_123", { limit: 10 });

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        "/accounts/acc_123/transactions",
        { limit: 10 }
      );
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });

  describe("getStreams()", () => {
    it("should get streams for an account", async () => {
      const streams = [
        {
          id: "stream_1",
          account_id: "acc_123",
          transaction_id: "txn_1",
          rate: 10,
          rate_unit: "per_hour",
          state: "active",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
      ];

      mockHttpClient.get = mock(() => Promise.resolve(streams));

      const result = await accountsResource.getStreams("acc_123");

      expect(mockHttpClient.get).toHaveBeenCalledWith("/accounts/acc_123/streams");
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("stream_1");
    });
  });
});