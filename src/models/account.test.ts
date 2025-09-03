import { describe, it, expect, beforeEach, mock } from "bun:test";
import { Account } from "./account";
import { HttpClient } from "../http";
import { Account as AccountData, Transaction as TransactionData } from "../types";
import { Transaction } from "./transaction";

describe("Account Model", () => {
  let account: Account;
  let mockHttpClient: HttpClient;
  let accountData: AccountData;

  beforeEach(() => {
    // Create mock HTTP client
    mockHttpClient = {
      post: mock(() => Promise.resolve()),
      get: mock(() => Promise.resolve()),
      put: mock(() => Promise.resolve()),
      patch: mock(() => Promise.resolve()),
      delete: mock(() => Promise.resolve()),
    } as any;

    // Create test account data with verification field
    accountData = {
      id: "acc_123",
      name: "Test Account",
      account_type: "user",
      parent_id: "acc_parent",
      meta: { key: "value", tier: "premium" },
      limits: { 
        daily: 1000, 
        per_transaction: 100, 
        total: 10000 
      },
      verification: {
        status: "verified" as const,
        verified_at: "2025-01-01T00:00:00Z",
      },
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-02T00:00:00Z",
      children: ["acc_child1", "acc_child2"],
    };

    account = new Account(accountData, mockHttpClient);
  });

  describe("Constructor and Properties", () => {
    it("should initialize with account data", () => {
      expect(account).toBeDefined();
      expect(account.id).toBe("acc_123");
      expect(account.data).toEqual(accountData);
    });

    it("should have working getters for all properties", () => {
      expect(account.name).toBe("Test Account");
      expect(account.accountType).toBe("user");
      expect(account.parentId).toBe("acc_parent");
      expect(account.meta).toEqual({ key: "value", tier: "premium" });
      expect(account.limits).toEqual({ 
        daily: 1000, 
        per_transaction: 100, 
        total: 10000 
      });
      expect(account.createdAt).toBe("2025-01-01T00:00:00Z");
      expect(account.updatedAt).toBe("2025-01-02T00:00:00Z");
      expect(account.children).toEqual(["acc_child1", "acc_child2"]);
    });

    it("should handle null parent_id", () => {
      const orphanData = { ...accountData, parent_id: null };
      const orphanAccount = new Account(orphanData, mockHttpClient);
      expect(orphanAccount.parentId).toBeNull();
    });

    it("should handle undefined parent_id", () => {
      const orphanData = { ...accountData, parent_id: undefined };
      const orphanAccount = new Account(orphanData, mockHttpClient);
      expect(orphanAccount.parentId).toBeNull();
    });
  });

  describe("delegate()", () => {
    it("should delegate a sub-agent", async () => {
      const delegatedData = {
        ...accountData,
        id: "acc_delegated",
        name: "Delegated Agent",
        account_type: "AgentDelegated",
        parent_id: account.id,
      };
      mockHttpClient.post = mock(() => Promise.resolve(delegatedData));

      const delegated = await account.delegate({
        name: "Delegated Agent",
        limits: { daily: 500 },
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith("/accounts", {
        name: "Delegated Agent",
        account_type: "AgentDelegated",
        parent_id: account.id,
        limits: { daily: 500 },
      });
      expect(delegated).toBeInstanceOf(Account);
      expect(delegated.id).toBe("acc_delegated");
      expect(delegated.parentId).toBe(account.id);
    });
  });

  describe("transaction()", () => {
    it("should create a transaction object", () => {
      const tx = account.transaction({
        to: "acc_recipient",
        amount: 200,
        currency: "USD",
        status: "pending",
      });

      expect(tx).toBeInstanceOf(Transaction);
      expect(tx.data.from).toBe(account.id);
      expect(tx.data.to).toBe("acc_recipient");
      expect(tx.data.amount).toBe(200);
      expect(tx.data.state).toBe("Draft");
    });
  });

  describe("purchase()", () => {
    it("should purchase a product", async () => {
      const transactionData: TransactionData = {
        id: "txn_purchase",
        from: account.id,
        to: "acc_merchant",
        amount: 50,
        currency: "USD",
        status: "pending",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      };
      mockHttpClient.post = mock(() => Promise.resolve(transactionData));

      // Create a mock product
      const mockProduct = {
        id: "prod_123",
        amount: 50,
        currency: "USD",
      };

      const transaction = await account.purchase(mockProduct as any, { quantity: 2 });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/accounts/${account.id}/purchase`,
        {
          productId: mockProduct.id,
          options: { quantity: 2 },
        }
      );
      expect(transaction).toBeInstanceOf(Transaction);
      expect(transaction.id).toBe("txn_purchase");
    });

    it("should handle purchase errors", async () => {
      mockHttpClient.post = mock(() => Promise.reject(new Error("Purchase failed")));

      const mockProduct = { id: "prod_123" };

      await expect(account.purchase(mockProduct as any, {}))
        .rejects.toThrow("Purchase failed");
    });
  });

  describe("refresh()", () => {
    it("should refresh account data", async () => {
      const refreshedData = {
        ...accountData,
        name: "Refreshed Account",
        updated_at: "2025-01-03T00:00:00Z",
      };
      mockHttpClient.get = mock(() => Promise.resolve(refreshedData));

      const result = await account.refresh();

      expect(mockHttpClient.get).toHaveBeenCalledWith(`/accounts/${account.id}`);
      expect(account.data).toEqual(refreshedData);
      expect(account.name).toBe("Refreshed Account");
      expect(result).toBe(account);
    });

    it("should handle refresh errors", async () => {
      mockHttpClient.get = mock(() => Promise.reject(new Error("Refresh failed")));

      await expect(account.refresh()).rejects.toThrow("Refresh failed");
    });
  });

  describe("getChildren()", () => {
    it("should fetch child accounts", async () => {
      const childAccountData = [
        { ...accountData, id: "acc_child1", name: "Child 1" },
        { ...accountData, id: "acc_child2", name: "Child 2" },
      ];
      mockHttpClient.get = mock(() => Promise.resolve(childAccountData));

      const children = await account.getChildren();

      expect(mockHttpClient.get).toHaveBeenCalledWith(`/accounts/${account.id}/children`);
      expect(children).toHaveLength(2);
      expect(children[0]).toBeInstanceOf(Account);
      expect(children[0].id).toBe("acc_child1");
      expect(children[1].id).toBe("acc_child2");
    });

    it("should return empty array when no children", async () => {
      mockHttpClient.get = mock(() => Promise.resolve([]));

      const children = await account.getChildren();

      expect(children).toEqual([]);
    });
  });

  describe("updateLimits()", () => {
    it("should update account limits", async () => {
      const updatedData = {
        ...accountData,
        limits: { daily: 2000, per_transaction: 200, total: 20000 },
      };
      mockHttpClient.patch = mock(() => Promise.resolve(updatedData));

      const result = await account.updateLimits({ daily: 2000, per_transaction: 200 });

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        `/accounts/${account.id}`,
        { limits: { daily: 2000, per_transaction: 200 } }
      );
      expect(account.data).toEqual(updatedData);
      expect(account.limits).toEqual({ daily: 2000, per_transaction: 200, total: 20000 });
      expect(result).toBe(account);
    });

    it("should handle update errors", async () => {
      mockHttpClient.patch = mock(() => Promise.reject(new Error("Update failed")));

      await expect(account.updateLimits({ daily: 2000 }))
        .rejects.toThrow("Update failed");
    });
  });

  describe("getBalance()", () => {
    it("should fetch account balance", async () => {
      const balanceData = { amount: 1500, currency: "USD" };
      mockHttpClient.get = mock(() => Promise.resolve(balanceData));

      const balance = await account.getBalance();

      expect(mockHttpClient.get).toHaveBeenCalledWith(`/accounts/${account.id}/balance`);
      expect(balance).toEqual({ amount: 1500, currency: "USD" });
    });

    it("should handle balance fetch errors", async () => {
      mockHttpClient.get = mock(() => Promise.reject(new Error("Balance fetch failed")));

      await expect(account.getBalance()).rejects.toThrow("Balance fetch failed");
    });
  });

  describe("isVerified()", () => {
    it("should return true if account is verified", () => {
      expect(account.isVerified()).toBe(true);
    });

    it("should return false if account is not verified", () => {
      const unverifiedData = {
        ...accountData,
        verification: { status: "unverified" as const },
      };
      const unverifiedAccount = new Account(unverifiedData, mockHttpClient);
      expect(unverifiedAccount.isVerified()).toBe(false);
    });
  });

  describe("isRootAccount()", () => {
    it("should return true if account has no parent", () => {
      const rootData = { ...accountData, parent_id: null };
      const rootAccount = new Account(rootData, mockHttpClient);
      expect(rootAccount.isRootAccount()).toBe(true);
    });

    it("should return false if account has a parent", () => {
      expect(account.isRootAccount()).toBe(false);
    });
  });

  describe("canTransact()", () => {
    it("should return true if account is verified", () => {
      expect(account.canTransact()).toBe(true);
    });

    it("should return false if account is not verified", () => {
      const unverifiedData = {
        ...accountData,
        verification: { status: "unverified" as const },
      };
      const unverifiedAccount = new Account(unverifiedData, mockHttpClient);
      expect(unverifiedAccount.canTransact()).toBe(false);
    });
  });

  describe("canDelegate()", () => {
    it("should return true if account is verified", () => {
      expect(account.canDelegate()).toBe(true);
    });

    it("should return false if account is not verified", () => {
      const unverifiedData = {
        ...accountData,
        verification: { status: "unverified" as const },
      };
      const unverifiedAccount = new Account(unverifiedData, mockHttpClient);
      expect(unverifiedAccount.canDelegate()).toBe(false);
    });
  });

  describe("getVerificationStatus()", () => {
    it("should return verification status details", () => {
      const status = account.getVerificationStatus();
      expect(status).toEqual({
        status: "verified",
        verified_at: "2025-01-01T00:00:00Z",
      });
    });
  });

  describe("verify()", () => {
    it("should verify the account", async () => {
      const verifiedData = {
        ...accountData,
        verification: {
          status: "verified" as const,
          verified_at: "2025-01-03T00:00:00Z",
        },
      };
      mockHttpClient.post = mock(() => Promise.resolve(verifiedData));

      const result = await account.verify("admin_user");

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/accounts/${account.id}/verify`,
        {
          verified_by: "admin_user",
          verified_at: expect.any(String),
        }
      );
      expect(account.data).toEqual(verifiedData);
      expect(result).toBe(account);
    });
  });

  describe("rejectVerification()", () => {
    it("should reject verification", async () => {
      const rejectedData = {
        ...accountData,
        verification: {
          status: "rejected" as const,
          verified_at: null,
        },
      };
      mockHttpClient.post = mock(() => Promise.resolve(rejectedData));

      const result = await account.rejectVerification("Invalid documents");

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/accounts/${account.id}/reject-verification`,
        {
          reason: "Invalid documents",
          rejected_at: expect.any(String),
        }
      );
      expect(account.data).toEqual(rejectedData);
      expect(result).toBe(account);
    });
  });
});