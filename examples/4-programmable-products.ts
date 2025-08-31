// examples/4-programmable-products.ts
import { QuicksilverClient, Account } from '../src/index';

async function programmableProductsDemo() {
  const client = new QuicksilverClient(process.env.QUICKSILVER_API_KEY!);

  try {
    console.log('📦 Programmable Products Demo - The Real Power\n');

    // 1. Create test accounts
    console.log('1. Creating test accounts...');
    
    const customerData = await client.accounts.create({
      name: 'Product Customer',
      account_type: 'Human',
      meta: { kyc_status: 'verified' }
    });
    const customer = client.createAccount(customerData);

    const researchAgentData = await client.accounts.create({
      name: 'Research Agent',
      account_type: 'AgentDelegated',
      meta: { agent_type: 'research' }
    });
    const researchAgent = client.createAccount(researchAgentData);

    const writerAgentData = await client.accounts.create({
      name: 'Writing Agent',
      account_type: 'AgentDelegated',
      meta: { agent_type: 'writing' }
    });
    const writerAgent = client.createAccount(writerAgentData);

    console.log(`   ✅ Created accounts: ${customer}, ${researchAgent}, ${writerAgent}`);

    // 2. Define simple, programmable services using the builder
    console.log('\n2. Defining simple products with fluent builder...');
    
    const translationService = client.product('ai-translation-en-es')
      .charge(0.01, 'per_word')
      .guarantee({ accuracy: 0.98, turnaround: '5 minutes' });

    console.log(`   ✅ Defined translation product: ${translationService.id}`);
    console.log(`      Pricing: ${JSON.stringify(translationService.getPricing())}`);
    console.log(`      Guarantees: ${JSON.stringify(translationService.getGuarantees())}`);

    const codeReviewService = client.product('ai-code-review')
      .charge(0.05, 'per_line')
      .guarantee({ 
        quality: 0.95, 
        coverage: 0.90,
        delivery: '24 hours'
      });

    console.log(`   ✅ Defined code review product: ${codeReviewService.id}`);

    // 3. Define complex, multi-agent workflow as a product
    console.log('\n3. Defining complex multi-agent workflow products...');
    
    const contentPipeline = client.product('blog-post-pipeline')
      .stage('research', { delegateTo: researchAgent.id, charge: 20 })
      .stage('writing', { delegateTo: writerAgent.id, charge: 40 })
      .guarantee({ delivery: '24 hours', quality: 0.90 });
    
    console.log(`   ✅ Defined content pipeline: ${contentPipeline.id}`);
    console.log(`      Workflow stages: ${contentPipeline.getWorkflow().length}`);

    const softwareProject = client.product('software-development')
      .stage('planning', { delegateTo: researchAgent.id, charge: 100 })
      .stage('development', { delegateTo: writerAgent.id, charge: 500 })
      .stage('testing', { delegateTo: researchAgent.id, charge: 200 })
      .guarantee({ 
        delivery: '2 weeks',
        quality: 0.95,
        support: '30 days'
      });

    console.log(`   ✅ Defined software project: ${softwareProject.id}`);

    // 4. Define streaming products
    console.log('\n4. Defining streaming products...');
    
    const streamingTranslation = client.product('real-time-translation')
      .stream(0.001, 'per_second')
      .guarantee({ latency: '100ms', accuracy: 0.95 });

    console.log(`   ✅ Defined streaming translation: ${streamingTranslation.id}`);

    const aiConsulting = client.product('ai-consulting')
      .stream(0.10, 'per_minute')
      .guarantee({ 
        response_time: '30 seconds',
        expertise_level: 'expert'
      });

    console.log(`   ✅ Defined AI consulting: ${aiConsulting.id}`);

    // 5. Customer purchasing products
    console.log('\n5. Customer purchasing products...');
    
    console.log('   🛒 Customer purchasing translation service...');
    const translationJob = await customer.purchase(translationService, {
      text: "The agent economy is at an inflection point.",
      word_count: 8,
      target_language: 'Spanish'
    });
    console.log(`      -> Purchased translation. TxID: ${translationJob.id}`);

    console.log('   🛒 Customer purchasing code review...');
    const codeReviewJob = await customer.purchase(codeReviewService, {
      repository: 'github.com/example/project',
      language: 'TypeScript',
      lines_of_code: 500
    });
    console.log(`      -> Purchased code review. TxID: ${codeReviewJob.id}`);

    console.log('   🛒 Customer purchasing content pipeline...');
    const blogPostJob = await customer.purchase(contentPipeline, {
      topic: "The QuickSilver Thesis",
      word_count: 2000,
      tone: "professional"
    });
    console.log(`      -> Purchased blog post. TxID: ${blogPostJob.id}`);

    console.log('   🛒 Customer purchasing software project...');
    const softwareJob = await customer.purchase(softwareProject, {
      project_type: "Web Application",
      features: ["user authentication", "payment processing", "admin dashboard"],
      tech_stack: ["React", "Node.js", "PostgreSQL"]
    });
    console.log(`      -> Purchased software project. TxID: ${softwareJob.id}`);

    // 6. Streaming product purchases
    console.log('\n6. Purchasing streaming products...');
    
    console.log('   🌊 Customer starting streaming translation...');
    const streamingJob = await customer.purchase(streamingTranslation, {
      session_duration: '30 minutes',
      source_language: 'English',
      target_language: 'Spanish'
    });
    console.log(`      -> Started streaming translation. TxID: ${streamingJob.id}`);

    console.log('   🌊 Customer starting AI consulting...');
    const consultingJob = await customer.purchase(aiConsulting, {
      topic: "Machine Learning Strategy",
      duration: '60 minutes',
      expertise_area: 'Computer Vision'
    });
    console.log(`      -> Started AI consulting. TxID: ${consultingJob.id}`);

    // 7. Product analytics and monitoring
    console.log('\n7. Product analytics and monitoring...');
    
    const products = [translationService, codeReviewService, contentPipeline, softwareProject, streamingTranslation, aiConsulting];
    
    console.log('   📊 Product Summary:');
    for (const product of products) {
      const pricing = product.getPricing();
      const guarantees = product.getGuarantees();
      const workflow = product.getWorkflow();
      
      console.log(`      ${product.id}:`);
      console.log(`         Pricing: ${pricing.model} - ${pricing.rate} ${pricing.currency} per ${pricing.unit}`);
      console.log(`         Guarantees: ${Object.keys(guarantees).length} guarantees`);
      console.log(`         Workflow: ${workflow.length} stages`);
    }

    // 8. Simulate product execution
    console.log('\n8. Simulating product execution...');
    
    console.log('   🔄 Translation service executing...');
    console.log('      -> AI model processing text');
    console.log('      -> Quality check completed');
    console.log('      -> Translation delivered');
    
    console.log('   🔄 Content pipeline executing...');
    console.log('      -> Research agent gathering data');
    console.log('      -> Writing agent creating content');
    console.log('      -> Quality review completed');
    console.log('      -> Blog post delivered');
    
    console.log('   🔄 Streaming services active...');
    console.log('      -> Real-time translation streaming');
    console.log('      -> AI consulting session ongoing');
    console.log('      -> Payments streaming per second/minute');

    console.log('\n🎉 Programmable Products Demo completed successfully!');
    
    return {
      customer,
      agents: {
        research: researchAgent,
        writer: writerAgent
      },
      products: {
        translation: translationService,
        codeReview: codeReviewService,
        contentPipeline,
        softwareProject,
        streamingTranslation,
        aiConsulting
      },
      purchases: {
        translation: translationJob,
        codeReview: codeReviewJob,
        blogPost: blogPostJob,
        software: softwareJob,
        streaming: streamingJob,
        consulting: consultingJob
      }
    };

  } catch (error) {
    console.error('❌ Programmable products demo error:', error);
    throw error;
  }
}

export { programmableProductsDemo }; 