# Chatbot Consolidation - Single ChatGPT Endpoint

## Summary

The backend API has been simplified to use a single, unified ChatGPT endpoint instead of having separate specialized and general chatbots.

## Changes Made

### ✅ Removed
- ❌ `/api/chat` - Specialized accessibility chatbot endpoint
- ❌ `chatRequestSchema` - Request validation schema for old endpoint
- ❌ `extractFeatureSuggestions()` - Helper function for feature extraction

### ✅ Kept
- ✅ `/api/chatgpt` - **Single unified ChatGPT endpoint**
- ✅ Full GPT-4 capabilities
- ✅ Streaming support
- ✅ Conversation history
- ✅ Custom system prompts
- ✅ Temperature and token control

## New Architecture

### Single Endpoint: `/api/chatgpt`

**Use this for everything:**
- Accessibility questions and help
- General conversation
- Technical assistance
- Any AI-powered interaction

### Key Features

1. **Versatile** - Works for any type of conversation
2. **Streaming** - Real-time word-by-word responses
3. **Contextual** - Maintains conversation history
4. **Customizable** - System prompts, temperature, and token limits

## Migration Guide

### Before (Old Code)
```javascript
// Old specialized accessibility chatbot
const response = await fetch('http://localhost:5000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    message: 'I need help with accessibility',
    conversationId: 'abc123'
  })
});
```

### After (New Code)
```javascript
// New unified ChatGPT endpoint
const response = await fetch('http://localhost:5000/api/chatgpt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'I need help with accessibility',
    conversationHistory: [], // Optional: pass previous messages for context
    systemPrompt: 'You are a helpful accessibility assistant.', // Optional
    temperature: 0.7,
    maxTokens: 500
  })
});
```

## Benefits of Single Endpoint

✅ **Simpler API** - One chatbot to rule them all  
✅ **More Flexible** - Custom system prompts for any use case  
✅ **Better Performance** - Single optimized endpoint  
✅ **Easier Maintenance** - Less code to maintain  
✅ **Cost Efficient** - Unified conversation tracking  

## Example Use Cases

### 1. Accessibility Help
```javascript
const response = await fetch('http://localhost:5000/api/chatgpt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'I have trouble reading small text on websites',
    systemPrompt: `You are an accessibility expert. Help users find the right features:
    - Focus Mode
    - Motion Blocker
    - Contrast Control
    - Font Size Control
    - Text Simplification
    - Read Aloud
    Be concise and practical.`
  })
});
```

### 2. General Questions
```javascript
const response = await fetch('http://localhost:5000/api/chatgpt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Explain quantum computing in simple terms',
    temperature: 0.7
  })
});
```

### 3. Streaming Response
```javascript
const response = await fetch('http://localhost:5000/api/chatgpt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Tell me about accessibility best practices',
    stream: true
  })
});

// Handle streaming response
const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (!data.done) {
        console.log(data.content); // Display in real-time
      }
    }
  }
}
```

## Complete API Reference

### Request Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `message` | string | ✅ Yes | - | The user's message |
| `conversationHistory` | array | ❌ No | `[]` | Previous messages for context |
| `systemPrompt` | string | ❌ No | - | Custom instructions for the AI |
| `temperature` | number | ❌ No | `0.7` | Creativity (0-2) |
| `maxTokens` | number | ❌ No | `1000` | Response length limit |
| `stream` | boolean | ❌ No | `false` | Enable streaming response |

### Response Format

**Non-Streaming:**
```json
{
  "message": "AI response text...",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 150,
    "total_tokens": 200
  },
  "model": "gpt-4"
}
```

**Streaming:**
Server-sent events with format:
```
data: {"content":"word","done":false}
data: {"content":" by","done":false}
data: {"content":" word","done":false}
data: {"content":"","done":true,"fullResponse":"word by word..."}
```

## Updated Documentation

All documentation has been updated:
- ✅ **README.md** - Main project documentation
- ✅ **API_DOCUMENTATION.md** - Complete API reference
- ✅ **test-api.js** - Test script updated

## Testing

The unified endpoint is fully tested and operational:

```bash
# Test the ChatGPT endpoint
curl -X POST http://localhost:5000/api/chatgpt \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how can you help me?",
    "temperature": 0.7,
    "maxTokens": 200
  }'
```

## Status

✅ **Server Running** - Port 5000  
✅ **All Tests Passing**  
✅ **Documentation Updated**  
✅ **Backwards Incompatible** - `/api/chat` removed  

---

**Ready to use!** The simplified ChatGPT endpoint is now the single source for all AI conversations.
