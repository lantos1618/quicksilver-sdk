import { Action as ActionInterface, Currency } from '../types';

export class Action implements ActionInterface {
  type: string;
  private data: Record<string, any>;

  constructor(type: string, data: Record<string, any> = {}) {
    this.type = type;
    this.data = data;
  }

  /**
   * Creates a payment action to release funds to a specific account.
   */
  static release(amount: number, currency: Currency = 'USD'): ActionBuilder {
    return new ActionBuilder('release', { amount, currency });
  }

  /**
   * Creates a notification action to inform an account.
   */
  static notify(account: any, message: string): Action {
    return new Action('notify', { account, message });
  }

  /**
   * Creates a hold action to pause execution with a message.
   */
  static hold(message: string): Action {
    return new Action('hold', { message });
  }

  /**
   * Creates a custom action with arbitrary data.
   */
  static custom(type: string, data: Record<string, any>): Action {
    return new Action(type, data);
  }

  /**
   * Serializes the action to JSON for API transmission.
   */
  toJSON(): object {
    return {
      type: this.type,
      ...this.data
    };
  }
}

/**
 * Fluent builder for complex actions like payments.
 */
export class ActionBuilder {
  private type: string;
  private data: Record<string, any>;

  constructor(type: string, data: Record<string, any> = {}) {
    this.type = type;
    this.data = data;
  }

  /**
   * Specifies the target account for the action.
   */
  to(account: any): ActionBuilder {
    this.data['to'] = account;
    return this;
  }

  /**
   * Adds metadata to the action.
   */
  withMeta(meta: Record<string, any>): ActionBuilder {
    this.data['meta'] = { ...this.data['meta'], ...meta };
    return this;
  }

  /**
   * Finalizes the action builder into an Action object.
   */
  build(): Action {
    return new Action(this.type, this.data);
  }

  /**
   * Convenience method to build and return the action directly.
   */
  toJSON(): object {
    return this.build().toJSON();
  }
} 