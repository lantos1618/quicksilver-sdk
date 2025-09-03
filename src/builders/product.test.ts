import { describe, it, expect, beforeEach } from "bun:test";
import { ProductBuilder } from "./product";
import { ConditionBuilder } from "./condition";
import { ActionBuilder } from "./action";

describe("ProductBuilder", () => {
  let product: ProductBuilder;

  beforeEach(() => {
    product = new ProductBuilder("test-product");
  });

  describe("Constructor", () => {
    it("should initialize with a product id", () => {
      expect(product.id).toBe("test-product");
      expect(product.conditions).toEqual([]);
      expect(product.actions).toEqual([]);
      expect(product.stages).toEqual([]);
    });
  });

  describe("charge()", () => {
    it("should set amount and unit", () => {
      const result = product.charge(100, "per_transaction");
      
      expect(result).toBe(product); // Fluent API
      expect(product.amount).toBe(100);
      expect(product.chargeUnit).toBe("per_transaction");
    });

    it("should handle different charge units", () => {
      product.charge(0.01, "per_word");
      expect(product.amount).toBe(0.01);
      expect(product.chargeUnit).toBe("per_word");
    });
  });

  describe("to()", () => {
    it("should set the destination account", () => {
      const result = product.to("acc_merchant");
      
      expect(result).toBe(product); // Fluent API
      expect(product.toAccountId).toBe("acc_merchant");
    });
  });

  describe("from()", () => {
    it("should set the source account", () => {
      const result = product.from("acc_customer");
      
      expect(result).toBe(product); // Fluent API
      expect(product.fromAccountId).toBe("acc_customer");
    });
  });

  describe("currency()", () => {
    it("should set the currency", () => {
      const result = product.currency("EUR");
      
      expect(result).toBe(product); // Fluent API
      expect(product.currencyCode).toBe("EUR");
    });
  });

  describe("guarantee()", () => {
    it("should set guarantee options", () => {
      const guarantees = { 
        accuracy: 0.98, 
        turnaround: "5 minutes" 
      };
      const result = product.guarantee(guarantees);
      
      expect(result).toBe(product); // Fluent API
      expect(product.guarantees).toEqual(guarantees);
    });

    it("should handle multiple guarantee properties", () => {
      const guarantees = { 
        delivery: "24 hours",
        quality: "high",
        uptime: 0.999
      };
      product.guarantee(guarantees);
      expect(product.guarantees).toEqual(guarantees);
    });
  });

  describe("stage()", () => {
    it("should add a stage to the product", () => {
      const stageOptions = {
        delegateTo: "agent_123",
        charge: 20
      };
      const result = product.stage("research", stageOptions);
      
      expect(result).toBe(product); // Fluent API
      expect(product.stages).toHaveLength(1);
      expect(product.stages[0]).toEqual({
        name: "research",
        ...stageOptions
      });
    });

    it("should add multiple stages", () => {
      product
        .stage("research", { delegateTo: "agent_1", charge: 20 })
        .stage("writing", { delegateTo: "agent_2", charge: 40 })
        .stage("review", { delegateTo: "agent_3", charge: 10 });
      
      expect(product.stages).toHaveLength(3);
      expect(product.stages[0].name).toBe("research");
      expect(product.stages[1].name).toBe("writing");
      expect(product.stages[2].name).toBe("review");
    });
  });

  describe("withConditions()", () => {
    it("should add conditions to the product", () => {
      const condition = new ConditionBuilder();
      condition.when("order_placed").then({ action: "notify" });
      
      const result = product.withConditions(condition);
      
      expect(result).toBe(product); // Fluent API
      expect(product.conditions).toEqual(condition.conditions);
    });

    it("should merge conditions from ConditionBuilder", () => {
      const condition = new ConditionBuilder()
        .when("payment_received")
        .then({ action: "process" })
        .when("payment_failed")
        .then({ action: "retry" });
      
      product.withConditions(condition);
      
      expect(product.conditions).toHaveLength(2);
      expect(product.conditions[0].trigger).toBe("payment_received");
      expect(product.conditions[1].trigger).toBe("payment_failed");
    });
  });

  describe("withActions()", () => {
    it("should add actions to the product", () => {
      const action = new ActionBuilder("send_email");
      action.with({ to: "user@example.com" });
      
      const result = product.withActions(action);
      
      expect(result).toBe(product); // Fluent API
      expect(product.actions).toHaveLength(1);
      expect(product.actions[0]).toEqual({
        type: "send_email",
        params: { to: "user@example.com" }
      });
    });

    it("should add multiple actions", () => {
      const action1 = new ActionBuilder("notify").with({ channel: "email" });
      const action2 = new ActionBuilder("log").with({ level: "info" });
      
      product.withActions(action1, action2);
      
      expect(product.actions).toHaveLength(2);
      expect(product.actions[0].type).toBe("notify");
      expect(product.actions[1].type).toBe("log");
    });
  });

  describe("meta()", () => {
    it("should set metadata", () => {
      const metadata = { 
        category: "translation",
        tier: "premium" 
      };
      const result = product.meta(metadata);
      
      expect(result).toBe(product); // Fluent API
      expect(product.metadata).toEqual(metadata);
    });

    it("should merge metadata on multiple calls", () => {
      product
        .meta({ category: "ai" })
        .meta({ tier: "premium", region: "us-east" });
      
      expect(product.metadata).toEqual({
        category: "ai",
        tier: "premium",
        region: "us-east"
      });
    });
  });

  describe("Complex product building", () => {
    it("should build a complete product with all features", () => {
      const condition = new ConditionBuilder()
        .when("threshold_exceeded")
        .then({ action: "alert" });
      
      const action = new ActionBuilder("process_payment")
        .with({ gateway: "stripe" });
      
      const completeProduct = product
        .charge(99.99, "monthly")
        .to("acc_service_provider")
        .from("acc_customer")
        .currency("USD")
        .guarantee({ uptime: 0.999, support: "24/7" })
        .stage("validation", { delegateTo: "validator", charge: 10 })
        .stage("processing", { delegateTo: "processor", charge: 20 })
        .withConditions(condition)
        .withActions(action)
        .meta({ description: "Premium service package" });
      
      expect(completeProduct.id).toBe("test-product");
      expect(completeProduct.amount).toBe(99.99);
      expect(completeProduct.chargeUnit).toBe("monthly");
      expect(completeProduct.toAccountId).toBe("acc_service_provider");
      expect(completeProduct.fromAccountId).toBe("acc_customer");
      expect(completeProduct.currencyCode).toBe("USD");
      expect(completeProduct.guarantees).toEqual({ uptime: 0.999, support: "24/7" });
      expect(completeProduct.stages).toHaveLength(2);
      expect(completeProduct.conditions).toHaveLength(1);
      expect(completeProduct.actions).toHaveLength(1);
      expect(completeProduct.metadata).toEqual({ description: "Premium service package" });
    });

    it("should work without .build() method (fluent API)", () => {
      // Verify the product can be used directly without calling .build()
      const translationService = product
        .charge(0.01, "per_word")
        .guarantee({ accuracy: 0.98, turnaround: "5 minutes" });
      
      // The product should be directly usable
      expect(translationService).toBe(product);
      expect(translationService.amount).toBe(0.01);
      expect(translationService.chargeUnit).toBe("per_word");
      
      // No .build() method should exist
      expect(typeof (translationService as any).build).toBe("undefined");
    });
  });
});
