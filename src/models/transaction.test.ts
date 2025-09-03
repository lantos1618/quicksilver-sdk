import { describe, it, expect, beforeEach, mock } from "bun:test";
import { Transaction } from "./transaction";
import { HttpClient } from "../http";
import { Transaction as TransactionData, Stream as StreamData } from "../types";

describe("Transaction Model", () => {
  let transaction: Transaction;
  let mockHttpClient: HttpClient;
  let transactionData: TransactionData;

  beforeEach(() => {
    // Create mock HTTP client
    mockHttpClient = {
      post: mock(() => Promise.resolve()),
      get: mock(() => Promise.resolve()),
      put: mock(() => Promise.resolve()),
      delete: mock(() => Promise.resolve()),
    } as any;

    // Create test transaction data
    transactionData = {
      id: "txn_123",
      from: "acc_sender",
      to: "acc_receiver",
      amount: 100,
      currency: "USD",
      status: "pending",
      meta: { note: "Test transaction" },
      parent_id: "txn_parent",
      children: ["txn_child1", "txn_child2"],
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-02T00:00:00Z",
    };

    transaction = new Transaction(transactionData, mockHttpClient);
  });

  describe("Constructor and Properties", () => {
    it("should initialize with transaction data", () => {
      expect(transaction).toBeDefined();
      expect(transaction.id).toBe("txn_123");
      expect(transaction.data).toEqual(transactionData);
    });

    it("should have working getters for all properties", () => {
      expect(transaction.from).toBe("acc_sender");
      expect(transaction.to).toBe("acc_receiver");
      expect(transaction.amount).toBe(100);
      expect(transaction.currency).toBe("USD");
      expect(transaction.status).toBe("pending");
      expect(transaction.meta).toEqual({ note: "Test transaction" });
      expect(transaction.parentId).toBe("txn_parent");
      expect(transaction.children).toEqual(["txn_child1", "txn_child2"]);
      expect(transaction.createdAt).toBe("2025-01-01T00:00:00Z");
      expect(transaction.updatedAt).toBe("2025-01-02T00:00:00Z");
    });

    it("should handle null parent_id", () => {
      const orphanData = { ...transactionData, parent_id: null };
      const orphanTransaction = new Transaction(orphanData, mockHttpClient);
      expect(orphanTransaction.parentId).toBeNull();
    });

    it("should handle undefined parent_id", () => {
      const orphanData = { ...transactionData, parent_id: undefined };
      const orphanTransaction = new Transaction(orphanData, mockHttpClient);
      expect(orphanTransaction.parentId).toBeNull();
    });
  });

  describe("update()", () => {
    it("should update transaction data", async () => {
      const updatedData = {
        ...transactionData,
        status: "completed",
        meta: { note: "Updated" },
      };
      mockHttpClient.put = mock(() => Promise.resolve(updatedData));

      const result = await transaction.update({ 
        status: "completed", 
        meta: { note: "Updated" } 
      });

      expect(mockHttpClient.put).toHaveBeenCalledWith(
        `/transactions/${transaction.id}`,
        { status: "completed", meta: { note: "Updated" } }
      );
      expect(transaction.data).toEqual(updatedData);
      expect(transaction.status).toBe("completed");
      expect(result).toBeInstanceOf(Transaction);
    });

    it("should handle update errors", async () => {
      mockHttpClient.put = mock(() => Promise.reject(new Error("Update failed")));

      await expect(transaction.update({ status: "completed" }))
        .rejects.toThrow("Update failed");
    });
  });

  describe("delete()", () => {
    it("should delete the transaction", async () => {
      mockHttpClient.delete = mock(() => Promise.resolve({ success: true }));

      await transaction.delete();

      expect(mockHttpClient.delete).toHaveBeenCalledWith(`/transactions/${transaction.id}`);
    });

    it("should handle delete errors", async () => {
      mockHttpClient.delete = mock(() => Promise.reject(new Error("Delete failed")));

      await expect(transaction.delete()).rejects.toThrow("Delete failed");
    });
  });

  describe("getChildren()", () => {
    it("should fetch child transactions", async () => {
      const childTransactionData = [
        { ...transactionData, id: "txn_child1", amount: 50 },
        { ...transactionData, id: "txn_child2", amount: 50 },
      ];
      mockHttpClient.get = mock(() => Promise.resolve(childTransactionData));

      const children = await transaction.getChildren();

      expect(mockHttpClient.get).toHaveBeenCalledWith(`/transactions/${transaction.id}/children`);
      expect(children).toHaveLength(2);
      expect(children[0]).toBeInstanceOf(Transaction);
      expect(children[0].id).toBe("txn_child1");
      expect(children[1].id).toBe("txn_child2");
    });

    it("should return empty array when no children", async () => {
      mockHttpClient.get = mock(() => Promise.resolve([]));

      const children = await transaction.getChildren();

      expect(children).toEqual([]);
    });
  });

  describe("execute()", () => {
    it("should execute transaction via gateway", async () => {
      const executedData = {
        ...transactionData,
        status: "completed",
        gateway_response: { success: true },
      };
      mockHttpClient.post = mock(() => Promise.resolve(executedData));

      const result = await transaction.execute("stripe");

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/transactions/${transaction.id}/gateway/execute`,
        { gatewayId: "stripe" }
      );
      expect(transaction.data).toEqual(executedData);
      expect(transaction.status).toBe("completed");
      expect(result).toBeInstanceOf(Transaction);
    });

    it("should handle execution errors", async () => {
      mockHttpClient.post = mock(() => Promise.reject(new Error("Execution failed")));

      await expect(transaction.execute("stripe"))
        .rejects.toThrow("Execution failed");
    });
  });

  describe("stream()", () => {
    it("should create a streaming transaction", async () => {
      const streamData: StreamData = {
        id: "stream_123",
        transaction_id: transaction.id,
        from: "acc_sender",
        to: "acc_receiver",
        rate: 10,
        rate_unit: "per_hour",
        start_time: "2025-01-01T00:00:00Z",
        end_time: "2025-01-02T00:00:00Z",
        state: "active",
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      };
      mockHttpClient.post = mock(() => Promise.resolve(streamData));

      const stream = await transaction.stream({
        rate: 10,
        rateUnit: "per_hour",
        endTime: "2025-01-02T00:00:00Z",
      });

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/transactions/${transaction.id}/stream`,
        {
          rate: 10,
          rateUnit: "per_hour",
          endTime: "2025-01-02T00:00:00Z",
        }
      );
      expect(stream).toBeDefined();
      expect(stream.id).toBe("stream_123");
    });

    it("should handle stream creation errors", async () => {
      mockHttpClient.post = mock(() => Promise.reject(new Error("Stream failed")));

      await expect(transaction.stream({ rate: 10, rateUnit: "per_hour" }))
        .rejects.toThrow("Stream failed");
    });
  });

  describe("cancel()", () => {
    it("should cancel the transaction", async () => {
      const cancelledData = {
        ...transactionData,
        status: "cancelled",
      };
      mockHttpClient.post = mock(() => Promise.resolve(cancelledData));

      const result = await transaction.cancel();

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/transactions/${transaction.id}/cancel`
      );
      expect(transaction.data).toEqual(cancelledData);
      expect(transaction.status).toBe("cancelled");
      expect(result).toBeInstanceOf(Transaction);
    });

    it("should handle cancellation errors", async () => {
      mockHttpClient.post = mock(() => Promise.reject(new Error("Cancel failed")));

      await expect(transaction.cancel()).rejects.toThrow("Cancel failed");
    });
  });

  describe("refund()", () => {
    it("should refund the full amount", async () => {
      const refundData = {
        ...transactionData,
        status: "refunded",
        refund_amount: 100,
      };
      mockHttpClient.post = mock(() => Promise.resolve(refundData));

      const result = await transaction.refund();

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/transactions/${transaction.id}/refund`,
        { amount: 100 }
      );
      expect(transaction.data).toEqual(refundData);
      expect(transaction.status).toBe("refunded");
      expect(result).toBeInstanceOf(Transaction);
    });

    it("should refund partial amount", async () => {
      const refundData = {
        ...transactionData,
        status: "partially_refunded",
        refund_amount: 50,
      };
      mockHttpClient.post = mock(() => Promise.resolve(refundData));

      const result = await transaction.refund(50);

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/transactions/${transaction.id}/refund`,
        { amount: 50 }
      );
      expect(transaction.data).toEqual(refundData);
      expect(result).toBeInstanceOf(Transaction);
    });

    it("should handle refund errors", async () => {
      mockHttpClient.post = mock(() => Promise.reject(new Error("Refund failed")));

      await expect(transaction.refund()).rejects.toThrow("Refund failed");
    });
  });

  describe("getStreams()", () => {
    it("should fetch transaction streams", async () => {
      const streamData: StreamData[] = [
        {
          id: "stream_1",
          transaction_id: transaction.id,
          from: "acc_sender",
          to: "acc_receiver",
          rate: 10,
          rate_unit: "per_hour",
          start_time: "2025-01-01T00:00:00Z",
          state: "active",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-01T00:00:00Z",
        },
      ];
      mockHttpClient.get = mock(() => Promise.resolve(streamData));

      const streams = await transaction.getStreams();

      expect(mockHttpClient.get).toHaveBeenCalledWith(`/transactions/${transaction.id}/streams`);
      expect(streams).toHaveLength(1);
      expect(streams[0]).toBeDefined();
      expect(streams[0].id).toBe("stream_1");
    });

    it("should return empty array when no streams", async () => {
      mockHttpClient.get = mock(() => Promise.resolve([]));

      const streams = await transaction.getStreams();

      expect(streams).toEqual([]);
    });
  });

  describe("isPending()", () => {
    it("should return true for pending status", () => {
      expect(transaction.isPending()).toBe(true);
    });

    it("should return false for completed status", () => {
      const completedData = { ...transactionData, status: "completed" };
      const completedTxn = new Transaction(completedData, mockHttpClient);
      expect(completedTxn.isPending()).toBe(false);
    });
  });

  describe("isCompleted()", () => {
    it("should return true for completed status", () => {
      const completedData = { ...transactionData, status: "completed" };
      const completedTxn = new Transaction(completedData, mockHttpClient);
      expect(completedTxn.isCompleted()).toBe(true);
    });

    it("should return false for pending status", () => {
      expect(transaction.isCompleted()).toBe(false);
    });
  });

  describe("isFailed()", () => {
    it("should return true for failed status", () => {
      const failedData = { ...transactionData, status: "failed" };
      const failedTxn = new Transaction(failedData, mockHttpClient);
      expect(failedTxn.isFailed()).toBe(true);
    });

    it("should return false for successful status", () => {
      expect(transaction.isFailed()).toBe(false);
    });
  });

  describe("toJSON()", () => {
    it("should return the transaction data as JSON", () => {
      const json = transaction.toJSON();
      expect(json).toEqual(transactionData);
    });
  });
});