// examples/3-conditional-escrow.ts
import { QuicksilverClient, QuickSilverEvent, Action, Account } from '../src';

// Initialize the client
const client = new QuicksilverClient('your-api-key', { env: 'sandbox' });

async function conditionalEscrowDemo() {
  console.log('🔐 Conditional Escrow Demo\n');

  // Create accounts (now returns active Account models directly!)
  const clientAccount = await client.accounts.create({
    name: 'Client Account',
    account_type: 'Human'
  });

  const freelancerAccount = await client.accounts.create({
    name: 'Freelancer Account', 
    account_type: 'Human'
  });

  // Define the conditional logic using the fluent builder
  const projectCondition = client.condition()
    .when(QuickSilverEvent.MilestoneApproved, ctx => ctx.milestone === 'design')
    .then(Action.release(1000).to(freelancerAccount.id))
    .then(Action.notify(clientAccount.id, 'Design milestone paid.'))

    .when(QuickSilverEvent.MilestoneApproved, ctx => ctx.milestone === 'deploy')
    .then(Action.release(4000).to(freelancerAccount.id))

    .otherwise(Action.hold('Awaiting milestone approval.'));

  // Create the escrow transaction with the *compiled* condition
  const escrowTx = clientAccount.transaction({
    amount: 5000,
    currency: 'USD',
    transaction_type: 'Escrow',
    to: freelancerAccount.id,
    conditions: projectCondition.getConditions(), // Pass the compiled conditions
    meta: {
      description: 'Project escrow with conditional logic'
    }
  });

  // Execute the transaction to place funds in escrow
  await escrowTx.execute();
  console.log(`   ✅ Escrow created: ${escrowTx.id} with elegant conditional logic.`);

  // To trigger it, an authorized agent would simply call:
  // await escrowTx.triggerEvent(QuickSilverEvent.MilestoneApproved, { milestone: 'design' });
  console.log(`   🚀 Logic is armed. Awaiting event 'MilestoneApproved'.`);
}

export { conditionalEscrowDemo }; 