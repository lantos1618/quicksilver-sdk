// examples/1-accounts-and-delegation.ts
import { QuicksilverClient, Account } from '../src';

// Initialize the client
const client = new QuicksilverClient('your-api-key', { env: 'sandbox' });

async function accountsAndDelegationDemo() {
  console.log('👥 Accounts and Delegation Demo\n');

  // Create a main agent account (now returns active Account model directly!)
  const mainAgent = await client.accounts.create({
    name: 'Main AI Agent',
    account_type: 'AgentMain',
    limits: {
      daily: 10000,
      per_transaction: 1000,
      total: 50000
    }
  });

  console.log(`   ✅ Created main agent: ${mainAgent.id}`);
  
  const researchAgent = await mainAgent.delegate({
    name: 'Research Sub-Agent',
    limits: { daily: 2000 }
  });
  console.log(`   ✅ Delegated research agent: ${researchAgent.id}`);

  const writingAgent = await mainAgent.delegate({
    name: 'Writing Sub-Agent', 
    limits: { daily: 1500 }
  });
  console.log(`   ✅ Delegated writing agent: ${writingAgent.id}`);

  // Get child accounts using the active model
  const children = await mainAgent.getChildren();
  console.log(`   📋 Main agent has ${children.length} delegated sub-agents`);

  // Update limits using the active model
  await mainAgent.updateLimits({ daily: 15000 });
  console.log('   🔧 Updated main agent daily limit to $15,000');

  // Get account balance
  const balance = await mainAgent.getBalance();
  console.log(`   💰 Current balance: $${balance.amount} ${balance.currency}`);

  console.log('\n   🎉 Delegation demo completed!');
}

// Run the demo
accountsAndDelegationDemo().catch(console.error); 