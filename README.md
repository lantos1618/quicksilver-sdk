# Quicksilver SDK

> **A new primitive for programmable money** - Transform your SDK from a generic REST wrapper into a fluent Domain-Specific Language (DSL) for Agent Commerce.

## 🚀 The Vision

Quicksilver isn't just another payment API. It's a **new primitive for programmable money** that enables developers to build sophisticated economic interactions with elegant, type-safe code.

### Before: Generic REST Wrapper
```typescript
// ❌ Ugly, untyped, error-prone
const transactionData = await client.transactions.create({
  amount: 5000,
  currency: 'USD',
  transaction_type: 'Escrow',
  meta: {
    conditional_logic: {
      type: 'milestone_based',
      release_conditions: [{ milestone: 'design', condition: 'client_approval' }]
    }
  }
});
// Now returns active Transaction model directly!
```

### After: Fluent DSL for Programmable Money
```typescript
// ✅ Elegant, type-safe, expressive
const escrowTx = clientAccount.transaction({
  amount: 5000,
  currency: 'USD',
  transaction_type: 'Escrow',
  to: freelancerAccount.id,
  conditions: client.condition()
    .when(QuickSilverEvent.MilestoneApproved, ctx => ctx.milestone === 'design')
    .then(Action.release(1000).to(freelancerAccount))
    .then(Action.notify(clientAccount, 'Design milestone paid.'))
    .otherwise(Action.hold('Awaiting approval.'))
    .getConditions()
});
```

## 🏗️ Architecture

### Core Philosophy: From API Wrapper to Fluent DSL

1. **Builder Pattern**: Complex operations use fluent, chainable builders
2. **Active Records**: `Account` and `Transaction` objects have methods, not just data
3. **First-Class Primitives**: `Condition` and `Product` are core concepts
4. **Type Safety**: Invalid states are impossible, rich autocompletion
5. **Hide Complexity**: Builders generate JSON behind the scenes

### New File Structure

```
src/
├── client.ts              # Factory for builders
├── builders/              # Fluent builders
│   ├── action.ts         # Action definitions
│   ├── condition.ts      # Conditional logic
│   └── product.ts        # Programmable products
├── models/               # Active models
│   ├── account.ts        # Account with methods
│   └── transaction.ts    # Transaction with methods
└── resources/            # Legacy REST wrapper
    ├── accounts.ts
    └── transactions.ts
```

## 📦 Installation

```bash
npm install quicksilver-sdk
# or
bun add quicksilver-sdk
```

## 🎯 Quick Start

### 1. Initialize the Client

```typescript
import { QuicksilverClient } from 'quicksilver-sdk';

const client = new QuicksilverClient('your-api-key', { 
  env: 'sandbox' 
});
```

### 2. Create Active Accounts

```typescript
// Create accounts (now returns active Account models directly!)
const mainAgent = await client.accounts.create({
  name: 'Main AI Agent',
  account_type: 'AgentMain'
});

// Delegate sub-agents fluently
const researchAgent = await account.delegate({
  name: 'Research Sub-Agent',
  limits: { daily: 2000 }
});
```

### 3. Define Conditional Logic

```typescript
// Elegant conditional logic - no more ugly JSON blobs
const projectCondition = client.condition()
  .when(QuickSilverEvent.MilestoneApproved, ctx => ctx.milestone === 'design')
  .then(Action.release(1000).to(freelancerAccount))
  .then(Action.notify(clientAccount, 'Design milestone paid.'))
  
  .when(QuickSilverEvent.MilestoneApproved, ctx => ctx.milestone === 'deploy')
  .then(Action.release(4000).to(freelancerAccount))
  
  .otherwise(Action.hold('Awaiting milestone approval.'));
```

### 4. Create Programmable Products

```typescript
// Define services as programmable products
const translationService = client.product('ai-translation-en-es')
  .charge(0.01, 'per_word')
  .guarantee({ accuracy: 0.98, turnaround: '5 minutes' });

// Multi-agent workflow as a product
const contentPipeline = client.product('blog-post-pipeline')
  .stage('research', { delegateTo: researchAgent.id, charge: 20 })
  .stage('writing', { delegateTo: writerAgent.id, charge: 40 })
  .guarantee({ delivery: '24 hours' });
```

### 5. Execute Transactions

```typescript
// Create transactions with fluent interface
const escrowTx = clientAccount.transaction({
  amount: 5000,
  currency: 'USD',
  transaction_type: 'Escrow',
  to: freelancerAccount.id,
  conditions: projectCondition.getConditions()
});

// Execute and trigger events
await escrowTx.execute();
await escrowTx.triggerEvent(QuickSilverEvent.MilestoneApproved, { 
  milestone: 'design' 
});
```

## 🎨 Examples

### Conditional Escrow

```typescript
// examples/3-conditional-escrow.ts
const projectCondition = client.condition()
  .when(QuickSilverEvent.MilestoneApproved, ctx => ctx.milestone === 'design')
  .then(Action.release(1000).to(freelancerAccount))
  .then(Action.notify(clientAccount, 'Design milestone paid.'))

  .when(QuickSilverEvent.MilestoneApproved, ctx => ctx.milestone === 'deploy')
  .then(Action.release(4000).to(freelancerAccount))

  .otherwise(Action.hold('Awaiting milestone approval.'));

const escrowTx = clientAccount.transaction({
  amount: 5000,
  currency: 'USD',
  transaction_type: 'Escrow',
  to: freelancerAccount.id,
  conditions: projectCondition.getConditions()
});

await escrowTx.execute();
```

