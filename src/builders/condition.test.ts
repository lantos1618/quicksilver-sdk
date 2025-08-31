import { describe, it, expect, beforeEach } from "bun:test";
import { ConditionBuilder } from "./condition";
import { Action } from "./action";
import { QuickSilverEvent } from "../types";

describe("ConditionBuilder", () => {
  let builder: ConditionBuilder;

  beforeEach(() => {
    builder = new ConditionBuilder();
  });

  describe("when()", () => {
    it("should add a condition with an event trigger", () => {
      builder.when(QuickSilverEvent.PaymentReceived);
      
      const conditions = builder.getConditions();
      expect(conditions).toHaveLength(1);
      expect(conditions[0].trigger).toBe(QuickSilverEvent.PaymentReceived);
    });

    it("should add a condition with a custom predicate function", () => {
      const predicate = (ctx: any) => ctx.amount > 100;
      builder.when(QuickSilverEvent.PaymentReceived, predicate);
      
      const conditions = builder.getConditions();
      expect(conditions).toHaveLength(1);
      expect(conditions[0].predicate).toBe(predicate);
    });
  });

  describe("then()", () => {
    it("should add actions to the last condition", () => {
      const action = Action.notify({ id: "acc1" }, "Payment received");
      
      builder
        .when(QuickSilverEvent.PaymentReceived)
        .then(action);
      
      const conditions = builder.getConditions();
      expect(conditions[0].actions).toHaveLength(1);
      expect(conditions[0].actions[0]).toBe(action);
    });

    it("should throw error when called before when()", () => {
      const action = Action.notify({ id: "acc1" }, "Test");
      
      expect(() => {
        builder.then(action);
      }).toThrow("You must call '.when()' before '.then()'.");
    });
  });

  describe("otherwise()", () => {
    it("should add otherwise actions", () => {
      const action = Action.notify({ id: "acc1" }, "Fallback");
      
      builder.otherwise(action);
      
      const otherwiseActions = builder.getOtherwiseActions();
      expect(otherwiseActions).toHaveLength(1);
      expect(otherwiseActions[0]).toBe(action);
    });
  });

  describe("toJSON()", () => {
    it("should serialize conditions with event triggers", () => {
      const action = Action.notify({ id: "acc1" }, "Test");
      
      builder
        .when(QuickSilverEvent.PaymentReceived)
        .then(action);
      
      const result = builder.toJSON();
      
      expect(result).toEqual({
        conditions: [{
          trigger: QuickSilverEvent.PaymentReceived,
          predicate: undefined,
          actions: [action.toJSON()]
        }],
        otherwise: []
      });
    });

    it("should serialize otherwise actions", () => {
      const action = Action.notify({ id: "acc1" }, "Fallback");
      
      builder.otherwise(action);
      
      const result = builder.toJSON();
      
      expect(result).toEqual({
        conditions: [],
        otherwise: [action.toJSON()]
      });
    });
  });
});
