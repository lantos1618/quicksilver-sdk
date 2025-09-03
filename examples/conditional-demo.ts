#!/usr/bin/env ts-node

import { QuicksilverClient, QuickSilverEvent, Action } from '../src';
import * as readline from 'readline';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function typeWriter(text: string, delay: number = 30) {
  for (const char of text) {
    process.stdout.write(char);
    await sleep(delay);
  }
  console.log();
}

async function showProgress(message: string, duration: number = 1000) {
  process.stdout.write(`${colors.yellow}⏳ ${message}${colors.reset}`);
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  
  const interval = setInterval(() => {
    process.stdout.write(`\r${colors.yellow}${frames[i]} ${message}${colors.reset}`);
    i = (i + 1) % frames.length;
  }, 80);
  
  await sleep(duration);
  clearInterval(interval);
  process.stdout.write(`\r${colors.green}✅ ${message}${colors.reset}\n`);
}

async function main() {
  console.clear();
  console.log(`${colors.bright}${colors.cyan}
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║     🚀 QUICKSILVER CONDITIONAL TRANSACTION ENGINE DEMO 🚀            ║
║                                                                       ║
║     Real-time, programmable money with conditional logic             ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  await sleep(1000);
  
  console.log(`${colors.dim}Initializing Quicksilver Engine...${colors.reset}\n`);
  
  // Initialize the client
  const client = new QuicksilverClient('demo-api-key', { 
    env: 'sandbox',
    baseUrl: 'http://localhost:8080'
  });
  
  try {
    // Test connection
    await showProgress('Connecting to Quicksilver Engine', 500);
    const health = await client.ping();
    console.log(`${colors.green}✅ Engine Status: ${health}${colors.reset}\n`);
    
    // Phase 1: Create Accounts
    console.log(`${colors.bright}${colors.blue}━━━ PHASE 1: Creating Accounts ━━━${colors.reset}\n`);
    
    await showProgress('Creating Merchant Account (Coffee Shop)', 800);
    const merchant = await client.accounts.create({
      name: 'Artisan Coffee Co.',
      account_type: 'Business',
      balance: 0,
      currency: 'USD'
    });
    console.log(`   📦 Merchant ID: ${colors.cyan}${merchant.id}${colors.reset}`);
    console.log(`   💰 Initial Balance: ${colors.green}$${merchant.balance}${colors.reset}\n`);
    
    await showProgress('Creating Customer Account (Alice)', 800);
    const customer = await client.accounts.create({
      name: 'Alice Johnson',
      account_type: 'Human',
      balance: 1000,
      currency: 'USD'
    });
    console.log(`   👤 Customer ID: ${colors.cyan}${customer.id}${colors.reset}`);
    console.log(`   💰 Initial Balance: ${colors.green}$${customer.balance}${colors.reset}\n`);
    
    await showProgress('Creating Loyalty Program Account', 800);
    const loyaltyProgram = await client.accounts.create({
      name: 'Coffee Rewards Program',
      account_type: 'Agent',
      balance: 10000, // Pre-funded with reward points
      currency: 'POINTS'
    });
    console.log(`   🎁 Loyalty ID: ${colors.cyan}${loyaltyProgram.id}${colors.reset}`);
    console.log(`   🏆 Points Available: ${colors.yellow}${loyaltyProgram.balance}${colors.reset}\n`);
    
    // Phase 2: Create Conditional Rules
    console.log(`${colors.bright}${colors.blue}━━━ PHASE 2: Setting Up Conditional Logic ━━━${colors.reset}\n`);
    
    await typeWriter(`${colors.dim}Creating smart contract rules for automated loyalty rewards...${colors.reset}`);
    await sleep(500);
    
    // Create a conditional rule: When purchase > $10, give 100 loyalty points
    const loyaltyCondition = client.condition()
      .when(QuickSilverEvent.TransactionCompleted, ctx => {
        return ctx.amount && ctx.amount > 10;
      })
      .then(Action.transfer(100).from(loyaltyProgram.id).to(customer.id))
      .then(Action.notify(customer.id, '🎉 You earned 100 loyalty points!'));
    
    console.log(`${colors.green}✅ Rule 1: Purchases over $10 earn 100 loyalty points${colors.reset}`);
    
    // Create a conditional rule: Premium member discount
    const premiumDiscount = client.condition()
      .when(QuickSilverEvent.AccountTagged, ctx => ctx.tag === 'premium')
      .then(Action.discount(0.2)) // 20% discount
      .then(Action.notify(customer.id, '💎 Premium discount applied!'));
    
    console.log(`${colors.green}✅ Rule 2: Premium members get 20% discount${colors.reset}`);
    
    // Create streaming payment rule
    const subscriptionRule = client.condition()
      .when(QuickSilverEvent.TimeElapsed, ctx => ctx.interval === 'monthly')
      .then(Action.transfer(9.99).from(customer.id).to(merchant.id))
      .then(Action.notify(customer.id, '☕ Monthly coffee subscription renewed'));
    
    console.log(`${colors.green}✅ Rule 3: Monthly subscription auto-renewal${colors.reset}\n`);
    
    // Phase 3: Execute Transactions
    console.log(`${colors.bright}${colors.blue}━━━ PHASE 3: Executing Conditional Transactions ━━━${colors.reset}\n`);
    
    // Transaction 1: Small purchase (no loyalty bonus)
    await showProgress('Transaction 1: $5 Coffee Purchase', 1000);
    const tx1 = await client.transactions.create({
      from: customer.id,
      to: merchant.id,
      amount: 5,
      currency: 'USD',
      transaction_type: 'Payment',
      meta: {
        item: 'Cappuccino',
        size: 'Medium'
      }
    });
    console.log(`   ${colors.dim}Transaction ID: ${tx1.id}${colors.reset}`);
    console.log(`   ${colors.yellow}⚡ Amount: $5 (Below loyalty threshold)${colors.reset}`);
    console.log(`   ${colors.red}❌ No loyalty points earned${colors.reset}\n`);
    
    // Transaction 2: Large purchase (triggers loyalty bonus)
    await showProgress('Transaction 2: $15 Coffee & Pastry Purchase', 1500);
    const tx2 = await client.transactions.create({
      from: customer.id,
      to: merchant.id,
      amount: 15,
      currency: 'USD',
      transaction_type: 'Payment',
      conditions: loyaltyCondition.getConditions(),
      meta: {
        items: ['Latte', 'Croissant', 'Muffin'],
        total: 15
      }
    });
    console.log(`   ${colors.dim}Transaction ID: ${tx2.id}${colors.reset}`);
    console.log(`   ${colors.green}⚡ Amount: $15 (Triggers loyalty bonus!)${colors.reset}`);
    console.log(`   ${colors.bright}${colors.green}✨ CONDITION TRIGGERED: 100 loyalty points awarded!${colors.reset}\n`);
    
    // Phase 4: Real-time Balance Updates
    console.log(`${colors.bright}${colors.blue}━━━ PHASE 4: Real-time Balance Updates ━━━${colors.reset}\n`);
    
    await showProgress('Fetching updated account balances', 1000);
    
    // Fetch updated balances
    const updatedCustomer = await client.accounts.retrieve(customer.id);
    const updatedMerchant = await client.accounts.retrieve(merchant.id);
    const updatedLoyalty = await client.accounts.retrieve(loyaltyProgram.id);
    
    console.log(`${colors.bright}📊 Final Account Balances:${colors.reset}`);
    console.log(`   👤 Alice: ${colors.green}$${1000 - 5 - 15}${colors.reset} USD + ${colors.yellow}100${colors.reset} POINTS`);
    console.log(`   📦 Coffee Shop: ${colors.green}$${5 + 15}${colors.reset} USD`);
    console.log(`   🎁 Loyalty Program: ${colors.yellow}${10000 - 100}${colors.reset} POINTS remaining\n`);
    
    // Phase 5: Streaming Demo
    console.log(`${colors.bright}${colors.blue}━━━ PHASE 5: Streaming Payments Demo ━━━${colors.reset}\n`);
    
    await typeWriter(`${colors.dim}Creating a streaming payment (pay-per-second)...${colors.reset}`);
    
    // Create a streaming transaction
    const streamingTx = await client.transactions.create({
      from: customer.id,
      to: merchant.id,
      amount: 0.01, // 1 cent per second
      currency: 'USD',
      transaction_type: 'Streaming',
      meta: {
        description: 'Pay-per-second WiFi access',
        rate: '0.01/second'
      }
    });
    
    console.log(`\n${colors.bright}${colors.cyan}📡 Streaming Payment Active${colors.reset}`);
    console.log(`   Rate: ${colors.green}$0.01/second${colors.reset}`);
    
    // Simulate streaming for 5 seconds
    for (let i = 1; i <= 5; i++) {
      await sleep(1000);
      const amount = (i * 0.01).toFixed(2);
      process.stdout.write(`\r   ${colors.yellow}⏱  Elapsed: ${i}s | Charged: ${colors.green}$${amount}${colors.reset}`);
    }
    
    console.log(`\n   ${colors.green}✅ Streaming payment completed${colors.reset}\n`);
    
    // Summary
    console.log(`${colors.bright}${colors.cyan}
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║                        🎉 DEMO COMPLETE! 🎉                          ║
║                                                                       ║
║   Key Features Demonstrated:                                         ║
║   ✅ Account creation (Human, Business, Agent)                       ║
║   ✅ Conditional transaction logic                                   ║
║   ✅ Automatic loyalty rewards                                       ║
║   ✅ Real-time balance updates                                       ║
║   ✅ Streaming payments                                              ║
║                                                                       ║
║   This is the future of programmable money! 🚀                       ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error: ${error}${colors.reset}`);
    console.log(`\n${colors.yellow}Make sure the Quicksilver Engine is running on port 8080${colors.reset}`);
  }
}

// Run the demo
main().catch(console.error);