### Programmable Products

```typescript
// examples/4-programmable-products.ts
const translationService = client.product('ai-translation-en-es')
  .charge(0.01, 'per_word')
  .guarantee({ accuracy: 0.98, turnaround: '5 minutes' });

const contentPipeline = client.product('blog-post-pipeline')
  .stage('research', { delegateTo: researchAgent.id, charge: 20 })
  .stage('writing', { delegateTo: writerAgent.id, charge: 40 })
  .guarantee({ delivery: '24 hours' });

// Purchase products
const translationJob = await customer.purchase(translationService, {
  text: "The agent economy is at an inflection point.",
  word_count: 8
});
```

### Streaming Payments

```typescript
// examples/5-streaming-and-events.ts
const streamingCondition = client.condition()
  .when(QuickSilverEvent.StreamStarted)
  .then(Action.notify(contentCreator, 'Stream started - payments beginning'))
  
  .when(QuickSilverEvent.PaymentReceived)
  .then(Action.notify(contentCreator, 'Payment received'))
  
  .when(QuickSilverEvent.StreamStopped)
  .then(Action.notify(contentCreator, 'Stream ended - final payment sent'))
  .then(Action.release(50).to(contentCreator)) // Bonus for completion

  .otherwise(Action.hold('Stream in progress...'));

const streamingTx = platform.transaction({
  amount: 1000,
  currency: 'USD',
  transaction_type: 'Stream',
  to: contentCreator.id,
  conditions: streamingCondition.getConditions(),
  meta: { rate: 0.01, rate_unit: 'per_second' }
});

await streamingTx.execute();
```

## 🔧 API Reference

### Client

```typescript
class QuicksilverClient {
  // DSL Builders
  condition(): ConditionBuilder
  product(id: string): ProductBuilder
  
  // Legacy Resources
  accounts: AccountsResource
  transactions: TransactionsResource
  streams: StreamsResource
}
```

### Account Model

```typescript
class Account {
  // Delegation
  delegate(options: { name: string, limits: { daily: number } }): Promise<Account>
  
  // Transactions
  transaction(details: TransactionDetails): Transaction
  purchase(product: Product, options: any): Promise<Transaction>
  
  // Management
  refresh(): Promise<this>
  getChildren(): Promise<Account[]>
  updateLimits(limits: Limits): Promise<this>
  getBalance(): Promise<Balance>
}
```

### Transaction Model

```typescript
class Transaction {
  // Execution
  execute(): Promise<this>
  cancel(): Promise<this>
  triggerEvent(event: string, context: any): Promise<this>
  
  // Information
  getCost(): Promise<number>
  refresh(): Promise<this>
  isFinal(): boolean
  isPending(): boolean
  
  // Management
  withConditions(conditionBuilder: ConditionBuilder): this
  getMeta(): Record<string, any>
  updateMeta(meta: Record<string, any>): Promise<this>
}
```

### Condition Builder

```typescript
class ConditionBuilder {
  when(trigger: QuickSilverEvent | ((ctx: any) => boolean), predicate?: (ctx: any) => boolean): this
  then(...actions: Action[]): this
  otherwise(...actions: Action[]): this
  toJSON(): object
  getConditions(): Condition[]
}
```

### Product Builder

```typescript
class ProductBuilder {
  charge(rate: number, unit: string, currency?: Currency): this
  stream(rate: number, unit: 'per_second' | 'per_minute', currency?: Currency): this
  guarantee(guarantees: Record<string, any>): this
  stage(name: string, config: { delegateTo: string, charge: number }): this
  // No build() method needed - ProductBuilder acts as Product directly
}
```

### Action Builder

```typescript
class Action {
  static release(amount: number, currency?: Currency): ActionBuilder
  static notify(account: any, message: string): Action
  static hold(message: string): Action
  static custom(type: string, data: Record<string, any>): Action
}

class ActionBuilder {
  to(account: any): ActionBuilder
  withMeta(meta: Record<string, any>): ActionBuilder
  // No build() method needed - ActionBuilder implements ActionInterface directly
}
```

## 🎯 Use Cases

### Content Creator Monetization
Real-time payment streams based on engagement, views, or time spent.

### Freelance Platform Payments
Milestone-based payments with escrow and conditional release.

### Subscription Services
Automated recurring payments with usage-based billing.

### Gaming Platforms
Real-time microtransactions and reward systems.

### DeFi Infrastructure
Conditional payments and oracle integration.

### Enterprise Payments
Large-scale processing with compliance and audit trails.

## 🚀 Getting Started

1. **Install the SDK**: `npm install quicksilver-sdk`
2. **Get an API Key**: Sign up at [quicksilver.com](https://quicksilver.com)
3. **Run Examples**: Check out the `examples/` directory
4. **Build Something**: Start with simple transactions, then add conditional logic

## 📚 Examples

- `examples/1-accounts-and-delegation.ts` - Account creation and delegation
- `examples/2-fluent-transactions.ts` - Basic transaction types
- `examples/3-conditional-escrow.ts` - Conditional logic and escrow
- `examples/4-programmable-products.ts` - Product definitions and purchases
- `examples/5-streaming-and-events.ts` - Streaming payments and events

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Quicksilver SDK** - Where elegant design meets programmable money. 💎 