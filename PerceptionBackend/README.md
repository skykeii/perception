# Perception Accessibility Extension - Backend API

A fully functional backend API for the Perception AI-powered accessibility Chrome extension. This backend provides intelligent accessibility features powered by OpenAI's GPT-4 and GPT-4 Vision models.

## 🚀 Features

### AI-Powered Capabilities

1. **💬 ChatGPT Integration** - Full-featured GPT-4 powered chatbot with streaming support for any conversation - accessibility help, general questions, or AI assistance

2. **📝 Text Simplification** - Automatically rewrites complex text into simpler language at different reading levels (elementary, middle school, high school)

3. **👁️ Visual Element Explainer** - Uses GPT-4 Vision to generate descriptive alt text for images, making visual content accessible

4. **📢 Read-Aloud Engine** - Provides word-by-word timing data for spatial text highlighting during read-aloud

5. **🔤 Font Size Control** - Dynamic font size adjustment with increase, decrease, set, and reset capabilities (50% - 300% range)

6. **⚙️ User Preferences Management** - Store and retrieve user accessibility settings (focus mode, motion blocker, contrast control, font size, etc.)

### Technical Features

- ✅ RESTful API architecture
- ✅ CORS enabled for Chrome extension integration
- ✅ In-memory storage (easily replaceable with database)
- ✅ Request validation using Zod schemas
- ✅ Comprehensive error handling
- ✅ Streaming support for ChatGPT responses
- ✅ Alt text caching to reduce API costs
- ✅ Conversation history management

## 📋 Prerequisites

- Node.js 20+
- OpenAI API Key ([Get one here](https://platform.openai.com/api-keys))

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd perception-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Add your OpenAI API key to Replit Secrets or create a `.env` file:
```
OPENAI_API_KEY=sk-your-api-key-here
```

4. **Start the server**
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## 📚 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/preferences/:userId` | Get user preferences |
| PUT | `/api/preferences/:userId` | Update user preferences |
| POST | `/api/chatgpt` | ChatGPT conversation (with streaming support) |
| POST | `/api/simplify` | Simplify complex text |
| POST | `/api/generate-alt-text` | Generate image descriptions |
| POST | `/api/read-aloud` | Get text-to-speech timing |
| GET | `/api/conversations/:userId` | Get user's chat history |
| GET | `/api/conversation/:conversationId` | Get specific conversation |
| POST | `/api/font-size/:userId` | Adjust font size (increase/decrease/set/reset) |
| GET | `/api/font-size/:userId` | Get current font size setting |

📖 See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint documentation and examples.

## 🎯 Quick Start Examples

### 1. Chat with ChatGPT
```javascript
const response = await fetch('http://localhost:5000/api/chatgpt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Explain quantum computing in simple terms',
    temperature: 0.7,
    maxTokens: 500
  })
});

const data = await response.json();
console.log(data.message); // AI response
```

### 2. Simplify Text
```javascript
const response = await fetch('http://localhost:5000/api/simplify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'The utilization of quantum entanglement necessitates...',
    readingLevel: 'middle'
  })
});

const data = await response.json();
console.log(data.simplified); // Simplified text
```

### 3. Generate Alt Text for Images
```javascript
const response = await fetch('http://localhost:5000/api/generate-alt-text', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageUrl: 'https://example.com/image.jpg',
    useCache: true
  })
});

const data = await response.json();
console.log(data.altText); // Descriptive alt text
```

### 4. Streaming ChatGPT Response
```javascript
const response = await fetch('http://localhost:5000/api/chatgpt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Tell me a story',
    stream: true
  })
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
      if (!data.done) {
        process.stdout.write(data.content); // Real-time streaming
      }
    }
  }
}
```

## 🏗️ Architecture

```
perception-backend/
├── server/
│   ├── index.ts          # Express server setup, CORS, middleware
│   ├── routes.ts         # All API endpoints
│   ├── storage.ts        # In-memory data storage
│   └── vite.ts           # Vite integration
├── shared/
│   └── schema.ts         # Zod validation schemas & TypeScript types
├── client/               # Frontend (React)
└── API_DOCUMENTATION.md  # Complete API reference
```

## 🔒 Security Notes

**Current Implementation:**
- CORS is set to allow all origins (`*`)
- No authentication/authorization
- In-memory storage (data is lost on restart)

**For Production:**
- [ ] Implement proper authentication (JWT, OAuth, etc.)
- [ ] Add rate limiting to prevent abuse
- [ ] Use a persistent database (PostgreSQL, MongoDB, etc.)
- [ ] Configure CORS for specific domains only
- [ ] Add request validation and sanitization
- [ ] Implement API key rotation
- [ ] Add logging and monitoring

## 💾 Storage

Currently uses **in-memory storage** for rapid development. Data includes:
- User preferences (accessibility settings)
- Chat conversations and history
- Alt text cache

To use a database, modify `server/storage.ts` to implement the `IStorage` interface with your database client.

## 🔧 Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT-4 and GPT-4 Vision |
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | Environment mode (development/production) |

### AI Model Configuration

You can customize the AI models in `server/routes.ts`:

- **Accessibility Chat**: Uses `gpt-4` (can be changed to `gpt-3.5-turbo` for cost savings)
- **General ChatGPT**: Uses `gpt-4` (configurable per request)
- **Text Simplification**: Uses `gpt-4` with temperature 0.3
- **Alt Text Generation**: Uses `gpt-4o` for vision capabilities

## 📊 Cost Optimization

To reduce OpenAI API costs:

1. **Use Alt Text Caching** - Set `useCache: true` to avoid regenerating alt text
2. **Lower Model Tier** - Use `gpt-3.5-turbo` instead of `gpt-4` where appropriate
3. **Reduce Max Tokens** - Lower `maxTokens` parameter for shorter responses
4. **Batch Requests** - Process multiple items together when possible

## 🧪 Testing

Test endpoints using curl:

```bash
# Health check
curl http://localhost:5000/api/health

# Get preferences
curl http://localhost:5000/api/preferences/user123

# Chat with assistant
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"userId":"user123","message":"I need help with accessibility"}'

# Use ChatGPT
curl -X POST http://localhost:5000/api/chatgpt \
  -H "Content-Type: application/json" \
  -d '{"message":"What is AI?","temperature":0.7}'
```

## 🚢 Deployment

This backend is ready to deploy to:
- Replit (already configured)
- Heroku
- Vercel
- Railway
- Any Node.js hosting platform

Remember to set the `OPENAI_API_KEY` environment variable in your deployment platform.

## 📝 License

MIT License

## 🤝 Contributing

Contributions welcome! Feel free to:
- Add new accessibility features
- Improve error handling
- Add database integration
- Implement authentication
- Optimize performance

## 💡 Feature Ideas

Future enhancements:
- [ ] Voice command processing with speech-to-text
- [ ] User authentication and accounts
- [ ] Analytics dashboard for feature usage
- [ ] Batch processing for multiple requests
- [ ] WebSocket support for real-time updates
- [ ] Multi-language support
- [ ] Custom AI model fine-tuning for accessibility
- [ ] Integration with screen readers

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for accessibility and inclusion**
