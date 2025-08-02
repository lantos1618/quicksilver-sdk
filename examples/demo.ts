import { QuicksilverClient } from '../src/index';
import { accountsAndDelegationDemo } from './1-accounts-and-delegation';
import { fluentTransactionsDemo } from './2-fluent-transactions';
import { conditionalEscrowDemo } from './3-conditional-escrow';
import { programmableProductsDemo } from './4-programmable-products';
import { streamingAndEventsDemo } from './5-streaming-and-events';
import { kycVerificationDemo } from './6-kyc-verification';

async function main() {
  console.log('🚀 QuickSilver SDK Demo Suite - Fluent DSL in Action\n');
  console.log('This demo showcases the transformation from a generic REST wrapper');
  console.log('to a Domain-Specific Language for Agent Commerce.\n');

  const client = new QuicksilverClient(process.env.QUICKSILVER_API_KEY!);

  try {
    // Test API connection
    console.log('🔗 Testing API connection...');
    const health = await client.health();
    console.log(`   ✅ API Status: ${health.status} (v${health.version})`);
    console.log(`   ✅ Uptime: ${health.uptime}s\n`);

    // Run all demos
    console.log('='.repeat(80));
    console.log('🏦 DEMO 1: Accounts & Delegation');
    console.log('='.repeat(80));
    await accountsAndDelegationDemo();

    console.log('\n' + '='.repeat(80));
    console.log('💳 DEMO 2: Fluent Transactions');
    console.log('='.repeat(80));
    await fluentTransactionsDemo();

    console.log('\n' + '='.repeat(80));
    console.log('🔐 DEMO 3: Conditional Escrow');
    console.log('='.repeat(80));
    await conditionalEscrowDemo();

    console.log('\n' + '='.repeat(80));
    console.log('📦 DEMO 4: Programmable Products');
    console.log('='.repeat(80));
    await programmableProductsDemo();

    console.log('\n' + '='.repeat(80));
    console.log('🌊 DEMO 5: Streaming & Events');
    console.log('='.repeat(80));
    await streamingAndEventsDemo();

    console.log('\n' + '='.repeat(80));
    console.log('🆔 DEMO 6: KYC Verification');
    console.log('='.repeat(80));
    await kycVerificationDemo();

    console.log('\n' + '='.repeat(80));
    console.log('🎉 ALL DEMOS COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(80));
    
    console.log('\n📊 Demo Summary:');
    console.log('   ✅ Accounts & Delegation - Active models with fluent methods');
    console.log('   ✅ Fluent Transactions - Elegant transaction creation and management');
    console.log('   ✅ Conditional Escrow - Builder pattern for complex logic');
    console.log('   ✅ Programmable Products - Expressive product definitions');
    console.log('   ✅ Streaming & Events - Real-time capabilities');
    console.log('   ✅ KYC Verification - Compliance and identity management');
    
    console.log('\n🎯 Key Achievements:');
    console.log('   • Transformed from REST wrapper to fluent DSL');
    console.log('   • Eliminated ugly JSON blobs with builder patterns');
    console.log('   • Made conditional logic readable and type-safe');
    console.log('   • Created active models with behavior');
    console.log('   • Enabled expressive product definitions');
    console.log('   • Delivered real-time capabilities');
    
    console.log('\n💡 The SDK now truly delivers on the vision of');
    console.log('   "elegant design as strategy" and provides a');
    console.log('   "new primitive for programmable money."');

  } catch (error) {
    console.error('\n❌ Demo suite error:', error);
    throw error;
  }
}

async function advancedIntegrationExamples() {
  console.log('\n' + '='.repeat(80));
  console.log('🔬 ADVANCED INTEGRATION EXAMPLES');
  console.log('='.repeat(80));

  const client = new QuicksilverClient(process.env.QUICKSILVER_API_KEY!);

  try {
    // Example 1: Complex multi-agent workflow
    console.log('\n1. Complex Multi-Agent Workflow:');
    console.log('   • Research Agent → Writing Agent → Review Agent');
    console.log('   • Conditional payments based on quality metrics');
    console.log('   • Real-time streaming of progress updates');
    
    // Example 2: DeFi-style conditional logic
    console.log('\n2. DeFi-Style Conditional Logic:');
    console.log('   • Oracle-based price triggers');
    console.log('   • Multi-signature approval workflows');
    console.log('   • Time-based automatic releases');
    
    // Example 3: Content monetization
    console.log('\n3. Content Monetization:');
    console.log('   • Per-second streaming payments');
    console.log('   • Viewer engagement bonuses');
    console.log('   • Quality-based revenue sharing');
    
    // Example 4: Supply chain payments
    console.log('\n4. Supply Chain Payments:');
    console.log('   • Milestone-based escrow releases');
    console.log('   • Quality inspection triggers');
    console.log('   • Multi-party approval workflows');

    console.log('\n✅ Advanced examples conceptualized successfully!');

  } catch (error) {
    console.error('❌ Advanced examples error:', error);
  }
}

// Run the demo suite
if (require.main === module) {
  main()
    .then(() => advancedIntegrationExamples())
    .catch(console.error);
}

export { main, advancedIntegrationExamples }; 