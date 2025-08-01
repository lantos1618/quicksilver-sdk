import { Currency, ProductDefinition } from '../types';

// Represents a fully defined, usable product
export class Product {
  id: string;
  structure: ProductDefinition; // The final JSON representation for the API

  constructor(id: string, structure: ProductDefinition) {
    this.id = id;
    this.structure = structure;
  }

  /**
   * Serializes the product to JSON for API transmission.
   */
  toJSON(): object {
    return this.structure;
  }
}

export class ProductBuilder {
  private id: string;
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
   * Finalizes the product definition.
   * In a real SDK, this might also register the product with the API.
   */
  build(): Product {
    // The builder creates the clean, structured JSON object
    return new Product(this.id, this.definition);
  }

  /**
   * Convenience method to build and return the product directly.
   */
  toJSON(): object {
    return this.build().toJSON();
  }
} 