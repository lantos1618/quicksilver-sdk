import { QuicksilverClient } from '../src/index';
import { accountDemo } from './account-demo';
import { transactionDemo } from './transaction-demo';
import { streamingDemo } from './streaming-demo';
import { conditionalsDemo } from './conditionals-demo';
import { getProductSpec } from './product-spec';

async function main() {
  const client = new QuicksilverClient(process.env.QUICKSILVER_API_KEY!);

  try {
    console.log('🚀 Quicksilver SDK - Complete Demo Suite\n');

    // Test API connection first
    console.log('🔗 Testing API connection...');
    try {
      const health = await client.health();
      console.log(`   ✅ API Status: ${health.status} (v${health.version})`);
    } catch (error) {
      console.log('   ⚠️  API health check failed, but continuing with demos...');
    }

    // Run all demos
    console.log('\n' + '='.repeat(60));
    console.log('🏦 ACCOUNT MANAGEMENT DEMO');
    console.log('='.repeat(60));
    const accountResults = await accountDemo();

    console.log('\n' + '='.repeat(60));
    console.log('💳 TRANSACTION MANAGEMENT DEMO');
    console.log('='.repeat(60));
    const transactionResults = await transactionDemo();

    console.log('\n' + '='.repeat(60));
    console.log('🌊 STREAMING TRANSACTIONS DEMO');
    console.log('='.repeat(60));
    const streamingResults = await streamingDemo();

    console.log('\n' + '='.repeat(60));
    console.log('🔐 CONDITIONAL TRANSACTIONS DEMO');
    console.log('='.repeat(60));
    const conditionalResults = await conditionalsDemo();

    // Product specification overview
    console.log('\n' + '='.repeat(60));
    console.log('📋 PRODUCT SPECIFICATION OVERVIEW');
    console.log('='.repeat(60));
    
    const productSpec = getProductSpec();
    console.log(`\n📦 ${productSpec.name} v${productSpec.version}`);
    console.log(`📝 ${productSpec.description}\n`);

    console.log('🎯 Key Features:');
    const availableFeatures = productSpec.features.filter(f => f.status === 'available');
    availableFeatures.forEach(feature => {
      console.log(`   ✅ ${feature.name} - ${feature.description}`);
    });

    console.log('\n🔮 Beta Features:');
    const betaFeatures = productSpec.features.filter(f => f.status === 'beta');
    betaFeatures.forEach(feature => {
      console.log(`   🔄 ${feature.name} - ${feature.description}`);
    });

    console.log('\n📈 Use Cases:');
    productSpec.useCases.forEach(useCase => {
      console.log(`   🎯 ${useCase.name} (${useCase.complexity})`);
      console.log(`      ${useCase.description}`);
      console.log(`      Industries: ${useCase.industry.join(', ')}`);
    });

    console.log('\n🚀 Roadmap Highlights:');
    const highPriorityItems = productSpec.roadmap.filter(item => item.priority === 'high');
    highPriorityItems.forEach(item => {
      console.log(`   🔥 ${item.title} (${item.targetDate})`);
      console.log(`      ${item.description}`);
    });

    // Demo summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 DEMO SUMMARY');
    console.log('='.repeat(60));
    
    console.log('\n✅ Completed Demos:');
    console.log(`   🏦 Account Management: ${accountResults.verifiedAccounts.length} verified accounts`);
    console.log(`   💳 Transaction Management: ${transactionResults.recentTransactions.length} transactions`);
    console.log(`   🌊 Streaming: ${Object.keys(streamingResults.streams).length} active streams`);
    console.log(`   🔐 Conditionals: ${conditionalResults.stats.total_transactions} conditional transactions`);

    console.log('\n🎯 Key Capabilities Demonstrated:');
    console.log('   • Multi-type account system with KYC/AML compliance');
    console.log('   • Real-time streaming payments with event handling');
    console.log('   • Conditional transaction logic (milestone, time, oracle-based)');
    console.log('   • Multi-currency support (USD, USDC, EUR)');
    console.log('   • Comprehensive error handling and validation');
    console.log('   • Real-time analytics and monitoring');

    console.log('\n🎉 All demos completed successfully!');
    console.log('\n💡 Next Steps:');
    console.log('   • Explore the SDK documentation');
    console.log('   • Check out the product specification');
    console.log('   • Try the individual demo modules');
    console.log('   • Build your own integration!');

  } catch (error) {
    console.error('❌ Demo suite error:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
  }
}

// Advanced integration examples
async function advancedIntegrationExamples() {
  const client = new QuicksilverClient(process.env.QUICKSILVER_API_KEY!);

  console.log('\n🔧 Advanced Integration Examples\n');

  // 1. Content Creator Platform Integration
  console.log('1. Content Creator Platform Integration...');
  
  const creator = await client.accounts.create({
    name: 'Content Creator Pro',
    account_type: 'Human',
    meta: { 
      kyc_status: 'verified',
      content_type: 'video',
      platform: 'youtube'
    }
  });

  const viewer = await client.accounts.create({
    name: 'Premium Viewer',
    account_type: 'Human',
    meta: { 
      kyc_status: 'verified',
      subscription_tier: 'premium'
    }
  });

  // Create streaming payment for content consumption
  const baseTx = await client.transactions.create({
    from: viewer.id,
    to: creator.id,
    amount: 100,
    currency: 'USD',
    transaction_type: 'Stream',
    meta: {
      content_id: 'video_123',
      content_type: 'video',
      duration: 600 // 10 minutes
    }
  });

  const stream = await client.transactions.createStream(baseTx.id, {
    rate: 0.01, // $0.01 per second
    rate_unit: 'PerSecond'
  });

  console.log(`   ✅ Created content streaming: $${stream.rate}/second`);

  // 2. Freelance Platform Integration
  console.log('\n2. Freelance Platform Integration...');
  
  const clientAccount = await client.accounts.create({
    name: 'Project Client',
    account_type: 'Human',
    meta: { kyc_status: 'verified' }
  });

  const freelancer = await client.accounts.create({
    name: 'Freelance Developer',
    account_type: 'Human',
    meta: { kyc_status: 'verified' }
  });

  const escrowAgent = await client.accounts.create({
    name: 'Platform Escrow',
    account_type: 'AgentMain',
    meta: { agent_type: 'escrow' }
  });

  // Create milestone-based payment
  const milestoneTx = await client.transactions.create({
    amount: 2000,
    currency: 'USD',
    transaction_type: 'Escrow',
    from: clientAccount.id,
    to: freelancer.id,
    parent_id: escrowAgent.id,
    meta: {
      project: 'Website Development',
      milestones: [
        { id: 'design', name: 'Design', amount: 500, status: 'pending' },
        { id: 'development', name: 'Development', amount: 1000, status: 'pending' },
        { id: 'testing', name: 'Testing', amount: 500, status: 'pending' }
      ]
    }
  });

  console.log(`   ✅ Created milestone payment: $${milestoneTx.amount}`);

  // 3. Gaming Platform Integration
  console.log('\n3. Gaming Platform Integration...');
  
  const gamer = await client.accounts.create({
    name: 'Gamer Account',
    account_type: 'Human',
    meta: { kyc_status: 'verified' }
  });

  const gameDev = await client.accounts.create({
    name: 'Game Developer',
    account_type: 'Human',
    meta: { kyc_status: 'verified' }
  });

  // Create microtransaction stream
  const gameStream = await client.transactions.createStream(
    (await client.transactions.create({
      from: gamer.id,
      to: gameDev.id,
      amount: 50,
      currency: 'USD',
      transaction_type: 'Stream',
      meta: { game_id: 'game_456', session_id: 'session_789' }
    })).id,
    {
      rate: 0.001, // $0.001 per action
      rate_unit: 'PerToken'
    }
  );

  console.log(`   ✅ Created gaming microtransaction: $${gameStream.rate}/token`);

  // 4. DeFi Integration Example
  console.log('\n4. DeFi Integration Example...');
  
  const defiUser = await client.accounts.create({
    name: 'DeFi User',
    account_type: 'Human',
    meta: { kyc_status: 'verified' }
  });

  const liquidityPool = await client.accounts.create({
    name: 'Liquidity Pool',
    account_type: 'AgentMain',
    meta: { agent_type: 'liquidity_pool' }
  });

  // Create conditional payment based on market conditions
  const defiTx = await client.transactions.create({
    amount: 1000,
    currency: 'USDC',
    transaction_type: 'Escrow',
    from: defiUser.id,
    to: liquidityPool.id,
    meta: {
      defi_protocol: 'yield_farming',
      conditional_logic: {
        type: 'oracle_based',
        oracle_id: 'price_oracle',
        condition: 'ETH_price > 3000',
        action: 'provide_liquidity'
      }
    }
  });

  console.log(`   ✅ Created DeFi conditional transaction: $${defiTx.amount} USDC`);

  console.log('\n🎉 Advanced integration examples completed!');
}

// Run the demos
if (require.main === module) {
  main()
    .then(() => advancedIntegrationExamples())
    .catch(console.error);
}

export { main, advancedIntegrationExamples }; 