import { Currency, ProductDefinition } from '../types';

// Product is now just an alias for ProductBuilder since we don't need a separate build step
export type Product = ProductBuilder;

export class ProductBuilder {
  id: string;
  private definition: ProductDefinition;

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
    return this;
  }

  /**
   * Defines a stage in a multi-agent workflow.
   */
  stage(name: string, config: { delegateTo: string; charge: number }): this {
    this.definition.workflow.push({ name, ...config });
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
   * Serializes the product to JSON for API transmission.
   */
  toJSON(): object {
    return this.definition;
  }
} 