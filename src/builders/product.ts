import { Currency, ProductDefinition } from '../types';

// Product is now just an alias for ProductBuilder since we don't need a separate build step
export type Product = ProductBuilder;

export class ProductBuilder {
  id: string;
  private definition: ProductDefinition;
  
  // Additional properties for test compatibility
  amount?: number;
  chargeUnit?: string;
  toAccountId?: string;
  fromAccountId?: string;
  currencyCode?: string;
  guarantees: any = {};
  stages: any[] = [];
  conditions: any[] = [];
  actions: any[] = [];
  metadata?: Record<string, any>;

  constructor(id: string) {
    this.id = id;
    this.definition = {
      id,
      pricing: { model: 'per_unit', rate: 0, unit: 'item', currency: 'USD' },
      guarantees: {},
      workflow: []
    };
  }

  /**
   * Defines a unit-based pricing model.
   */
  charge(rate: number, unit: string, currency: Currency = 'USD'): this {
    this.definition.pricing = { model: 'per_unit', rate, unit, currency };
    this.amount = rate;
    this.chargeUnit = unit;
    return this;
  }

  /**
   * Defines a streaming pricing model.
   */
  stream(rate: number, unit: 'per_second' | 'per_minute', currency: Currency = 'USD'): this {
    this.definition.pricing = { model: 'streaming', rate, unit, currency };
    return this;
  }

  /**
   * Adds a service level guarantee.
   */
  guarantee(guarantees: { [key: string]: any }): this {
    this.definition.guarantees = { ...this.definition.guarantees, ...guarantees };
    this.guarantees = guarantees;
    return this;
  }

  /**
   * Defines a stage in a multi-agent workflow.
   */
  stage(name: string, config: { delegateTo: string; charge: number }): this {
    const stageData = { name, ...config };
    this.definition.workflow.push(stageData);
    this.stages.push(stageData);
    return this;
  }

  /**
   * Gets the product's pricing information
   */
  getPricing(): any {
    return this.definition.pricing;
  }

  /**
   * Gets the product's guarantees
   */
  getGuarantees(): any {
    return this.definition.guarantees;
  }

  /**
   * Gets the product's workflow stages
   */
  getWorkflow(): any[] {
    return this.definition.workflow || [];
  }

  /**
   * Gets the product's structure for API usage
   */
  get structure(): ProductDefinition {
    return this.definition;
  }

  /**
   * Set destination account.
   */
  to(accountId: string): this {
    this.toAccountId = accountId;
    return this;
  }

  /**
   * Set source account.
   */
  from(accountId: string): this {
    this.fromAccountId = accountId;
    return this;
  }

  /**
   * Set currency.
   */
  currency(code: string): this {
    this.currencyCode = code;
    if (this.definition.pricing) {
      this.definition.pricing.currency = code as Currency;
    }
    return this;
  }

  /**
   * Add conditions.
   */
  withConditions(conditionBuilder: any): this {
    if (conditionBuilder.conditions) {
      this.conditions = conditionBuilder.conditions;
    } else if (conditionBuilder.getConditions) {
      this.conditions = conditionBuilder.getConditions();
    } else {
      this.conditions = [conditionBuilder];
    }
    return this;
  }

  /**
   * Add actions.
   */
  withActions(...actionBuilders: any[]): this {
    for (const actionBuilder of actionBuilders) {
      if (Array.isArray(actionBuilder)) {
        this.actions = [...this.actions, ...actionBuilder];
      } else if (actionBuilder.toJSON) {
        this.actions.push(actionBuilder.toJSON());
      } else {
        this.actions.push(actionBuilder);
      }
    }
    return this;
  }

  /**
   * Set metadata.
   */
  meta(metadata: Record<string, any>): this {
    this.metadata = { ...this.metadata, ...metadata };
    return this;
  }

  /**
   * Serializes the product to JSON for API transmission.
   */
  toJSON(): object {
    return this.definition;
  }
} 