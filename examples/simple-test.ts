#!/usr/bin/env bun

import { QuicksilverClient } from '../src';

async function test() {
  console.log('Testing Quicksilver connection...');
  
  const client = new QuicksilverClient('demo-api-key', { 
    env: 'sandbox',
    baseUrl: 'http://localhost:8080'
  });
  
  try {
    // Test direct HTTP request
    const response = await fetch('http://localhost:8080/ping');
    const data = await response.json();
    console.log('Direct fetch works:', data);
    
    // Test SDK ping
    const ping = await client.ping();
    console.log('SDK ping works:', ping);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

test();