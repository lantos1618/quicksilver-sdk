import { QuickSilverEvent, Condition as ConditionInterface, Action } from '../types';
import { Action as ActionClass, ActionBuilder } from './action';

export class ConditionBuilder {
  private conditions: ConditionInterface[] = [];
  private otherwiseActions: Action[] = [];

  /**
   * Defines a trigger for a set of actions.
   * @param trigger - An event or a custom predicate function.
   * @param predicate - An optional refining predicate.
   */
  when(trigger: QuickSilverEvent | ((ctx: any) => boolean), predicate?: (ctx: any) => boolean): this {
    const condition: ConditionInterface = { 
      trigger, 
      actions: [] 
    };
    if (predicate) {
      condition.predicate = predicate;
    }
    this.conditions.push(condition);
    return this;
  }

  /**
   * Defines the action(s) to take when the preceding `when` condition is met.
   * @param actions - One or more actions to execute.
   */
  then(...actions: (Action | ActionClass | ActionBuilder)[]): this {
    if (this.conditions.length === 0) {
      throw new Error("You must call '.when()' before '.then()'.");
    }
    
    // Accept ActionClass, ActionBuilder, and plain Action interfaces
    const convertedActions = actions.map(action => 
      (action instanceof ActionClass || action instanceof ActionBuilder) ? action : action
    );
    
    const lastCondition = this.conditions[this.conditions.length - 1];
    if (lastCondition) {
      lastCondition.actions.push(...convertedActions);
    }
    return this;
  }

  /**
   * Defines a fallback action if no `when` conditions are met.
   */
  otherwise(...actions: (Action | ActionClass | ActionBuilder)[]): this {
    const convertedActions = actions.map(action => 
      (action instanceof ActionClass || action instanceof ActionBuilder) ? action : action
    );
    this.otherwiseActions.push(...convertedActions);
    return this;
  }

  /**
   * Compiles the builder into the JSON structure the API expects.
   * This is the "magic" that hides complexity from the developer.
   */
  toJSON(): object {
    return {
      conditions: this.conditions.map(c => ({
        trigger: typeof c.trigger === 'function' ? 'custom_function' : c.trigger,
        predicate: c.predicate ? 'custom_predicate' : undefined,
        actions: c.actions.map(a => a.toJSON()),
      })),
      otherwise: this.otherwiseActions.map(a => a.toJSON()),
    };
  }

  /**
   * Returns the raw conditions array for internal use.
   */
  getConditions(): ConditionInterface[] {
    return this.conditions;
  }

  /**
   * Returns the otherwise actions for internal use.
   */
  getOtherwiseActions(): Action[] {
    return this.otherwiseActions;
  }
} 