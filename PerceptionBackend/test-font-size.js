#!/usr/bin/env node

/**
 * Font Size API Test Script
 * Tests the new font size increase/decrease endpoints
 * Run with: node test-font-size.js
 */

const BASE_URL = 'http://localhost:5000/api';
const TEST_USER_ID = 'font-test-user-' + Date.now();

async function testFontSize(action, value = null) {
  const body = { action };
  if (value !== null) body.value = value;

  console.log(`\n📏 Testing: ${action.toUpperCase()}${value ? ` to ${value}%` : ''}`);
  
  try {
    const response = await fetch(`${BASE_URL}/font-size/${TEST_USER_ID}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Success!`);
      console.log(`   Previous: ${data.previousSize}%`);
      console.log(`   Current:  ${data.fontSize}%`);
      console.log(`   Display:  ${data.percentage}`);
      return data.fontSize;
    } else {
      console.log(`❌ Error:`, data.error);
      return null;
    }
  } catch (error) {
    console.log(`❌ Failed:`, error.message);
    return null;
  }
}

async function getCurrentFontSize() {
  console.log(`\n🔍 Getting current font size...`);
  
  try {
    const response = await fetch(`${BASE_URL}/font-size/${TEST_USER_ID}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Current font size: ${data.percentage}`);
      return data.fontSize;
    } else {
      console.log(`❌ Error:`, data.error);
      return null;
    }
  } catch (error) {
    console.log(`❌ Failed:`, error.message);
    return null;
  }
}

async function runFontSizeTests() {
  console.log('🚀 Font Size Control Test Suite');
  console.log('=' .repeat(50));
  console.log(`Test User ID: ${TEST_USER_ID}`);

  // Get initial font size (should create default at 100%)
  let currentSize = await getCurrentFontSize();
  console.assert(currentSize === 100, 'Initial size should be 100%');

  // Test: Increase font size
  currentSize = await testFontSize('increase');
  console.assert(currentSize === 110, 'After increase should be 110%');

  // Test: Increase again
  currentSize = await testFontSize('increase');
  console.assert(currentSize === 120, 'After second increase should be 120%');

  // Test: Decrease font size
  currentSize = await testFontSize('decrease');
  console.assert(currentSize === 110, 'After decrease should be 110%');

  // Test: Set to specific value
  currentSize = await testFontSize('set', 175);
  console.assert(currentSize === 175, 'After set to 175 should be 175%');

  // Test: Set to max value
  currentSize = await testFontSize('set', 300);
  console.assert(currentSize === 300, 'Should allow max 300%');

  // Test: Try to exceed max (should cap at 300)
  currentSize = await testFontSize('increase');
  console.assert(currentSize === 300, 'Should cap at 300%');

  // Test: Set to min value
  currentSize = await testFontSize('set', 50);
  console.assert(currentSize === 50, 'Should allow min 50%');

  // Test: Try to go below min (should cap at 50)
  currentSize = await testFontSize('decrease');
  console.assert(currentSize === 50, 'Should cap at 50%');

  // Test: Reset to default
  currentSize = await testFontSize('reset');
  console.assert(currentSize === 100, 'After reset should be 100%');

  // Test: Multiple rapid increases
  console.log('\n🔄 Testing rapid changes...');
  await testFontSize('increase');
  await testFontSize('increase');
  await testFontSize('increase');
  await testFontSize('increase');
  currentSize = await getCurrentFontSize();
  console.assert(currentSize === 140, 'After 4 increases should be 140%');

  console.log('\n' + '='.repeat(50));
  console.log('✨ All font size tests passed!');
  console.log('\n💡 Integration Tips:');
  console.log('  • Apply to page: document.documentElement.style.fontSize = "110%"');
  console.log('  • Use CSS transitions for smooth changes');
  console.log('  • Font size persists across sessions per user');
  console.log('  • Range: 50% (min) to 300% (max)');
  console.log('  • Step size: 10% per increase/decrease');
}

// Run tests
runFontSizeTests().catch(console.error);
