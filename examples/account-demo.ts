import { QuicksilverClient } from '../src/index';
import type { Account, CreateAccountPayload } from '../src/types';

async function accountDemo() {
  const client = new QuicksilverClient(process.env.QUICKSILVER_API_KEY!);

  try {
    console.log('🏦 Account Management Demo\n');

    // 1. Create different types of accounts
    console.log('1. Creating different account types...');
    
    const humanAccount = await client.accounts.create({
      name: 'John Doe (Human)',
      account_type: 'Human',
      meta: {
        email: 'john@example.com',
        phone: '+1234567890',
        kyc_status: 'pending'
      }
    });
    console.log(`   ✅ Human account: ${humanAccount.id}`);

    const agentMain = await client.accounts.create({
      name: 'Trading Bot Alpha',
      account_type: 'AgentMain',
      meta: {
        agent_type: 'trading_bot',
        version: '1.0.0',
        kyc_status: 'verified'
      }
    });
    console.log(`   ✅ Agent main account: ${agentMain.id}`);

    const agentDelegated = await client.accounts.create({
      name: 'Sub-Bot Beta',
      account_type: 'AgentDelegated',
      parent_id: agentMain.id,
      meta: {
        agent_type: 'sub_bot',
        parent_agent: agentMain.id,
        kyc_status: 'inherited'
      }
    });
    console.log(`   ✅ Agent delegated account: ${agentDelegated.id}`);

    // 2. KYC Process Demo
    console.log('\n2. KYC (Know Your Customer) Process...');
    
    // Update KYC status
    const updatedHuman = await client.accounts.update(humanAccount.id, {
      meta: {
        ...humanAccount.meta,
        kyc_status: 'verified',
        kyc_verified_at: new Date().toISOString(),
        kyc_documents: ['passport', 'utility_bill'],
        kyc_score: 95
      }
    });
    console.log(`   ✅ KYC verified for: ${updatedHuman.name}`);

    // 3. Account Hierarchy Demo
    console.log('\n3. Account Hierarchy Management...');
    
    const parentAccount = await client.accounts.create({
      name: 'Parent Organization',
      account_type: 'Human',
      meta: { organization: true }
    });

    const child1 = await client.accounts.create({
      name: 'Department A',
      account_type: 'AgentDelegated',
      parent_id: parentAccount.id,
      meta: { department: 'A' }
    });

    const child2 = await client.accounts.create({
      name: 'Department B',
      account_type: 'AgentDelegated',
      parent_id: parentAccount.id,
      meta: { department: 'B' }
    });

    console.log(`   ✅ Created hierarchy: ${parentAccount.name} → ${child1.name}, ${child2.name}`);

    // 4. Account Limits Demo
    console.log('\n4. Setting Account Limits...');
    
    const limitedAccount = await client.accounts.create({
      name: 'Limited Account',
      account_type: 'Human',
      limits: {
        daily: 1000,        // $1000 per day
        per_transaction: 100, // $100 per transaction
        total: 10000        // $10,000 total
      },
      meta: {
        risk_level: 'medium',
        kyc_status: 'verified'
      }
    });
    console.log(`   ✅ Created account with limits: $${limitedAccount.limits.daily}/day, $${limitedAccount.limits.per_transaction}/tx`);

    // 5. Account Listing and Pagination
    console.log('\n5. Account Listing with Pagination...');
    
    let page = 1;
    let hasMore = true;
    const allAccounts: Account[] = [];
    
    while (hasMore && page <= 3) {
      const accounts = await client.accounts.list({ 
        page, 
        limit: 5 
      });
      
      console.log(`   Page ${page}: ${accounts.data.length} accounts`);
      allAccounts.push(...accounts.data);
      
      hasMore = accounts.pagination.has_more;
      page++;
    }
    
    console.log(`   ✅ Total accounts retrieved: ${allAccounts.length}`);

    // 6. Account Search and Filtering
    console.log('\n6. Account Search and Filtering...');
    
    // Get all verified accounts
    const verifiedAccounts = allAccounts.filter(acc => 
      acc.meta?.kyc_status === 'verified'
    );
    console.log(`   ✅ Verified accounts: ${verifiedAccounts.length}`);

    // Get all agent accounts
    const agentAccounts = allAccounts.filter(acc => 
      acc.account_type.startsWith('Agent')
    );
    console.log(`   ✅ Agent accounts: ${agentAccounts.length}`);

    // 7. Account Updates and Maintenance
    console.log('\n7. Account Updates and Maintenance...');
    
    const updatedAccount = await client.accounts.update(humanAccount.id, {
      name: 'John Doe (Verified)',
      meta: {
        ...humanAccount.meta,
        kyc_status: 'verified',
        last_activity: new Date().toISOString(),
        account_tier: 'premium'
      }
    });
    console.log(`   ✅ Updated account: ${updatedAccount.name}`);

    // 8. Account Deletion (Cleanup)
    console.log('\n8. Account Cleanup...');
    
    // Note: In production, you might want to archive instead of delete
    const accountsToCleanup = [child1.id, child2.id, limitedAccount.id];
    
    for (const accountId of accountsToCleanup) {
      try {
        await client.accounts.delete(accountId);
        console.log(`   ✅ Deleted account: ${accountId}`);
      } catch (error) {
        console.log(`   ⚠️  Could not delete account ${accountId}: ${error}`);
      }
    }

    console.log('\n🎉 Account Management Demo completed successfully!');
    
    return {
      humanAccount: updatedHuman,
      agentMain,
      agentDelegated,
      parentAccount,
      verifiedAccounts,
      agentAccounts
    };

  } catch (error) {
    console.error('❌ Account demo error:', error);
    throw error;
  }
}

export { accountDemo }; 