#!/usr/bin/env node

/**
 * Test script for Perception Backend API
 * Run with: node test-api.js
 */

const BASE_URL = 'http://localhost:5000/api';

async function testEndpoint(name, method, endpoint, body = null) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`📍 ${method} ${endpoint}`);
  
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
      console.log('📤 Request:', JSON.stringify(body, null, 2));
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log('📥 Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Error:', response.status);
      console.log('📥 Response:', JSON.stringify(data, null, 2));
    }
    
    return data;
  } catch (error) {
    console.log('❌ Failed:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Perception API Test Suite');
  console.log('=' .repeat(50));
  
  const userId = 'test-user-' + Date.now();
  
  // 1. Health Check
  await testEndpoint(
    'Health Check',
    'GET',
    '/health'
  );
  
  // 2. Get User Preferences (will create default)
  await testEndpoint(
    'Get User Preferences',
    'GET',
    `/preferences/${userId}`
  );
  
  // 3. Update User Preferences
  await testEndpoint(
    'Update User Preferences',
    'PUT',
    `/preferences/${userId}`,
    {
      focusMode: true,
      motionBlocker: true,
      contrastLevel: 'high',
      largerClickTargets: true
    }
  );
  
  // 4. ChatGPT
  await testEndpoint(
    'General ChatGPT',
    'POST',
    '/chatgpt',
    {
      message: 'Explain accessibility in one sentence',
      temperature: 0.7,
      maxTokens: 100
    }
  );
  
  // 5. Text Simplification
  await testEndpoint(
    'Text Simplification',
    'POST',
    '/simplify',
    {
      text: 'The implementation of quantum entanglement necessitates the utilization of superposition states to facilitate instantaneous correlation between spatially separated particles.',
      readingLevel: 'middle'
    }
  );
  
  // 6. Generate Alt Text (using a public image URL)
  await testEndpoint(
    'Generate Alt Text',
    'POST',
    '/generate-alt-text',
    {
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1200px-Cat03.jpg',
      useCache: true
    }
  );
  
  // 7. Read Aloud Timing
  await testEndpoint(
    'Read Aloud Timing',
    'POST',
    '/read-aloud',
    {
      text: 'The quick brown fox jumps over the lazy dog',
      wordsPerMinute: 150
    }
  );
  
  // 8. ChatGPT with Conversation History
  await testEndpoint(
    'ChatGPT with History',
    'POST',
    '/chatgpt',
    {
      message: 'Can you elaborate on that?',
      conversationHistory: [
        {
          role: 'user',
          content: 'What is accessibility?'
        },
        {
          role: 'assistant',
          content: 'Accessibility means making products and services usable by everyone, including people with disabilities.'
        }
      ],
      temperature: 0.7,
      maxTokens: 150
    }
  );
  
  console.log('\n' + '='.repeat(50));
  console.log('✨ All tests completed!');
  console.log('\n💡 Tips:');
  console.log('  • Check API_DOCUMENTATION.md for detailed endpoint docs');
  console.log('  • Use streaming with /api/chatgpt for real-time responses');
  console.log('  • Alt text is cached to save API costs');
  console.log('  • Adjust temperature (0-2) for more/less creative responses');
}

// Run tests
runTests().catch(console.error);
