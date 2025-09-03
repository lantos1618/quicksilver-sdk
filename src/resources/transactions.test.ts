import { describe, it, expect, beforeEach, mock } from "bun:test";
import { TransactionsResource } from "./transactions";
import { HttpClient } from "../http";
import { Transaction as TransactionData } from "../types";

describe("TransactionsResource", () => {
  let transactionsResource: TransactionsResource;
  let mockHttpClient: HttpClient;

  beforeEach(() => {
    mockHttpClient = {
      post: mock(() => Promise.resolve()),
      get: mock(() => Promise.resolve()),
      put: mock(() => Promise.resolve()),
      delete: mock(() => Promise.resolve()),
    } as any;

    transactionsResource = new TransactionsResource(mockHttpClient);
  });

  describe("create()", () => {
    it("should create a new transaction", async () => {
      const newTransactionData = {
        from: "acc_sender",
        to: "acc_receiver",
        amount: 100,
        currency: "USD",
        meta: { note: "Payment for services" },
      };
      
      const createdTransaction: TransactionData = {
        id: "txn_123",
        ...newTransactionData,
        state: "pending",
        children: [],
        parent_id: null,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      };

      mockHttpClient.post = mock(() => Promise.resolve(createdTransaction));

      const result = await transactionsResource.create(newTransactionData);

      expect(mockHttpClient.post).toHaveBeenCalledWith("/transactions", newTransactionData);
      expect(result.id).toBe("txn_123");
      expect(result.data).toEqual(createdTransaction);
    });

    it("should handle creation errors", async () => {
      mockHttpClient.post = mock(() => Promise.reject(new Error("Creation failed")));

      await expect(transactionsResource.create({
        from: "acc_1",
        to: "acc_2",
        amount: 50,
      })).rejects.toThrow("Creation failed");
    });
  });

  describe("retrieve()", () => {
    it("should retrieve a transaction by ID", async () => {
      const transactionData: TransactionData = {
        id: "txn_123",
        from: "acc_sender",
        to: "acc_receiver",
        amount: 100,
        currency: "USD",
        state: "completed",
        children: [],
        parent_id: null,
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      };

      mockHttpClient.get = mock(() => Promise.resolve(transactionData));

      const result = await transactionsResource.retrieve("txn_123");

      expect(mockHttpClient.get).toHaveBeenCalledWith("/transactions/txn_123");
      expect(result.id).toBe("txn_123");
      expect(result.data).toEqual(transactionData);
    });

    it("should handle retrieval errors", async () => {
      mockHttpClient.get = mock(() => Promise.reject(new Error("Not found")));

      await expect(transactionsResource.retrieve("txn_invalid"))
        .rejects.toThrow("Not found");
    });
  });

  describe("list()", () => {
    it("should list transactions with pagination", async () => {
      const transactionsList = {
        data: [
          {
            id: "txn_1",
            from: "acc_1",
            to: "acc_2",
            amount: 100,
            currency: "USD",
            state: "completed",
            children: [],
            created_at: "2025-01-01T00:00:00Z",
            updated_at: "2025-01-01T00:00:00Z",
          },
          {
            id: "txn_2",
            from: "acc_2",
            to: "acc_3",
            amount: 200,
            currency: "EUR",
            state: "pending",
            children: [],
            created_at: "2025-01-02T00:00:00Z",
            updated_at: "2025-01-02T00:00:00Z",
          },
        ],
        has_more: false,
        total: 2,
      };

      mockHttpClient.get = mock(() => Promise.resolve(transactionsList));

      const result = await transactionsResource.list({ limit: 10, offset: 0 });

      expect(mockHttpClient.get).toHaveBeenCalledWith("/transactions", { limit: 10, offset: 0 });
      expect(result.data).toHaveLength(2);
      expect(result.has_more).toBe(false);
    });

    it("should handle list without parameters", async () => {
      const transactionsList = {
        data: [],
        has_more: false,
        total: 0,
      };

      mockHttpClient.get = mock(() => Promise.resolve(transactionsList));

      const result = await transactionsResource.list();

      expect(mockHttpClient.get).toHaveBeenCalledWith("/transactions", {});
      expect(result.data).toHaveLength(0);
    });
  });

  describe("update()", () => {
    it("should update a transaction", async () => {
      const updates = {
        state: "completed",
        meta: { note: "Transaction completed successfully" },
      };

      const updatedTransaction: TransactionData = {
        id: "txn_123",
        from: "acc_sender",
        to: "acc_receiver",
        amount: 100,
        currency: "USD",
        state: "completed",
        children: [],
        parent_id: null,
        meta: { note: "Transaction completed successfully" },
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-02T00:00:00Z",
      };

      mockHttpClient.put = mock(() => Promise.resolve(updatedTransaction));

      const result = await transactionsResource.update("txn_123", updates);

      expect(mockHttpClient.put).toHaveBeenCalledWith("/transactions/txn_123", updates);
      expect(result.data.state).toBe("completed");
    });

    it("should handle update errors", async () => {
      mockHttpClient.put = mock(() => Promise.reject(new Error("Update failed")));

      await expect(transactionsResource.update("txn_123", { state: "completed" }))
        .rejects.toThrow("Update failed");
    });
  });

  describe("delete()", () => {
    it("should delete a transaction", async () => {
      mockHttpClient.delete = mock(() => Promise.resolve({ success: true }));

      await transactionsResource.delete("txn_123");

      expect(mockHttpClient.delete).toHaveBeenCalledWith("/transactions/txn_123");
    });

    it("should handle deletion errors", async () => {
      mockHttpClient.delete = mock(() => Promise.reject(new Error("Delete failed")));

      await expect(transactionsResource.delete("txn_123"))
        .rejects.toThrow("Delete failed");
    });
  });

  describe("getChildren()", () => {
    it("should get child transactions", async () => {
      const childTransactions = [
        {
          id: "txn_child1",
          from: "acc_1",
          to: "acc_2",
          amount: 50,
          currency: "USD",
          parent_id: "txn_123",
          state: "completed",
          children: [],
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
        {
          id: "txn_child2",
          from: "acc_2",
          to: "acc_3",
          amount: 75,
          currency: "USD",
          parent_id: "txn_123",
          state: "pending",
          children: [],
          created_at: "2025-01-02T00:00:00Z",
          updated_at: "2025-01-02T00:00:00Z",
        },
      ];

      mockHttpClient.get = mock(() => Promise.resolve(childTransactions));

      const result = await transactionsResource.getChildren("txn_123");

      expect(mockHttpClient.get).toHaveBeenCalledWith("/transactions/txn_123/children");
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("txn_child1");
      expect(result[1].id).toBe("txn_child2");
    });

    it("should handle empty children list", async () => {
      mockHttpClient.get = mock(() => Promise.resolve([]));

      const result = await transactionsResource.getChildren("txn_123");

      expect(result).toEqual([]);
    });
  });

  describe("execute()", () => {
    it("should execute a transaction through a gateway", async () => {
      const executedTransaction: TransactionData = {
        id: "txn_123",
        from: "acc_sender",
        to: "acc_receiver",
        amount: 100,
        currency: "USD",
        state: "completed",
        children: [],
        parent_id: null,
        gateway_response: { success: true },
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      };

      mockHttpClient.post = mock(() => Promise.resolve(executedTransaction));

      const result = await transactionsResource.execute("txn_123", "stripe");

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        "/transactions/txn_123/gateways/stripe/execute"
      );
      expect(result.data.state).toBe("completed");
    });

    it("should handle execution errors", async () => {
      mockHttpClient.post = mock(() => Promise.reject(new Error("Execution failed")));

      await expect(transactionsResource.execute("txn_123", "stripe"))
        .rejects.toThrow("Execution failed");
    });
  });

  describe("createStream()", () => {
    it("should create a streaming transaction", async () => {
      const streamOptions = {
        rate: 10,
        rate_unit: "per_hour",
        end_time: "2025-01-02T00:00:00Z",
      };

      const streamData = {
        id: "stream_123",
        transaction_id: "txn_123",
        rate: 10,
        rate_unit: "per_hour",
        state: "active",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      };

      mockHttpClient.post = mock(() => Promise.resolve(streamData));

      const result = await transactionsResource.createStream("txn_123", streamOptions);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        "/transactions/txn_123/stream",
        streamOptions
      );
      expect(result.id).toBe("stream_123");
    });
  });
});