# Perception Backend API Documentation

Complete API documentation for the Perception Accessibility Chrome Extension backend.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently, no authentication is required. APIs use userId as a parameter to identify users.

---

## Endpoints

### 1. Health Check

**GET** `/api/health`

Check if the API server is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-15T19:26:00.000Z"
}
```

---

### 2. User Preferences

#### Get User Preferences
**GET** `/api/preferences/:userId`

Retrieve accessibility preferences for a user. Creates default preferences if none exist.

**Response:**
```json
{
  "id": "uuid",
  "userId": "user123",
  "focusMode": false,
  "motionBlocker": false,
  "contrastLevel": "normal",
  "largerClickTargets": false,
  "textSimplification": false,
  "readAloud": false,
  "preferences": {},
  "createdAt": "2025-11-15T19:26:00.000Z",
  "updatedAt": "2025-11-15T19:26:00.000Z"
}
```

#### Update User Preferences
**PUT** `/api/preferences/:userId`

Update user accessibility preferences.

**Request Body:**
```json
{
  "focusMode": true,
  "motionBlocker": true,
  "contrastLevel": "high",
  "largerClickTargets": true
}
```

**Response:** Same as GET response with updated values.

---

### 3. ChatGPT

**POST** `/api/chatgpt`

General-purpose ChatGPT endpoint powered by GPT-4. Use this for any conversation - accessibility help, general questions, or any AI assistance. Supports both streaming and non-streaming responses.

**Request Body:**
```json
{
  "message": "What is quantum computing?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Tell me about AI"
    },
    {
      "role": "assistant",
      "content": "AI stands for Artificial Intelligence..."
    }
  ],
  "systemPrompt": "You are a helpful assistant",
  "temperature": 0.7,
  "maxTokens": 1000,
  "stream": false
}
```

**Parameters:**
- `message` (required): The user's message
- `conversationHistory` (optional): Array of previous messages for context
- `systemPrompt` (optional): Custom system prompt to guide the AI's behavior
- `temperature` (optional): 0-2, controls randomness (default: 0.7)
- `maxTokens` (optional): Maximum response length (default: 1000)
- `stream` (optional): Enable streaming response (default: false)

**Non-Streaming Response:**
```json
{
  "message": "Quantum computing is a revolutionary approach to computation...",
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 200,
    "total_tokens": 250
  },
  "model": "gpt-4"
}
```

**Streaming Response:**
Server-sent events (text/event-stream) with chunks:
```
data: {"content":"Quantum","done":false}

data: {"content":" computing","done":false}

data: {"content":"","done":true,"fullResponse":"Quantum computing is..."}
```

---

### 4. Text Simplification

**POST** `/api/simplify`

Rewrite complex text into simpler, more accessible language.

**Request Body:**
```json
{
  "text": "The implementation of quantum entanglement necessitates the utilization of superposition states.",
  "readingLevel": "middle"
}
```

**Parameters:**
- `text` (required): The text to simplify
- `readingLevel` (optional): "elementary", "middle", or "high" (default: "middle")

**Response:**
```json
{
  "original": "The implementation of quantum entanglement necessitates...",
  "simplified": "Quantum entanglement requires using superposition states.",
  "readingLevel": "middle"
}
```

---

### 5. Visual Element Explainer (Alt Text Generation)

**POST** `/api/generate-alt-text`

Generate descriptive alt text for images using GPT-4 Vision.

**Request Body:**
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "useCache": true
}
```

**Parameters:**
- `imageUrl` (required): URL of the image
- `useCache` (optional): Use cached alt text if available (default: true)

**Response:**
```json
{
  "altText": "A golden retriever puppy sitting in a grassy field on a sunny day, looking directly at the camera with its tongue out.",
  "cached": false
}
```

---

### 6. Read Aloud (Text-to-Speech Timing)

**POST** `/api/read-aloud`

Get word-by-word timing data for spatial reading highlighting.

**Request Body:**
```json
{
  "text": "The quick brown fox jumps over the lazy dog",
  "wordsPerMinute": 150
}
```

