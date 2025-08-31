// examples/2-fluent-transactions.ts
import { QuicksilverClient, Account } from '../src';

// Initialize the client
const client = new QuicksilverClient('your-api-key', { env: 'sandbox' });

async function fluentTransactionsDemo() {
  console.log('💸 Fluent Transactions Demo\n');

  // Create accounts (now returns active Account models directly!)
  const sender = await client.accounts.create({
    name: 'Sender Account',
    account_type: 'Human'
  });

  const recipient = await client.accounts.create({
    name: 'Recipient Account',
    account_type: 'Human'
  });

  console.log(`   ✅ Created accounts: ${sender.id} -> ${recipient.id}`);

  // Create transactions using the fluent interface
  const paymentTx = sender.transaction({
    amount: 100,
    currency: 'USD',
    transaction_type: 'Payment',
    to: recipient.id,
    meta: {
      description: 'Test payment',
      category: 'demo'
    }
  });

  console.log('   💳 Created payment transaction');

  // Execute the transaction
  await paymentTx.execute();
  console.log(`   ✅ Payment executed: ${paymentTx.id}`);

  // Check transaction status
  console.log(`   📊 Transaction state: ${paymentTx.data.state}`);
  console.log(`   💰 Transaction cost: $${await paymentTx.getCost()}`);

  // Create a scheduled transaction
  const scheduledTx = sender.transaction({
    amount: 50,
    currency: 'USD',
    transaction_type: 'Scheduled',
    to: recipient.id,
    meta: {
      schedule: '2024-01-15T10:00:00Z',
      description: 'Scheduled payment'
    }
  });

  console.log('   ⏰ Created scheduled transaction');

  // Create a streaming transaction
  const streamingTx = sender.transaction({
    amount: 200,
    currency: 'USD',
    transaction_type: 'Stream',
    to: recipient.id,
    meta: {
      rate: 0.01,
      rate_unit: 'per_second',
      description: 'Streaming payment'
    }
  });

  console.log('   🌊 Created streaming transaction');

  // Execute streaming transaction
  await streamingTx.execute();
  console.log(`   ✅ Streaming started: ${streamingTx.id}`);

  // Simulate some time passing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Refresh transaction data
  await streamingTx.refresh();
  console.log(`   📈 Streaming accumulated: $${await streamingTx.getCost()}`);

  // Cancel a transaction
  await scheduledTx.cancel();
  console.log('   ❌ Cancelled scheduled transaction');

  console.log('\n   🎉 Fluent transactions demo completed!');
}

export { fluentTransactionsDemo }; 