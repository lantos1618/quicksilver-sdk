// examples/5-streaming-and-events.ts
import { QuicksilverClient, Account, Transaction } from '../src/index';

async function streamingAndEventsDemo() {
  const client = new QuicksilverClient(process.env.QUICKSILVER_API_KEY!);

  try {
    console.log('🌊 Streaming & Events Demo - Real-Time Power\n');

    // 1. Create test accounts
    console.log('1. Creating test accounts...');
    
    const streamerData = await client.accounts.create({
      name: 'Content Streamer',
      account_type: 'Human',
      meta: { kyc_status: 'verified' }
    });
    const streamer = client.createAccount(streamerData);

    const viewerData = await client.accounts.create({
      name: 'Content Viewer',
      account_type: 'Human',
      meta: { kyc_status: 'verified' }
    });
    const viewer = client.createAccount(viewerData);

    console.log(`   ✅ Created accounts: ${streamer}, ${viewer}`);

    // 2. Create streaming transactions
    console.log('\n2. Creating streaming transactions...');
    
    const contentStream = streamer.transaction({
      amount: 1000,
      currency: 'USD',
      transaction_type: 'Stream',
      to: viewer.id,
      meta: {
        content_type: 'video_stream',
        duration: 3600, // 1 hour
        quality: '1080p'
      }
    });

    await contentStream.execute();
    console.log(`   ✅ Created content stream: ${contentStream.id}`);

    const microPaymentStream = streamer.transaction({
      amount: 500,
      currency: 'USD',
      transaction_type: 'Stream',
      to: viewer.id,
      meta: {
        content_type: 'micro_payments',
        rate: 0.01,
        rate_unit: 'per_second'
      }
    });

    await microPaymentStream.execute();
    console.log(`   ✅ Created micro-payment stream: ${microPaymentStream.id}`);

    // 3. Subscribe to real-time events
    console.log('\n3. Subscribing to real-time events...');
    
    const contentConnection = contentStream.subscribe();
    const paymentConnection = microPaymentStream.subscribe();

    // Set up event listeners
    contentConnection.on('stream_event', (data) => {
      console.log(`   📺 [Content Stream] ${data.event_type}: ${data.timestamp}`);
    });

    contentConnection.on('batch_created', (data) => {
      console.log(`   💰 [Content Stream] Batch payment: $${data.amount} (${data.batch_transaction_id})`);
    });

    paymentConnection.on('stream_event', (data) => {
      console.log(`   💸 [Payment Stream] ${data.event_type}: ${data.timestamp}`);
    });

    paymentConnection.on('batch_created', (data) => {
      console.log(`   💰 [Payment Stream] Batch payment: $${data.amount} (${data.batch_transaction_id})`);
    });

    console.log('   ✅ Event listeners configured');

    // 4. Simulate streaming activity
    console.log('\n4. Simulating streaming activity...');
    
    // Simulate content stream events
    console.log('   🎬 Simulating content stream events...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate payment stream events
    console.log('   💸 Simulating payment stream events...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 5. Stream control operations
    console.log('\n5. Stream control operations...');
    
    // Pause the content stream
    await client.streams.pause(contentStream.id);
    console.log(`   ⏸️  Paused content stream: ${contentStream.id}`);

    // Resume the content stream
    await client.streams.resume(contentStream.id);
    console.log(`   ▶️  Resumed content stream: ${contentStream.id}`);

    // Update stream parameters
    await client.streams.update(contentStream.id, {
      rate: 0.02,
      rate_unit: 'PerSecond'
    });
    console.log(`   🔧 Updated content stream parameters`);

    // 6. Stream analytics and monitoring
    console.log('\n6. Stream analytics and monitoring...');
    
    const contentStreamInfo = await client.streams.retrieve(contentStream.id);
    console.log(`   📊 Content Stream Analytics:`);
    console.log(`      Rate: ${contentStreamInfo.rate} ${contentStreamInfo.rate_unit}`);
    console.log(`      Accumulated: $${contentStreamInfo.accumulated || 0}`);

    const paymentStreamInfo = await client.streams.retrieve(microPaymentStream.id);
    console.log(`   📊 Payment Stream Analytics:`);
    console.log(`      Rate: ${paymentStreamInfo.rate} ${paymentStreamInfo.rate_unit}`);
    console.log(`      Accumulated: $${paymentStreamInfo.accumulated || 0}`);

    // 7. List all streams
    console.log('\n7. Listing all streams...');
    
    const allStreams = await client.streams.list({ limit: 10 });
    console.log(`   📋 Found ${allStreams.data.length} active streams`);
    
    for (const stream of allStreams.data) {
      console.log(`      ${stream.base.id}: ${stream.base.state} - $${stream.rate}/${stream.rate_unit}`);
    }

    // 8. Stream completion and cleanup
    console.log('\n8. Stream completion and cleanup...');
    
    // Stop the content stream
    await client.streams.stop(contentStream.id);
    console.log(`   🛑 Stopped content stream: ${contentStream.id}`);

    // Stop the payment stream
    await client.streams.stop(microPaymentStream.id);
    console.log(`   🛑 Stopped payment stream: ${microPaymentStream.id}`);

    // Close SSE connections
    contentConnection.close();
    paymentConnection.close();
    console.log('   🔌 Closed SSE connections');

    // 9. Final transaction status
    console.log('\n9. Final transaction status...');
    
    await contentStream.refresh();
    await microPaymentStream.refresh();
    
    console.log(`   📊 Content Stream Final Status:`);
    console.log(`      State: ${contentStream.getStatus()}`);
    console.log(`      Cost: $${await contentStream.getCost()}`);
    console.log(`      Metadata: ${JSON.stringify(contentStream.getMetadata())}`);

    console.log(`   📊 Payment Stream Final Status:`);
    console.log(`      State: ${microPaymentStream.getStatus()}`);
    console.log(`      Cost: $${await microPaymentStream.getCost()}`);
    console.log(`      Metadata: ${JSON.stringify(microPaymentStream.getMetadata())}`);

    // 10. Advanced streaming scenarios
    console.log('\n10. Advanced streaming scenarios...');
    
    // Create a conditional streaming transaction
    const conditionalStream = streamer.transaction({
      amount: 200,
      currency: 'USD',
      transaction_type: 'Stream',
      to: viewer.id,
      meta: {
        content_type: 'conditional_stream',
        conditions: ['viewer_engagement', 'content_quality']
      }
    });

    await conditionalStream.execute();
    console.log(`   ✅ Created conditional stream: ${conditionalStream.id}`);

    // Subscribe to conditional stream events
    const conditionalConnection = conditionalStream.subscribe();
    conditionalConnection.on('stream_event', (data) => {
      console.log(`   🎯 [Conditional Stream] ${data.event_type}: ${data.timestamp}`);
    });

    // Simulate conditional events
    console.log('   🎯 Simulating conditional stream events...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Stop conditional stream
    await client.streams.stop(conditionalStream.id);
    conditionalConnection.close();

    console.log('\n🎉 Streaming & Events Demo completed successfully!');
    
    return {
      accounts: {
        streamer,
        viewer
      },
      streams: {
        content: contentStream,
        payment: microPaymentStream,
        conditional: conditionalStream
      },
      connections: {
        content: contentConnection,
        payment: paymentConnection,
        conditional: conditionalConnection
      }
    };

  } catch (error) {
    console.error('❌ Streaming and events demo error:', error);
    throw error;
  }
}

export { streamingAndEventsDemo }; 