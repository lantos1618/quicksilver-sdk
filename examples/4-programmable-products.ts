// examples/4-programmable-products.ts
import { QuicksilverClient, Account } from '../src';

// Initialize the client
const client = new QuicksilverClient('your-api-key', { env: 'sandbox' });

async function programmableProductsDemo() {
  console.log('📦 Programmable Products Demo\n');

  // Create accounts (now returns active Account models directly!)
  const customer = await client.accounts.create({
    name: 'Customer Account',
    account_type: 'Human'
  });

  const researchAgent = await client.accounts.create({
    name: 'Research Agent',
    account_type: 'AgentMain'
  });

  const writerAgent = await client.accounts.create({
    name: 'Writer Agent',
    account_type: 'AgentMain'
  });

  // 1. Define a simple, programmable service using the builder
  const translationService = client.product('ai-translation-en-es')
    .charge(0.01, 'per_word')
    .guarantee({ accuracy: 0.98, turnaround: '5 minutes' })
    .build();

  console.log('   ✅ Defined a simple translation product.');
  
  // 2. Define a complex, multi-agent workflow as a product
  const contentPipeline = client.product('blog-post-pipeline')
    .stage('research', { delegateTo: researchAgent.id, charge: 20 })
    .stage('writing', { delegateTo: writerAgent.id, charge: 40 })
    .guarantee({ delivery: '24 hours' })
    .build();
  
  console.log('   ✅ Defined a multi-agent content pipeline product.');

  // 3. A customer account can now purchase these products
  console.log('\n   🛒 Customer purchasing products...');
  
  const translationJob = await customer.purchase(translationService, {
    text: "The agent economy is at an inflection point.",
    word_count: 8, // Context for pricing
  });
  console.log(`      -> Purchased translation. Cost: $${await translationJob.getCost()}. TxID: ${translationJob.id}`);

  const blogPostJob = await customer.purchase(contentPipeline, {
    topic: "The QuickSilver Thesis",
  });
  console.log(`      -> Purchased blog post. Cost: $${await blogPostJob.getCost()}. TxID: ${blogPostJob.id}`);
  
  // The QuickSilver backend would now orchestrate the workflow, spawning
  // sub-transactions to the research and writer agents automatically.
  
  console.log('\n   🎉 Products purchased. The backend now handles the complex payment flows.');
}

// Run the demo
programmableProductsDemo().catch(console.error); 