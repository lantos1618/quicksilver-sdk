import { QuicksilverClient } from '../src/index';
import type { StreamingTransaction, CreateStreamingTransactionPayload } from '../src/types';

async function streamingDemo() {
  const client = new QuicksilverClient(process.env.QUICKSILVER_API_KEY!);

  try {
    console.log('🌊 Streaming Transactions Demo\n');

    // 1. Create test accounts
    console.log('1. Creating test accounts...');
    
    const creator = await client.accounts.create({
      name: 'Content Creator',
      account_type: 'Human',
      meta: { kyc_status: 'verified' }
    });

    const subscriber = await client.accounts.create({
      name: 'Premium Subscriber',
      account_type: 'Human',
      meta: { kyc_status: 'verified' }
    });

    console.log(`   ✅ Created accounts: ${creator.id}, ${subscriber.id}`);

    // 2. Different Rate Units Demo
    console.log('\n2. Creating Streams with Different Rate Units...');

    // Per Second Stream
    const perSecondStream = await createStreamWithBaseTransaction(
      client, subscriber.id, creator.id, 0.5, 'PerSecond', 'Per Second Stream'
    );
    console.log(`   ✅ Per Second: $${perSecondStream.rate}/second`);

    // Per Minute Stream
    const perMinuteStream = await createStreamWithBaseTransaction(
      client, subscriber.id, creator.id, 30, 'PerMinute', 'Per Minute Stream'
    );
    console.log(`   ✅ Per Minute: $${perMinuteStream.rate}/minute`);

    // Per Hour Stream
    const perHourStream = await createStreamWithBaseTransaction(
      client, subscriber.id, creator.id, 1800, 'PerHour', 'Per Hour Stream'
    );
    console.log(`   ✅ Per Hour: $${perHourStream.rate}/hour`);

    // Per Word Stream (for content creators)
    const perWordStream = await createStreamWithBaseTransaction(
      client, subscriber.id, creator.id, 0.01, 'PerWord', 'Per Word Stream'
    );
    console.log(`   ✅ Per Word: $${perWordStream.rate}/word`);

    // Per Token Stream (for AI content)
    const perTokenStream = await createStreamWithBaseTransaction(
      client, subscriber.id, creator.id, 0.005, 'PerToken', 'Per Token Stream'
    );
    console.log(`   ✅ Per Token: $${perTokenStream.rate}/token`);

    // Custom Rate Stream
    const customStream = await createStreamWithBaseTransaction(
      client, subscriber.id, creator.id, 1, { Custom: 'PerView' }, 'Custom Rate Stream'
    );
    console.log(`   ✅ Custom Rate: $${customStream.rate}/${customStream.rate_unit.Custom}`);

    // 3. Real-time Event Handling Demo
    console.log('\n3. Real-time Event Handling...');

    // Subscribe to multiple streams
    const streams = [perSecondStream, perMinuteStream, perHourStream];
    const connections: any[] = [];

    for (const stream of streams) {
      const connection = client.streams.subscribe(stream.base.id);
      
      connection.on('open', () => {
        console.log(`   [SSE] Connected to stream: ${stream.base.id}`);
      });

      connection.on('batch_created', (data) => {
        console.log(`   [SSE] Batch payment: $${data.amount} for stream ${data.stream_id}`);
      });

      connection.on('stream_event', (data) => {
        console.log(`   [SSE] Stream event: ${data.event_type} for stream ${data.stream_id}`);
      });

      connection.on('error', (err) => {
        console.error(`   [SSE] Error on stream ${stream.base.id}:`, err);
      });

      connections.push(connection);
    }

    // Let streams run for a few seconds
    console.log('   ⏳ Letting streams run for 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 4. Stream Control Demo
    console.log('\n4. Stream Control Operations...');

    // Pause a stream
    console.log('   ⏸️  Pausing per-second stream...');
    await client.streams.pause(perSecondStream.base.id);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Resume a stream
    console.log('   ▶️  Resuming per-second stream...');
    await client.streams.resume(perSecondStream.base.id);
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Update stream configuration
    console.log('   🔧 Updating per-minute stream rate...');
    await client.streams.update(perMinuteStream.base.id, {
      rate: 45, // Increase rate
      rate_unit: 'PerMinute'
    });

    // 5. Stream Analytics and Monitoring
    console.log('\n5. Stream Analytics and Monitoring...');

    // Get stream status
    const streamStatuses = await Promise.all(
      streams.map(stream => client.streams.retrieve(stream.base.id))
    );

    console.log('   📊 Stream Analytics:');
    for (const status of streamStatuses) {
      const totalAccumulated = status.accumulated;
      const streamDuration = new Date().getTime() - new Date(status.start_time).getTime();
      const durationMinutes = streamDuration / (1000 * 60);
      const avgRate = totalAccumulated / durationMinutes;

      console.log(`      Stream ${status.base.id}:`);
      console.log(`        Accumulated: $${totalAccumulated}`);
      console.log(`        Duration: ${durationMinutes.toFixed(2)} minutes`);
      console.log(`        Average rate: $${avgRate.toFixed(2)}/minute`);
      console.log(`        Last batch: ${status.last_batch}`);
    }

    // 6. Stream Scheduling Demo
    console.log('\n6. Stream Scheduling...');

    // Create a scheduled stream with start/end times
    const scheduledStream = await createStreamWithBaseTransaction(
      client, subscriber.id, creator.id, 10, 'PerMinute', 'Scheduled Stream',
      {
        start_time: new Date(Date.now() + 5000).toISOString(), // Start in 5 seconds
        end_time: new Date(Date.now() + 65000).toISOString()   // End in 65 seconds
      }
    );
    console.log(`   ✅ Scheduled stream: ${scheduledStream.base.id}`);

    // Subscribe to scheduled stream
    const scheduledConnection = client.streams.subscribe(scheduledStream.base.id);
    scheduledConnection.on('stream_event', (data) => {
      console.log(`   [Scheduled] Event: ${data.event_type}`);
    });

    // 7. Multi-Currency Streaming
    console.log('\n7. Multi-Currency Streaming...');

    const usdStream = await createStreamWithBaseTransaction(
      client, subscriber.id, creator.id, 1, 'PerMinute', 'USD Stream'
    );

    const usdcStream = await createStreamWithBaseTransaction(
      client, subscriber.id, creator.id, 1, 'PerMinute', 'USDC Stream'
    );

    const eurStream = await createStreamWithBaseTransaction(
      client, subscriber.id, creator.id, 0.85, 'PerMinute', 'EUR Stream'
    );

    console.log(`   ✅ Multi-currency streams: USD, USDC, EUR`);

    // 8. Stream Performance and Optimization
    console.log('\n8. Stream Performance and Optimization...');

    // Create high-frequency stream
    const highFreqStream = await createStreamWithBaseTransaction(
      client, subscriber.id, creator.id, 0.1, 'PerSecond', 'High Frequency Stream'
    );

    const highFreqConnection = client.streams.subscribe(highFreqStream.base.id);
    let batchCount = 0;
    
    highFreqConnection.on('batch_created', () => {
      batchCount++;
      if (batchCount % 10 === 0) {
        console.log(`   [High Freq] Processed ${batchCount} batches`);
      }
    });

    // 9. Stream Error Handling and Recovery
    console.log('\n9. Stream Error Handling and Recovery...');

    // Test connection resilience
    const resilientConnection = client.streams.subscribe(perSecondStream.base.id);
    
    resilientConnection.setMaxReconnectAttempts(5);
    resilientConnection.setReconnectDelay(1000);

    resilientConnection.on('error', (error) => {
      console.log(`   🔄 Connection error, attempting reconnection...`);
    });

    // 10. Cleanup and Stream Termination
    console.log('\n10. Stream Cleanup...');

    // Stop all streams
    const allStreams = [
      perSecondStream, perMinuteStream, perHourStream, 
      perWordStream, perTokenStream, customStream,
      scheduledStream, usdStream, usdcStream, eurStream, highFreqStream
    ];

    for (const stream of allStreams) {
      try {
        await client.streams.stop(stream.base.id);
        console.log(`   ✅ Stopped stream: ${stream.base.id}`);
      } catch (error) {
        console.log(`   ⚠️  Could not stop stream ${stream.base.id}: ${error}`);
      }
    }

    // Close all connections
    [...connections, scheduledConnection, highFreqConnection, resilientConnection].forEach(conn => {
      conn.close();
    });

    console.log('\n🎉 Streaming Transactions Demo completed successfully!');

    return {
      creator,
      subscriber,
      streams: {
        perSecondStream,
        perMinuteStream,
        perHourStream,
        perWordStream,
        perTokenStream,
        customStream,
        scheduledStream,
        usdStream,
        usdcStream,
        eurStream,
        highFreqStream
      },
      streamStatuses
    };

  } catch (error) {
    console.error('❌ Streaming demo error:', error);
    throw error;
  }
}

// Helper function to create a stream with base transaction
async function createStreamWithBaseTransaction(
  client: QuicksilverClient,
  fromId: string,
  toId: string,
  rate: number,
  rateUnit: any,
  description: string,
  streamOptions?: Partial<CreateStreamingTransactionPayload>
) {
  // Create base transaction
  const baseTx = await client.transactions.create({
    from: fromId,
    to: toId,
    amount: 10000, // Large amount for streaming
    currency: 'USD',
    transaction_type: 'Stream',
    meta: { description }
  });

  // Create streaming transaction
  const stream = await client.transactions.createStream(baseTx.id, {
    rate,
    rate_unit: rateUnit,
    ...streamOptions
  });

  return stream;
}

export { streamingDemo }; 