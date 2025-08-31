import { QuicksilverClient, QuickSilverEvent, Action } from '../src/index';

async function main() {
  console.log('🚀 QuickSilver SDK Demo Suite - Sandbox Mode (Simplified)\n');
  console.log('This demo showcases the core functionality working with your sandbox API.\n');

  // Initialize client with sandbox environment
  const client = new QuicksilverClient('', { env: 'sandbox' });

  try {
    console.log('🔗 Testing API connection...');
    console.log(`   Base URL: ${client.getBaseURL()}`);

    // DEMO 1: Basic Account Operations
    console.log('\n' + '='.repeat(80));
    console.log('🏦 DEMO 1: Basic Account Operations');
    console.log('='.repeat(80));

    console.log('\n👤 Creating test accounts...');
    const mainAgent = await client.accounts.create({
      name: 'Main AI Agent',
      account_type: 'AgentMain',
      limits: {
        daily: 10000,
        per_transaction: 1000,
        total: 50000
      }
    });
    console.log(`   ✅ Created main agent: ${mainAgent.id} (${mainAgent.name})`);

    const customer = await client.accounts.create({
      name: 'Test Customer',
      account_type: 'Human'
    });
    console.log(`   ✅ Created customer: ${customer.id} (${customer.name})`);

    // DEMO 2: Basic Transaction Operations
    console.log('\n' + '='.repeat(80));
    console.log('💳 DEMO 2: Basic Transaction Operations');
    console.log('='.repeat(80));

    console.log('\n💸 Creating test transactions...');
    const payment = await client.transactions.create({
      transaction_type: 'Payment',
      amount: 100,
      currency: 'USD',
      from: mainAgent.id,
      to: customer.id,
      meta: {
        description: 'Test payment from main agent to customer'
      }
    });
    console.log(`   ✅ Created payment: ${payment.id} ($${payment.amount} ${payment.currency})`);
    console.log(`   📊 Transaction state: ${payment.state}`);

    const escrow = await client.transactions.create({
      transaction_type: 'Escrow',
      amount: 500,
      currency: 'USD',
      from: customer.id,
      to: mainAgent.id,
      meta: {
        description: 'Escrow for AI service delivery',
        service: 'content_creation'
      }
    });
    console.log(`   ✅ Created escrow: ${escrow.id} ($${escrow.amount} ${escrow.currency})`);
    console.log(`   📊 Transaction state: ${escrow.state}`);

    // DEMO 3: Fluent DSL Features
    console.log('\n' + '='.repeat(80));
    console.log('🔧 DEMO 3: Fluent DSL Features');
    console.log('='.repeat(80));

    console.log('\n🎯 Creating conditional logic...');
    const condition = client.condition()
      .when(QuickSilverEvent.MilestoneApproved)
      .then(Action.release(250, 'USD'))
      .when(QuickSilverEvent.TimeElapsed)
      .then(Action.release(250, 'USD'));
    
    console.log(`   ✅ Created condition: ${JSON.stringify(condition.toJSON(), null, 2)}`);

    console.log('\n📦 Creating programmable product...');
    const product = client.product('ai-translation-service')
      .charge(0.01, 'per_word')
      .guarantee({ 
        accuracy: 0.95,
        delivery_time: '24_hours'
      });
    
    console.log(`   ✅ Created product: ${JSON.stringify(product.toJSON(), null, 2)}`);

    // DEMO 4: Active Models
    console.log('\n' + '='.repeat(80));
    console.log('🤖 DEMO 4: Active Models');
    console.log('='.repeat(80));

    console.log('\n🔄 Using active models...');
    
    // Refresh account data
    await mainAgent.refresh();
    console.log(`   ✅ Refreshed main agent data`);
    
    // Update account limits
    await mainAgent.updateLimits({ daily: 15000 });
    console.log(`   ✅ Updated main agent daily limit to $15,000`);
    
    // Check account properties
    console.log(`   📊 Main agent details:`);
    console.log(`      - Name: ${mainAgent.name}`);
    console.log(`      - Type: ${mainAgent.accountType}`);
    console.log(`      - Created: ${mainAgent.createdAt}`);
    console.log(`      - Daily limit: $${mainAgent.limits.daily}`);

    // DEMO 5: Transaction Management
    console.log('\n' + '='.repeat(80));
    console.log('📋 DEMO 5: Transaction Management');
    console.log('='.repeat(80));

    console.log('\n📊 Managing transactions...');
    
    // Refresh transaction data
    await payment.refresh();
    console.log(`   ✅ Refreshed payment data`);
    
    // Check transaction properties
    console.log(`   📊 Payment details:`);
    console.log(`      - Amount: $${payment.amount} ${payment.currency}`);
    console.log(`      - Type: ${payment.transactionType}`);
    console.log(`      - State: ${payment.state}`);
    console.log(`      - From: ${payment.from}`);
    console.log(`      - To: ${payment.to}`);
    console.log(`      - Created: ${payment.createdAt}`);

    console.log('\n' + '='.repeat(80));
    console.log('🎉 DEMO COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(80));
    
    console.log('\n📊 Summary:');
    console.log(`   • Created ${2} accounts`);
    console.log(`   • Created ${2} transactions`);
    console.log(`   • Fluent DSL working: ✅`);
    console.log(`   • Active models working: ✅`);
    console.log(`   • Type-safe operations: ✅`);
    
    console.log('\n🎯 Key Achievements:');
    console.log('   • SDK successfully connected to sandbox API');
    console.log('   • Account creation and management working');
    console.log('   • Transaction creation and management working');
    console.log('   • Fluent DSL builders working');
    console.log('   • Active models with getters working');
    console.log('   • Type-safe operations throughout');
    
    console.log('\n💡 The SDK is now ready for production use with your Quicksilver API!');

  } catch (error) {
    console.error('\n❌ Demo error:', error);
    throw error;
  }
}

// Run the demo
main().catch(console.error);
