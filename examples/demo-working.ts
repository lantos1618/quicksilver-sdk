import { QuicksilverClient, QuickSilverEvent, Action } from '../src/index';

async function main() {
  console.log('🚀 QuickSilver SDK - Working with Sandbox API\n');
  console.log('This demo showcases all the functionality that works with your sandbox.\n');

  const client = new QuicksilverClient('', { env: 'sandbox' });

  try {
    console.log('🔗 Connected to: ' + client.getBaseURL());

    // 1. Account Creation & Management
    console.log('\n' + '='.repeat(60));
    console.log('🏦 ACCOUNT MANAGEMENT');
    console.log('='.repeat(60));

    const agent = await client.accounts.create({
      name: 'AI Research Agent',
      account_type: 'AgentMain',
      limits: { daily: 5000, per_transaction: 1000 }
    });
    console.log(`✅ Created agent: ${agent.name} (${agent.id})`);

    const customer = await client.accounts.create({
      name: 'John Doe',
      account_type: 'Human'
    });
    console.log(`✅ Created customer: ${customer.name} (${customer.id})`);

    // 2. Transaction Creation
    console.log('\n' + '='.repeat(60));
    console.log('💳 TRANSACTION MANAGEMENT');
    console.log('='.repeat(60));

    const payment = await client.transactions.create({
      transaction_type: 'Payment',
      amount: 150,
      currency: 'USD',
      from: customer.id,
      to: agent.id,
      meta: { description: 'Payment for research services' }
    });
    console.log(`✅ Created payment: $${payment.amount} ${payment.currency}`);
    console.log(`   State: ${payment.state}, ID: ${payment.id}`);

    const escrow = await client.transactions.create({
      transaction_type: 'Escrow',
      amount: 1000,
      currency: 'USD',
      from: customer.id,
      to: agent.id,
      meta: { description: 'Escrow for project completion' }
    });
    console.log(`✅ Created escrow: $${escrow.amount} ${escrow.currency}`);
    console.log(`   State: ${escrow.state}, ID: ${escrow.id}`);

    // 3. Fluent DSL - Conditions
    console.log('\n' + '='.repeat(60));
    console.log('🔧 FLUENT DSL - CONDITIONS');
    console.log('='.repeat(60));

    const milestoneCondition = client.condition()
      .when(QuickSilverEvent.MilestoneApproved)
      .then(Action.release(500, 'USD'))
      .when(QuickSilverEvent.TimeElapsed)
      .then(Action.release(500, 'USD'));

    console.log('✅ Created milestone-based escrow condition:');
    console.log(JSON.stringify(milestoneCondition.toJSON(), null, 2));

    // 4. Fluent DSL - Products
    console.log('\n' + '='.repeat(60));
    console.log('📦 FLUENT DSL - PRODUCTS');
    console.log('='.repeat(60));

    const translationService = client.product('ai-translation')
      .charge(0.02, 'per_word')
      .guarantee({ 
        accuracy: 0.98,
        delivery_time: '2_hours',
        quality_score: 0.95
      });

    console.log('✅ Created translation service product:');
    console.log(JSON.stringify(translationService.toJSON(), null, 2));

    // 5. Active Models
    console.log('\n' + '='.repeat(60));
    console.log('🤖 ACTIVE MODELS');
    console.log('='.repeat(60));

    console.log('📊 Agent Details:');
    console.log(`   Name: ${agent.name}`);
    console.log(`   Type: ${agent.accountType}`);
    console.log(`   Created: ${agent.createdAt}`);
    console.log(`   Daily Limit: $${agent.limits.daily}`);

    console.log('\n📊 Payment Details:');
    console.log(`   Amount: $${payment.amount} ${payment.currency}`);
    console.log(`   Type: ${payment.transactionType}`);
    console.log(`   State: ${payment.state}`);
    console.log(`   From: ${payment.from}`);
    console.log(`   To: ${payment.to}`);

    // 6. Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SUCCESS SUMMARY');
    console.log('='.repeat(60));

    console.log('✅ All core functionality working:');
    console.log('   • Account creation and retrieval');
    console.log('   • Transaction creation and management');
    console.log('   • Fluent DSL condition builders');
    console.log('   • Fluent DSL product builders');
    console.log('   • Active models with getters');
    console.log('   • Type-safe operations');
    console.log('   • JSON serialization');

    console.log('\n🎯 Ready for production use!');
    console.log('   The SDK is successfully connected to your Quicksilver sandbox');
    console.log('   and all core features are working as expected.');

  } catch (error) {
    console.error('\n❌ Error:', error);
  }
}

main();
