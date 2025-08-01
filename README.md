# Quicksilver SDK

A modern, idiomatic TypeScript SDK for the Quicksilver Engine API. Built with developer experience in mind, providing strong typing, real-time capabilities, and elegant abstractions.

## Features

- 🚀 **Modern TypeScript** - Full type safety with autocompletion
- ⚡ **Real-time Streaming** - SSE-based event handling for live updates
- 🏗️ **Resource-Oriented** - Clean, organized API surface
- 🔄 **Automatic Reconnection** - Robust SSE connection handling
- 🛡️ **Error Handling** - Comprehensive error types and handling
- 📦 **Tree-shakable** - Only import what you need

## Installation

```bash
# Using Bun (recommended)
bun add quicksilver-sdk

# Using npm
npm install quicksilver-sdk

# Using yarn
yarn add quicksilver-sdk
```

## Quick Start

```typescript
import { QuicksilverClient } from 'quicksilver-sdk';

const client = new QuicksilverClient('your-api-key-here');

// Create accounts
const alice = await client.accounts.create({
  name: 'Alice (Creator)',
  account_type: 'Human'
});

const bob = await client.accounts.create({
  name: 'Bob (Subscriber)',
  account_type: 'Human'
});

// Create a streaming transaction
const baseTx = await client.transactions.create({
  from: bob.id,
  to: alice.id,
  amount: 1000,
  currency: 'USD',
  transaction_type: 'Stream'
});

const stream = await client.transactions.createStream(baseTx.id, {
  rate: 0.5,
  rate_unit: 'PerSecond'
});

// Subscribe to real-time events
const connection = client.streams.subscribe(stream.base.id);

connection.on('batch_created', (data) => {
  console.log(`Payment created: $${data.amount}`);
});

connection.on('stream_event', (data) => {
  console.log(`Stream status: ${data.event_type}`);
});
```

## API Reference

### Client Initialization

```typescript
import { QuicksilverClient } from 'quicksilver-sdk';

const client = new QuicksilverClient(apiKey, {
  env: 'sandbox', // or 'production'
  baseURL: 'https://custom-api.example.com', // optional override
  timeout: 30000 // optional timeout in ms
});
```

### Accounts

```typescript
// Create an account
const account = await client.accounts.create({
  name: 'My Account',
  account_type: 'Human',
  parent_id: 'parent-account-id', // optional
  meta: { custom: 'data' } // optional
});

// Retrieve an account
const account = await client.accounts.retrieve('account-id');

// List accounts with pagination
const accounts = await client.accounts.list({
  page: 1,
  limit: 20
});

// Update an account
const updated = await client.accounts.update('account-id', {
  name: 'Updated Name'
});

// Delete an account
await client.accounts.delete('account-id');

// Get child accounts
const children = await client.accounts.getChildren('parent-id');
```

### Transactions

```typescript
// Create a transaction
const transaction = await client.transactions.create({
  amount: 100,
  currency: 'USD',
  transaction_type: 'Payment',
  from: 'sender-account-id',
  to: 'receiver-account-id'
});

// Retrieve a transaction
const transaction = await client.transactions.retrieve('transaction-id');

// List transactions with filters
const transactions = await client.transactions.list({
  from: 'account-id',
  transaction_type: 'Payment',
  state: 'Completed',
  page: 1,
  limit: 20
});

// Create a streaming transaction
const stream = await client.transactions.createStream('base-transaction-id', {
  rate: 0.5,
  rate_unit: 'PerSecond',
  start_time: '2024-01-01T00:00:00Z', // optional
  end_time: '2024-01-02T00:00:00Z' // optional
});
```

### Streaming Transactions

```typescript
// Retrieve stream status
const stream = await client.streams.retrieve('stream-id');

// List all streams
const streams = await client.streams.list({
  state: 'Active',
  page: 1,
  limit: 20
});

// Control stream
await client.streams.pause('stream-id');
await client.streams.resume('stream-id');
await client.streams.stop('stream-id');

// Update stream configuration
await client.streams.update('stream-id', {
  rate: 1.0,
  rate_unit: 'PerMinute'
});
```

### Real-time Events

```typescript
// Subscribe to a specific stream
const connection = client.streams.subscribe('stream-id');

// Subscribe to all streams for an account
const connection = client.streams.subscribeToAccount('account-id');

// Subscribe to all streams globally
const connection = client.streams.subscribeToAll();

// Handle events
connection.on('open', () => {
  console.log('Connection established');
});

connection.on('batch_created', (data) => {
  console.log(`Batch payment: $${data.amount} (${data.batch_transaction_id})`);
});

connection.on('stream_event', (data) => {
  console.log(`Stream ${data.stream_id}: ${data.event_type}`);
});

connection.on('error', (error) => {
  console.error('Connection error:', error);
});

connection.on('close', () => {
  console.log('Connection closed');
});

// Close connection
connection.close();

// Configure reconnection
connection.setMaxReconnectAttempts(10);
connection.setReconnectDelay(2000);
```

### Error Handling

```typescript
import { 
  QuicksilverError, 
  AuthenticationError, 
  NotFoundError,
  ValidationError 
} from 'quicksilver-sdk';

try {
  const account = await client.accounts.retrieve('invalid-id');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('Account not found');
  } else if (error instanceof AuthenticationError) {
    console.log('Invalid API key');
  } else if (error instanceof ValidationError) {
    console.log('Invalid request data');
  } else if (error instanceof QuicksilverError) {
    console.log(`API Error: ${error.message}`);
    console.log(`Status: ${error.statusCode}`);
  }
}
```

## TypeScript Support

The SDK is built with TypeScript and provides full type safety:

```typescript
import type { 
  Account, 
  Transaction, 
  StreamingTransaction,
  CreateAccountPayload 
} from 'quicksilver-sdk';

// All types are available for your own use
const accountData: CreateAccountPayload = {
  name: 'My Account',
  account_type: 'Human'
};
```

## Environment Variables

For production use, store your API key securely:

```bash
# .env
QUICKSILVER_API_KEY=your-api-key-here
```

```typescript
import { QuicksilverClient } from 'quicksilver-sdk';

const client = new QuicksilverClient(process.env.QUICKSILVER_API_KEY!);
```

## Development

```bash
# Install dependencies
bun install

# Build the SDK
bun run build

# Run in development mode (watch for changes)
bun run dev

# Run tests
bun test

# Type checking
bun run typecheck

# Lint code
bun run lint

# Format code
bun run format
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- Documentation: [docs.quicksilver.com](https://docs.quicksilver.com)
- Issues: [GitHub Issues](https://github.com/quicksilver/quicksilver-sdk/issues)
- Discord: [Join our community](https://discord.gg/quicksilver) 