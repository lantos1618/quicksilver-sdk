// examples/6-kyc-verification.ts
import { QuicksilverClient } from '../src';

// Initialize the client
const client = new QuicksilverClient('your-api-key', { env: 'sandbox' });

async function kycVerificationDemo() {
  console.log('🔐 KYC Verification Demo\n');

  // Create a root account (should be verified by default)
  const rootAccount = await client.accounts.create({
    name: 'Root Organization',
    account_type: 'AgentMain',
    limits: {
      daily: 50000,
      per_transaction: 10000,
      total: 1000000
    }
  });

  console.log(`   ✅ Created root account: ${rootAccount.id}`);
  console.log(`   🔍 Root account verified: ${rootAccount.isVerified()}`);
  console.log(`   🌳 Is root account: ${rootAccount.isRootAccount()}`);

  // Create a delegated sub-account (should be unverified initially)
  const subAccount = await rootAccount.delegate({
    name: 'Sub-Agent Account',
    limits: { daily: 5000 }
  });

  console.log(`   ✅ Created sub-account: ${subAccount.id}`);
  console.log(`   🔍 Sub-account verified: ${subAccount.isVerified()}`);
  console.log(`   🌳 Is root account: ${subAccount.isRootAccount()}`);

  // Submit KYC for the sub-account
  console.log('\n   📋 Submitting KYC documents...');
  
  try {
    await subAccount.submitKYC({
      document_type: 'passport',
      document_number: 'P123456789',
      // document_file: fileBuffer // In real app, you'd pass a file
    });
    
    console.log('   ✅ KYC documents submitted successfully');
    console.log(`   📊 Verification status: ${subAccount.getVerificationStatus().status}`);
  } catch (error) {
    console.log('   ❌ KYC submission failed:', error);
  }

  // Simulate admin verification (in real app, this would be done by admin)
  console.log('\n   👨‍💼 Admin verifying account...');
  
  try {
    await subAccount.verify('admin@quicksilver.com');
    console.log('   ✅ Account verified by admin');
    console.log(`   🔍 Account verified: ${subAccount.isVerified()}`);
    console.log(`   📅 Verified at: ${subAccount.getVerificationStatus().verified_at}`);
  } catch (error) {
    console.log('   ❌ Verification failed:', error);
  }

  // Create a human account that needs verification
  const humanAccount = await client.accounts.create({
    name: 'John Doe',
    account_type: 'Human'
  });

  console.log(`\n   👤 Created human account: ${humanAccount.id}`);
  console.log(`   🔍 Human account verified: ${humanAccount.isVerified()}`);

  // Check verification requirements
  console.log('\n   📋 Verification Requirements:');
  console.log(`   • Root accounts: ${rootAccount.isVerified() ? '✅ Always verified' : '❌ Should be verified'}`);
  console.log(`   • Delegated accounts: ${subAccount.isVerified() ? '✅ Can be verified' : '❌ Needs verification'}`);
  console.log(`   • Human accounts: ${humanAccount.isVerified() ? '✅ Verified' : '❌ Needs KYC'}`);

  // Demonstrate verification status checking
  console.log('\n   📊 Verification Status Summary:');
  [rootAccount, subAccount, humanAccount].forEach(account => {
    const status = account.getVerificationStatus();
    console.log(`   • ${account.data.name}: ${status.status}${status.verified_at ? ` (${status.verified_at})` : ''}`);
  });

  console.log('\n   🎉 KYC verification demo completed!');
}

// Run the demo
kycVerificationDemo().catch(console.error); 