**Parameters:**
- `text` (required): The text to process
- `wordsPerMinute` (optional): Reading speed, 50-300 (default: 150)

**Response:**
```json
{
  "text": "The quick brown fox jumps over the lazy dog",
  "wordTimings": [
    {
      "word": "The",
      "startTime": 0,
      "duration": 400
    },
    {
      "word": "quick",
      "startTime": 400,
      "duration": 400
    }
  ],
  "totalDuration": 3600,
  "wordsPerMinute": 150
}
```

---

### 8. Font Size Control

#### Adjust Font Size
**POST** `/api/font-size/:userId`

Increase, decrease, set, or reset the font size for a user.

**Request Body:**
```json
{
  "action": "increase"
}
```

**Actions:**
- `"increase"` - Increase font size by 10% (max 300%)
- `"decrease"` - Decrease font size by 10% (min 50%)
- `"set"` - Set to specific value (requires `value` parameter)
- `"reset"` - Reset to default 100%

**Request Body (Set to Specific Value):**
```json
{
  "action": "set",
  "value": 150
}
```

**Response:**
```json
{
  "fontSize": 110,
  "previousSize": 100,
  "action": "increase",
  "percentage": "110%"
}
```

#### Get Current Font Size
**GET** `/api/font-size/:userId`

Get the current font size setting for a user.

**Response:**
```json
{
  "fontSize": 110,
  "percentage": "110%"
}
```

---

### 9. Conversation Management

#### Get User Conversations
**GET** `/api/conversations/:userId`

Retrieve all chat conversations for a user.

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "user123",
    "messages": [
      {
        "role": "user",
        "content": "I need help with accessibility",
        "timestamp": "2025-11-15T19:26:00.000Z"
      },
      {
        "role": "assistant",
        "content": "I'd be happy to help! What specific challenges are you facing?",
        "timestamp": "2025-11-15T19:26:01.000Z"
      }
    ],
    "createdAt": "2025-11-15T19:26:00.000Z",
    "updatedAt": "2025-11-15T19:26:01.000Z"
  }
]
```

#### Get Specific Conversation
**GET** `/api/conversation/:conversationId`

Retrieve a specific conversation by ID.

**Response:** Same as single conversation object above.

---

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200**: Success
- **400**: Bad request (validation error)
- **404**: Resource not found
- **500**: Server error

**Error Response Format:**
```json
{
  "error": "Detailed error message"
}
```

---

## Integration Examples

### JavaScript/TypeScript (Chrome Extension)

```javascript
// Get user preferences
async function getPreferences(userId) {
  const response = await fetch(`http://localhost:5000/api/preferences/${userId}`);
  return await response.json();
}

// Chat with accessibility assistant
async function chatWithAssistant(userId, message, conversationId) {
  const response = await fetch('http://localhost:5000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, message, conversationId })
  });
  return await response.json();
}

// Use general ChatGPT
async function askChatGPT(message, conversationHistory = []) {
  const response = await fetch('http://localhost:5000/api/chatgpt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message, 
      conversationHistory,
      temperature: 0.7,
      maxTokens: 1000
    })
  });
  return await response.json();
}

// Streaming ChatGPT response
async function streamChatGPT(message, onChunk) {
  const response = await fetch('http://localhost:5000/api/chatgpt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, stream: true })
  });

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
        onChunk(data);
      }
    }
  }
}

// Simplify text
async function simplifyText(text, readingLevel = 'middle') {
  const response = await fetch('http://localhost:5000/api/simplify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, readingLevel })
  });
  return await response.json();
}

// Generate alt text
async function generateAltText(imageUrl) {
  const response = await fetch('http://localhost:5000/api/generate-alt-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageUrl, useCache: true })
  });
  return await response.json();
}

// Get read-aloud timing
async function getReadAloudTiming(text, wordsPerMinute = 150) {
  const response = await fetch('http://localhost:5000/api/read-aloud', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, wordsPerMinute })
  });
  return await response.json();
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting for production use.

## CORS

CORS is enabled for all origins (`*`). Configure this appropriately for production.

## Environment Variables

- `OPENAI_API_KEY`: Required for AI features (chat, simplify, alt-text)
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
