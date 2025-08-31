import { QuicksilverClient } from '../src/index';
import { accountsAndDelegationDemo } from './1-accounts-and-delegation';
import { fluentTransactionsDemo } from './2-fluent-transactions';
import { conditionalEscrowDemo } from './3-conditional-escrow';
import { programmableProductsDemo } from './4-programmable-products';
import { streamingAndEventsDemo } from './5-streaming-and-events';
import { kycVerificationDemo } from './6-kyc-verification';

async function main() {
  console.log('🚀 QuickSilver SDK Demo Suite - Sandbox Mode\n');
  console.log('This demo showcases the transformation from a generic REST wrapper');
  console.log('to a Domain-Specific Language for Agent Commerce.\n');

  // Initialize client with sandbox environment (no API key needed for local sandbox)
  const client = new QuicksilverClient('', { env: 'sandbox' });

  try {
    // Test API connection
    console.log('🔗 Testing API connection...');
    console.log(`   Base URL: ${client.getBaseURL()}`);
    
    // Test basic ping
    try {
      const ping = await client.ping();
      console.log(`   ✅ API Status: ${ping.status} at ${ping.timestamp}`);
    } catch (error) {
      console.log('   ⚠️  Ping endpoint not available, continuing with demos...');
    }

    // Run all demos
    console.log('\n' + '='.repeat(80));
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

// Run the demo suite
if (require.main === module) {
  main().catch(console.error);
}

export { main };
