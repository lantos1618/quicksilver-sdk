// examples/5-streaming-and-events.ts
import { QuicksilverClient, QuickSilverEvent, Action, Account } from '../src';

// Initialize the client
const client = new QuicksilverClient('your-api-key', { env: 'sandbox' });

async function streamingAndEventsDemo() {
  console.log('🌊 Streaming and Events Demo\n');

  // Create accounts (now returns active Account models directly!)
  const contentCreator = await client.accounts.create({
    name: 'Content Creator',
    account_type: 'Human'
  });

  const platform = await client.accounts.create({
    name: 'Platform Account',
    account_type: 'AgentMain'
  });

  // Define a streaming payment with conditional logic
  const streamingCondition = client.condition()
    .when(QuickSilverEvent.StreamStarted)
    .then(Action.notify(contentCreator.id, 'Stream started - payments beginning'))
    
    .when(QuickSilverEvent.PaymentReceived)
    .then(Action.notify(contentCreator.id, 'Payment received'))
    
    .when(QuickSilverEvent.StreamStopped)
    .then(Action.notify(contentCreator.id, 'Stream ended - final payment sent'))
    .then(Action.release(50).to(contentCreator.id).build()) // Bonus for completion

    .otherwise(Action.hold('Stream in progress...'));

  // Create a streaming transaction
  const streamingTx = platform.transaction({
    amount: 1000, // Total budget
    currency: 'USD',
    transaction_type: 'Stream',
    to: contentCreator.id,
    conditions: streamingCondition.getConditions(),
    meta: {
      rate: 0.01, // $0.01 per second
      rate_unit: 'per_second',
      content_type: 'live_streaming'
    }
  });

  // Execute the streaming transaction
  await streamingTx.execute();
  console.log(`   ✅ Streaming transaction created: ${streamingTx.id}`);

  // Simulate stream events
  console.log('\n   🎬 Simulating stream events...');
  
  await streamingTx.triggerEvent(QuickSilverEvent.StreamStarted, {
    stream_id: 'stream_123',
    viewer_count: 150
  });
  console.log('      -> Stream started');

  // Simulate periodic payments
  for (let i = 1; i <= 3; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    await streamingTx.triggerEvent(QuickSilverEvent.PaymentReceived, {
      amount: 0.01 * i,
      duration: i
    });
    console.log(`      -> Payment ${i} received`);
  }

  await streamingTx.triggerEvent(QuickSilverEvent.StreamStopped, {
    total_duration: 3,
    final_viewer_count: 200
  });
  console.log('      -> Stream ended');

  console.log('\n   🎉 Streaming demo completed!');
}

// Run the demo
streamingAndEventsDemo().catch(console.error); 