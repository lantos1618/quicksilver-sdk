import { QuicksilverClient } from '../src/index';
import type { Transaction, CreateTransactionPayload } from '../src/types';

async function transactionDemo() {
  const client = new QuicksilverClient(process.env.QUICKSILVER_API_KEY!);

  try {
    console.log('💳 Transaction Management Demo\n');

    // 1. Create test accounts
    console.log('1. Creating test accounts...');
    
    const sender = await client.accounts.create({
      name: 'Transaction Sender',
      account_type: 'Human',
      meta: { kyc_status: 'verified' }
    });

    const receiver = await client.accounts.create({
      name: 'Transaction Receiver',
      account_type: 'Human',
      meta: { kyc_status: 'verified' }
    });

    const escrowAgent = await client.accounts.create({
      name: 'Escrow Agent',
      account_type: 'AgentMain',
      meta: { agent_type: 'escrow' }
    });

    console.log(`   ✅ Created accounts: ${sender.id}, ${receiver.id}, ${escrowAgent.id}`);

    // 2. Different Transaction Types Demo
    console.log('\n2. Creating Different Transaction Types...');

    // Regular Payment
    const payment = await client.transactions.create({
      amount: 100,
      currency: 'USD',
      transaction_type: 'Payment',
      from: sender.id,
      to: receiver.id,
      meta: {
        description: 'Payment for services',
        invoice_id: 'INV-001'
      }
    });
    console.log(`   ✅ Payment: $${payment.amount} ${payment.currency} (${payment.state})`);

    // Escrow Transaction
    const escrow = await client.transactions.create({
      amount: 500,
      currency: 'USD',
      transaction_type: 'Escrow',
      from: sender.id,
      to: receiver.id,
      parent_id: escrowAgent.id,
      meta: {
        description: 'Escrow for project milestone',
        milestone: 'Phase 1 Complete',
        release_conditions: ['code_review', 'testing_passed']
      }
    });
    console.log(`   ✅ Escrow: $${escrow.amount} ${escrow.currency} (${escrow.state})`);

    // Scheduled Transaction
    const scheduled = await client.transactions.create({
      amount: 50,
      currency: 'USD',
      transaction_type: 'Scheduled',
      from: sender.id,
      to: receiver.id,
      meta: {
        description: 'Monthly subscription',
        schedule: 'monthly',
        next_execution: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
    console.log(`   ✅ Scheduled: $${scheduled.amount} ${scheduled.currency} (${scheduled.state})`);

    // Fund Transaction (deposit)
    const fund = await client.transactions.create({
      amount: 1000,
      currency: 'USD',
      transaction_type: 'Fund',
      from: sender.id,
      meta: {
        description: 'Account funding',
        source: 'bank_transfer',
        reference: 'BANK-REF-123'
      }
    });
    console.log(`   ✅ Fund: $${fund.amount} ${fund.currency} (${fund.state})`);

    // 3. Transaction States and Lifecycle
    console.log('\n3. Transaction States and Lifecycle...');

    // Create a transaction in draft state
    const draftTx = await client.transactions.create({
      amount: 75,
      currency: 'USD',
      transaction_type: 'Payment',
      from: sender.id,
      to: receiver.id,
      meta: {
        description: 'Draft transaction',
        status: 'draft'
      }
    });
    console.log(`   ✅ Draft transaction: ${draftTx.id} (${draftTx.state})`);

    // Update transaction to pending
    const pendingTx = await client.transactions.update(draftTx.id, {
      meta: {
        ...draftTx.meta,
        status: 'pending',
        approved_by: 'user_123'
      }
    });
    console.log(`   ✅ Updated to pending: ${pendingTx.id} (${pendingTx.state})`);

    // 4. Transaction Filtering and Search
    console.log('\n4. Transaction Filtering and Search...');

    // Get all transactions for sender
    const senderTransactions = await client.transactions.getForAccount(sender.id, {
      limit: 10
    });
    console.log(`   ✅ Sender transactions: ${senderTransactions.data.length}`);

    // Get transactions by type
    const payments = senderTransactions.data.filter(tx => 
      tx.transaction_type === 'Payment'
    );
    console.log(`   ✅ Payment transactions: ${payments.length}`);

    // Get transactions by state
    const completedTransactions = senderTransactions.data.filter(tx => 
      tx.state === 'Completed'
    );
    console.log(`   ✅ Completed transactions: ${completedTransactions.length}`);

    // 5. Transaction Metadata and Conditions
    console.log('\n5. Transaction Metadata and Conditions...');

    // Create transaction with rich metadata
    const metadataTx = await client.transactions.create({
      amount: 200,
      currency: 'USD',
      transaction_type: 'Payment',
      from: sender.id,
      to: receiver.id,
      meta: {
        description: 'Freelance payment',
        project: 'Website Redesign',
        hours: 20,
        rate: 10,
        milestones: ['design', 'development', 'testing'],
        completed_milestones: ['design', 'development'],
        client_approval: true,
        quality_score: 95,
        tags: ['freelance', 'web-design', 'completed']
      }
    });
    console.log(`   ✅ Metadata-rich transaction: ${metadataTx.id}`);

    // 6. Currency and Amount Handling
    console.log('\n6. Currency and Amount Handling...');

    const usdTx = await client.transactions.create({
      amount: 100,
      currency: 'USD',
      transaction_type: 'Payment',
      from: sender.id,
      to: receiver.id
    });

    const usdcTx = await client.transactions.create({
      amount: 100,
      currency: 'USDC',
      transaction_type: 'Payment',
      from: sender.id,
      to: receiver.id
    });

    const eurTx = await client.transactions.create({
      amount: 85,
      currency: 'EUR',
      transaction_type: 'Payment',
      from: sender.id,
      to: receiver.id
    });

    console.log(`   ✅ Multi-currency transactions: USD, USDC, EUR`);

    // 7. Transaction History and Audit Trail
    console.log('\n7. Transaction History and Audit Trail...');

    // Get recent transaction history
    const recentTransactions = await client.transactions.list({
      from: sender.id,
      limit: 20
    });

    console.log(`   ✅ Recent transactions: ${recentTransactions.data.length}`);
    
    // Analyze transaction patterns
    const totalAmount = recentTransactions.data.reduce((sum, tx) => sum + tx.amount, 0);
    const avgAmount = totalAmount / recentTransactions.data.length;
    
    console.log(`   📊 Transaction analysis:`);
    console.log(`      Total amount: $${totalAmount}`);
    console.log(`      Average amount: $${avgAmount.toFixed(2)}`);
    console.log(`      Transaction count: ${recentTransactions.data.length}`);

    // 8. Error Handling and Edge Cases
    console.log('\n8. Error Handling and Edge Cases...');

    try {
      // Try to create transaction with invalid amount
      await client.transactions.create({
        amount: -50, // Invalid negative amount
        currency: 'USD',
        transaction_type: 'Payment',
        from: sender.id,
        to: receiver.id
      });
    } catch (error) {
      console.log(`   ✅ Caught validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    try {
      // Try to create transaction with non-existent account
      await client.transactions.create({
        amount: 100,
        currency: 'USD',
        transaction_type: 'Payment',
        from: 'non-existent-account',
        to: receiver.id
      });
    } catch (error) {
      console.log(`   ✅ Caught account error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('\n🎉 Transaction Management Demo completed successfully!');

    return {
      sender,
      receiver,
      escrowAgent,
      transactions: {
        payment,
        escrow,
        scheduled,
        fund,
        metadataTx,
        usdTx,
        usdcTx,
        eurTx
      },
      recentTransactions: recentTransactions.data
    };

  } catch (error) {
    console.error('❌ Transaction demo error:', error);
    throw error;
  }
}

export { transactionDemo }; 