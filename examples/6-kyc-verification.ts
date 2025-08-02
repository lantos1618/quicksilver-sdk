// examples/6-kyc-verification.ts
import { QuicksilverClient, Account } from '../src/index';

async function kycVerificationDemo() {
  const client = new QuicksilverClient(process.env.QUICKSILVER_API_KEY!);

  try {
    console.log('🆔 KYC Verification Demo - Identity & Compliance\n');

    // 1. Create test accounts
    console.log('1. Creating test accounts...');
    
    const individualData = await client.accounts.create({
      name: 'John Doe',
      account_type: 'Human',
      meta: { 
        email: 'john.doe@example.com',
        phone: '+1234567890'
      }
    });
    const individual = client.createAccount(individualData);

    const businessData = await client.accounts.create({
      name: 'Acme Corporation',
      account_type: 'Human',
      meta: { 
        business_type: 'corporation',
        tax_id: '12-3456789'
      }
    });
    const business = client.createAccount(businessData);

    console.log(`   ✅ Created accounts: ${individual}, ${business}`);

    // 2. Initial verification status
    console.log('\n2. Initial verification status...');
    
    console.log(`   📊 Individual Account:`);
    console.log(`      Name: ${individual.data.name}`);
    console.log(`      Verification Status: ${individual.getVerificationStatus().status}`);
    console.log(`      Can Transact: ${individual.canTransact()}`);
    console.log(`      Can Delegate: ${individual.canDelegate()}`);

    console.log(`   📊 Business Account:`);
    console.log(`      Name: ${business.data.name}`);
    console.log(`      Verification Status: ${business.getVerificationStatus().status}`);
    console.log(`      Can Transact: ${business.canTransact()}`);
    console.log(`      Can Delegate: ${business.canDelegate()}`);

    // 3. Submit KYC documents
    console.log('\n3. Submitting KYC documents...');
    
    // Individual KYC submission
    console.log('   📄 Individual KYC submission...');
    await individual.submitKYC({
      document_type: 'passport',
      document_number: 'US123456789',
      // document_file: new File([''], 'passport.pdf') // In real app, actual file
    });
    console.log(`      ✅ Submitted passport for ${individual.data.name}`);

    // Business KYC submission
    console.log('   📄 Business KYC submission...');
    await business.submitKYC({
      document_type: 'business_license',
      document_number: 'BL-2024-001',
      // document_file: new File([''], 'business_license.pdf') // In real app, actual file
    });
    console.log(`      ✅ Submitted business license for ${business.data.name}`);

    // 4. Verification process (admin actions)
    console.log('\n4. Verification process (admin actions)...');
    
    // Verify individual account
    console.log('   ✅ Verifying individual account...');
    await individual.verify('admin_user_001');
    console.log(`      ✅ Individual account verified by admin_user_001`);

    // Verify business account
    console.log('   ✅ Verifying business account...');
    await business.verify('admin_user_001');
    console.log(`      ✅ Business account verified by admin_user_001`);

    // 5. Post-verification status
    console.log('\n5. Post-verification status...');
    
    await individual.refresh();
    await business.refresh();
    
    console.log(`   📊 Individual Account (Verified):`);
    console.log(`      Name: ${individual.data.name}`);
    console.log(`      Verification Status: ${individual.getVerificationStatus().status}`);
    console.log(`      Verified At: ${individual.getVerificationStatus().verified_at}`);
    console.log(`      Can Transact: ${individual.canTransact()}`);
    console.log(`      Can Delegate: ${individual.canDelegate()}`);

    console.log(`   📊 Business Account (Verified):`);
    console.log(`      Name: ${business.data.name}`);
    console.log(`      Verification Status: ${business.getVerificationStatus().status}`);
    console.log(`      Verified At: ${business.getVerificationStatus().verified_at}`);
    console.log(`      Can Transact: ${business.canTransact()}`);
    console.log(`      Can Delegate: ${business.canDelegate()}`);

    // 6. Account operations after verification
    console.log('\n6. Account operations after verification...');
    
    // Set account limits (now that they're verified)
    console.log('   🔧 Setting account limits...');
    await individual.updateLimits({
      daily: 10000,
      per_transaction: 1000,
      total: 100000
    });
    console.log(`      ✅ Set limits for ${individual.data.name}`);

    await business.updateLimits({
      daily: 50000,
      per_transaction: 5000,
      total: 500000
    });
    console.log(`      ✅ Set limits for ${business.data.name}`);

    // Get account balances
    console.log('   💰 Getting account balances...');
    const individualBalance = await individual.getBalance();
    const businessBalance = await business.getBalance();
    
    console.log(`      ${individual.data.name}: $${individualBalance.amount} ${individualBalance.currency}`);
    console.log(`      ${business.data.name}: $${businessBalance.amount} ${businessBalance.currency}`);

    // 7. Delegation after verification
    console.log('\n7. Delegation after verification...');
    
    // Individual can now delegate
    console.log('   👥 Individual delegating to sub-agent...');
    const individualSubAgent = await individual.delegate({
      name: 'Personal Assistant Bot',
      limits: { daily: 1000 }
    });
    console.log(`      ✅ Delegated sub-agent: ${individualSubAgent.id}`);

    // Business can now delegate
    console.log('   👥 Business delegating to sub-agent...');
    const businessSubAgent = await business.delegate({
      name: 'Corporate Trading Bot',
      limits: { daily: 5000 }
    });
    console.log(`      ✅ Delegated sub-agent: ${businessSubAgent.id}`);

    // 8. Verification rejection scenario
    console.log('\n8. Verification rejection scenario...');
    
    const suspiciousAccountData = await client.accounts.create({
      name: 'Suspicious Account',
      account_type: 'Human',
      meta: { 
        email: 'suspicious@example.com',
        risk_score: 'high'
      }
    });
    const suspiciousAccount = client.createAccount(suspiciousAccountData);

    console.log('   ⚠️  Processing suspicious account...');
    await suspiciousAccount.submitKYC({
      document_type: 'drivers_license',
      document_number: 'DL-123456789'
    });

    // Reject verification
    await suspiciousAccount.rejectVerification('Insufficient documentation and high risk score');
    console.log(`      ❌ Rejected verification for ${suspiciousAccount.data.name}`);

    console.log(`   📊 Suspicious Account Status:`);
    console.log(`      Name: ${suspiciousAccount.data.name}`);
    console.log(`      Verification Status: ${suspiciousAccount.getVerificationStatus().status}`);
    console.log(`      Can Transact: ${suspiciousAccount.canTransact()}`);
    console.log(`      Can Delegate: ${suspiciousAccount.canDelegate()}`);

    // 9. Verification workflow summary
    console.log('\n9. Verification workflow summary...');
    
    const accounts = [individual, business, suspiciousAccount];
    
    console.log('   📋 Verification Summary:');
    for (const account of accounts) {
      const verification = account.getVerificationStatus();
      console.log(`      ${account.data.name}:`);
      console.log(`         Status: ${verification.status}`);
      console.log(`         Verified At: ${verification.verified_at || 'N/A'}`);
      console.log(`         Can Transact: ${account.canTransact()}`);
      console.log(`         Can Delegate: ${account.canDelegate()}`);
      console.log(`         Is Root: ${account.isRootAccount()}`);
    }

    // 10. Compliance and audit trail
    console.log('\n10. Compliance and audit trail...');
    
    console.log('   📊 Compliance Features:');
    console.log(`      ✅ KYC document submission`);
    console.log(`      ✅ Admin verification workflow`);
    console.log(`      ✅ Verification status tracking`);
    console.log(`      ✅ Account permission management`);
    console.log(`      ✅ Delegation controls`);
    console.log(`      ✅ Transaction limits based on verification`);
    console.log(`      ✅ Audit trail for verification actions`);

    console.log('\n🎉 KYC Verification Demo completed successfully!');
    
    return {
      accounts: {
        individual,
        business,
        suspicious: suspiciousAccount
      },
      subAgents: {
        individual: individualSubAgent,
        business: businessSubAgent
      },
      balances: {
        individual: individualBalance,
        business: businessBalance
      }
    };

  } catch (error) {
    console.error('❌ KYC verification demo error:', error);
    throw error;
  }
}

export { kycVerificationDemo }; 