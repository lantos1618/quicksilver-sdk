import { QuicksilverClient } from '../src/index';
import type { Transaction, CreateTransactionPayload } from '../src/types';

// Define conditional types for future implementation
interface ConditionalLogic {
  type: 'time_based' | 'milestone_based' | 'oracle_based' | 'multi_sig' | 'custom';
  conditions: any[];
  actions: any[];
}

interface MilestoneCondition {
  type: 'milestone';
  milestone: string;
  required_approvals: number;
  approvers: string[];
}

interface TimeCondition {
  type: 'time';
  trigger_time: string;
  timezone?: string;
}

interface OracleCondition {
  type: 'oracle';
  oracle_id: string;
  condition: string;
  threshold: number;
}

async function conditionalsDemo() {
  const client = new QuicksilverClient(process.env.QUICKSILVER_API_KEY!);

  try {
    console.log('🔐 Conditional Transactions Demo\n');

    // 1. Create test accounts for conditional scenarios
    console.log('1. Creating test accounts...');
    
    const clientAccount = await client.accounts.create({
      name: 'Client Account',
      account_type: 'Human',
      meta: { kyc_status: 'verified' }
    });

    const freelancerAccount = await client.accounts.create({
      name: 'Freelancer Account',
      account_type: 'Human',
      meta: { kyc_status: 'verified' }
    });

    const escrowAgent = await client.accounts.create({
      name: 'Escrow Agent',
      account_type: 'AgentMain',
      meta: { agent_type: 'escrow' }
    });

    const arbitrator = await client.accounts.create({
      name: 'Arbitrator',
      account_type: 'Human',
      meta: { role: 'arbitrator', kyc_status: 'verified' }
    });

    console.log(`   ✅ Created accounts: ${clientAccount.id}, ${freelancerAccount.id}, ${escrowAgent.id}, ${arbitrator.id}`);

    // 2. Milestone-Based Conditional Transactions
    console.log('\n2. Milestone-Based Conditional Transactions...');

    const milestoneTransaction = await client.transactions.create({
      amount: 5000,
      currency: 'USD',
      transaction_type: 'Escrow',
      from: clientAccount.id,
      to: freelancerAccount.id,
      parent_id: escrowAgent.id,
      meta: {
        description: 'Website Development Project',
        project: 'E-commerce Platform',
        milestones: [
          {
            id: 'design',
            name: 'Design Phase',
            amount: 1000,
            status: 'pending',
            required_approvals: 1,
            approvers: [clientAccount.id]
          },
          {
            id: 'frontend',
            name: 'Frontend Development',
            amount: 1500,
            status: 'pending',
            required_approvals: 1,
            approvers: [clientAccount.id]
          },
          {
            id: 'backend',
            name: 'Backend Development',
            amount: 1500,
            status: 'pending',
            required_approvals: 1,
            approvers: [clientAccount.id]
          },
          {
            id: 'testing',
            name: 'Testing & Deployment',
            amount: 1000,
            status: 'pending',
            required_approvals: 2,
            approvers: [clientAccount.id, arbitrator.id]
          }
        ],
        conditional_logic: {
          type: 'milestone_based',
          release_conditions: [
            {
              milestone: 'design',
              condition: 'client_approval',
              auto_release: false
            },
            {
              milestone: 'frontend',
              condition: 'client_approval',
              auto_release: false
            },
            {
              milestone: 'backend',
              condition: 'client_approval',
              auto_release: false
            },
            {
              milestone: 'testing',
              condition: 'dual_approval',
              auto_release: true
            }
          ]
        }
      }
    });
    console.log(`   ✅ Milestone transaction: $${milestoneTransaction.amount} (${milestoneTransaction.state})`);

    // 3. Time-Based Conditional Transactions
    console.log('\n3. Time-Based Conditional Transactions...');

    const timeBasedTransaction = await client.transactions.create({
      amount: 1000,
      currency: 'USD',
      transaction_type: 'Scheduled',
      from: clientAccount.id,
      to: freelancerAccount.id,
      meta: {
        description: 'Retainer Payment',
        schedule: 'monthly',
        conditional_logic: {
          type: 'time_based',
          conditions: [
            {
              type: 'time',
              trigger_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
              condition: 'monthly_retainer',
              auto_execute: true
            }
          ],
          fallback_actions: [
            {
              action: 'notify',
              recipients: [clientAccount.id, freelancerAccount.id]
            }
          ]
        }
      }
    });
    console.log(`   ✅ Time-based transaction: $${timeBasedTransaction.amount} (${timeBasedTransaction.state})`);

    // 4. Multi-Signature Conditional Transactions
    console.log('\n4. Multi-Signature Conditional Transactions...');

    const multiSigTransaction = await client.transactions.create({
      amount: 10000,
      currency: 'USD',
      transaction_type: 'Escrow',
      from: clientAccount.id,
      to: freelancerAccount.id,
      parent_id: escrowAgent.id,
      meta: {
        description: 'Large Project Escrow',
        conditional_logic: {
          type: 'multi_sig',
          required_signatures: 2,
          signers: [clientAccount.id, arbitrator.id],
          conditions: [
            {
              type: 'approval',
              required_approvals: 2,
              approvers: [clientAccount.id, arbitrator.id],
              auto_release: false
            },
            {
              type: 'dispute',
              arbitrator: arbitrator.id,
              can_override: true
            }
          ]
        }
      }
    });
    console.log(`   ✅ Multi-sig transaction: $${multiSigTransaction.amount} (${multiSigTransaction.state})`);

    // 5. Oracle-Based Conditional Transactions
    console.log('\n5. Oracle-Based Conditional Transactions...');

    const oracleTransaction = await client.transactions.create({
      amount: 500,
      currency: 'USD',
      transaction_type: 'Escrow',
      from: clientAccount.id,
      to: freelancerAccount.id,
      parent_id: escrowAgent.id,
      meta: {
        description: 'Weather-Dependent Payment',
        conditional_logic: {
          type: 'oracle_based',
          oracle_id: 'weather_oracle',
          conditions: [
            {
              type: 'oracle',
              oracle_id: 'weather_oracle',
              condition: 'temperature > 25',
              threshold: 25,
              metric: 'celsius',
              location: 'New York, NY'
            }
          ],
          actions: [
            {
              condition: 'temperature > 25',
              action: 'release_payment',
              amount: 500
            },
            {
              condition: 'temperature <= 25',
              action: 'hold_payment',
              reason: 'Weather condition not met'
            }
          ]
        }
      }
    });
    console.log(`   ✅ Oracle-based transaction: $${oracleTransaction.amount} (${oracleTransaction.state})`);

    // 6. Custom Conditional Logic
    console.log('\n6. Custom Conditional Logic...');

    const customConditionalTransaction = await client.transactions.create({
      amount: 2000,
      currency: 'USD',
      transaction_type: 'Escrow',
      from: clientAccount.id,
      to: freelancerAccount.id,
      parent_id: escrowAgent.id,
      meta: {
        description: 'Custom Logic Payment',
        conditional_logic: {
          type: 'custom',
          script: `
            function evaluateConditions(transaction, context) {
              const { milestones, approvals, time_elapsed } = context;
              
              // Custom business logic
              if (milestones.completed >= 2 && approvals.count >= 1) {
                return { action: 'release', amount: 1000 };
              }
              
              if (time_elapsed > 30 && milestones.completed >= 1) {
                return { action: 'partial_release', amount: 500 };
              }
              
              return { action: 'hold', reason: 'Conditions not met' };
            }
          `,
          conditions: [
            {
              type: 'custom',
              name: 'milestone_progress',
              evaluation: 'milestones.completed >= 2'
            },
            {
              type: 'custom',
              name: 'approval_check',
              evaluation: 'approvals.count >= 1'
            },
            {
              type: 'custom',
              name: 'time_check',
              evaluation: 'time_elapsed > 30'
            }
          ]
        }
      }
    });
    console.log(`   ✅ Custom conditional transaction: $${customConditionalTransaction.amount} (${customConditionalTransaction.state})`);

    // 7. Conditional Transaction Monitoring
    console.log('\n7. Conditional Transaction Monitoring...');

    const conditionalTransactions = [
      milestoneTransaction,
      timeBasedTransaction,
      multiSigTransaction,
      oracleTransaction,
      customConditionalTransaction
    ];

    console.log('   📊 Conditional Transaction Status:');
    for (const tx of conditionalTransactions) {
      const conditions = tx.meta?.conditional_logic?.conditions || [];
      const conditionCount = conditions.length;
      
      console.log(`      Transaction ${tx.id}:`);
      console.log(`        Amount: $${tx.amount}`);
      console.log(`        State: ${tx.state}`);
      console.log(`        Conditions: ${conditionCount}`);
      console.log(`        Type: ${tx.meta?.conditional_logic?.type}`);
    }

    // 8. Conditional Transaction Updates
    console.log('\n8. Conditional Transaction Updates...');

    // Update milestone transaction with completed milestone
    const updatedMilestoneTx = await client.transactions.update(milestoneTransaction.id, {
      meta: {
        ...milestoneTransaction.meta,
        milestones: [
          {
            ...milestoneTransaction.meta.milestones[0],
            status: 'completed',
            completed_at: new Date().toISOString(),
            approved_by: clientAccount.id
          },
          ...milestoneTransaction.meta.milestones.slice(1)
        ]
      }
    });
    console.log(`   ✅ Updated milestone transaction: ${updatedMilestoneTx.id}`);

    // 9. Conditional Transaction Simulation
    console.log('\n9. Conditional Transaction Simulation...');

    // Simulate different scenarios
    const scenarios = [
      {
        name: 'All conditions met',
        conditions: { milestones_completed: 4, approvals: 2, time_elapsed: 45 }
      },
      {
        name: 'Partial conditions met',
        conditions: { milestones_completed: 2, approvals: 1, time_elapsed: 20 }
      },
      {
        name: 'No conditions met',
        conditions: { milestones_completed: 0, approvals: 0, time_elapsed: 5 }
      }
    ];

    for (const scenario of scenarios) {
      console.log(`   🔄 Simulating: ${scenario.name}`);
      console.log(`      Conditions: ${JSON.stringify(scenario.conditions)}`);
      
      // In a real implementation, this would trigger the conditional logic
      if (scenario.conditions.milestones_completed >= 2) {
        console.log(`      ✅ Would trigger payment release`);
      } else {
        console.log(`      ⏸️  Would hold payment`);
      }
    }

    // 10. Conditional Transaction Analytics
    console.log('\n10. Conditional Transaction Analytics...');

    const conditionalTxStats = {
      total_transactions: conditionalTransactions.length,
      by_type: {
        milestone_based: conditionalTransactions.filter(tx => 
          tx.meta?.conditional_logic?.type === 'milestone_based'
        ).length,
        time_based: conditionalTransactions.filter(tx => 
          tx.meta?.conditional_logic?.type === 'time_based'
        ).length,
        multi_sig: conditionalTransactions.filter(tx => 
          tx.meta?.conditional_logic?.type === 'multi_sig'
        ).length,
        oracle_based: conditionalTransactions.filter(tx => 
          tx.meta?.conditional_logic?.type === 'oracle_based'
        ).length,
        custom: conditionalTransactions.filter(tx => 
          tx.meta?.conditional_logic?.type === 'custom'
        ).length
      },
      total_amount: conditionalTransactions.reduce((sum, tx) => sum + tx.amount, 0)
    };

    console.log('   📈 Conditional Transaction Analytics:');
    console.log(`      Total transactions: ${conditionalTxStats.total_transactions}`);
    console.log(`      Total amount: $${conditionalTxStats.total_amount}`);
    console.log(`      By type: ${JSON.stringify(conditionalTxStats.by_type)}`);

    console.log('\n🎉 Conditional Transactions Demo completed successfully!');

    return {
      accounts: {
        client: clientAccount,
        freelancer: freelancerAccount,
        escrowAgent,
        arbitrator
      },
      transactions: {
        milestone: milestoneTransaction,
        timeBased: timeBasedTransaction,
        multiSig: multiSigTransaction,
        oracle: oracleTransaction,
        custom: customConditionalTransaction
      },
      stats: conditionalTxStats
    };

  } catch (error) {
    console.error('❌ Conditionals demo error:', error);
    throw error;
  }
}

export { conditionalsDemo }; 