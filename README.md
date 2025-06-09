# Sports Platform Dev Chat Interface

A lightweight Cloudflare Pages application for testing and developing against the sports-proxy OpenAI Responses API integration.

## 🚀 Live Demo

The app is automatically deployed to Cloudflare Pages at: 
**https://openai-sdk-streaming.pages.dev** (or your custom domain)

## 🏗️ Architecture

- **Frontend**: Static HTML with Tailwind CSS and vanilla JavaScript
- **Backend**: Cloudflare Pages Functions (`/functions/chat.js`)
- **Integration**: Direct streaming from `sports-proxy.gerrygugger.workers.dev/responses`
- **Protocol**: OpenAI Responses API compatible with Server-Sent Events

## 📋 Features

### Chat Interface
- Real-time streaming responses via SSE
- Sport context switching (Baseball/Hockey)
- User ID and auth token configuration
- Responsive design with Tailwind CSS

### Developer Tools
- Live debug console with SSE event logging
- Pre-built test scenarios for quick validation
- Raw event inspection for debugging tool calls
- Performance metrics tracking

### Test Scenarios
- **MLB Team Query**: "Tell me about the Yankees"
- **NHL Team Query**: "Get Bruins roster"  
- **Game Results**: "Who won the last Yankees game?"
- **Standings**: "Show me baseball standings"

## 🔧 Local Development

### Prerequisites
- Node.js 18+
- Wrangler CLI
- Cloudflare account with Pages enabled

### Setup
```bash
# Clone and install
git clone https://github.com/jdguggs10/openai-sdk-streaming.git
cd openai-sdk-streaming
npm install

# Authenticate with Cloudflare
npx wrangler login

# Set up local environment variables
cp .dev.vars.example .dev.vars
# Edit .dev.vars with your configuration

# Set production secrets (optional for development)
npx wrangler secret put PROXY_AUTH_TOKEN

# Start local development server
npx wrangler pages dev public --compatibility-date=2025-06-08
```

### Development Mode Features

The local development server includes:
- **Mock responses** when sports-proxy authentication fails
- **Real-time testing** of the chat interface and SSE streaming
- **Debug console** with detailed logging
- **Test scenarios** for quick validation

Access the local app at `http://localhost:8788`

### Development vs Production
- **Development**: Uses mock responses for testing without authentication
- **Production**: Requires valid JWT tokens from auth-mcp service

## 📡 API Integration

### Request Format
The chat interface sends requests to `/chat` with the following structure:

```javascript
{
  "message": "Tell me about the Yankees",
  "sport": "baseball",
  "userId": "dev-user",
  "authToken": "your-token"
}
```

### Sports-Proxy Integration
The Pages Function transforms this into an OpenAI Responses API compatible request:

```javascript
{
  "model": "gpt-4",
  "input": "Tell me about the Yankees", 
  "tools": [
    {
      "name": "resolve_team",
      "description": "Resolve team name to team information",
      "input_schema": {
        "type": "object",
        "properties": {
          "name": { "type": "string", "description": "Team name" }
        }
      }
    }
  ],
  "memories": [
    { "key": "user_sport", "value": "baseball" },
    { "key": "user_id", "value": "dev-user" }
  ],
  "stream": true
}
```

## 🎯 Use Cases

### For Developers
- **API Testing**: Validate sports-proxy endpoints in real-time
- **Tool Development**: Test new meta-tool façades and entity resolution
- **Streaming Validation**: Verify SSE implementation and event handling
- **Performance Testing**: Monitor response times and tool execution

### For Product Testing  
- **Sport Detection**: Validate automatic sport context switching
- **Conversation Flow**: Test multi-turn conversations with memory
- **Error Handling**: Verify graceful degradation and error messaging
- **User Experience**: Prototype chat interactions and tool discovery

## 🔐 Configuration

### Environment Variables
```bash
SPORTS_PROXY_URL=https://sports-proxy.gerrygugger.workers.dev/responses
PROXY_AUTH_TOKEN=your-development-token
```

### Wrangler Configuration
```toml
name = "sports-platform-dev-chat"
pages_build_output_dir = "public"
compatibility_date = "2025-06-08"

[vars]
SPORTS_PROXY_URL = "https://sports-proxy.gerrygugger.workers.dev/responses"
```

## 📊 Monitoring

### Debug Console
The interface includes a live debug console that logs:
- SSE connection events  
- Request/response timing
- Tool call sequences
- Error conditions
- Performance metrics

### Health Checks
Built-in validation for:
- Sports-proxy connectivity
- Authentication status
- Tool availability
- Streaming functionality

## 🚀 Deployment

### Automatic Deployment
Every push to `main` triggers automatic deployment to Cloudflare Pages.

### Manual Deployment
```bash
git add .
git commit -m "Update dev chat interface"
git push origin main
```

### Custom Domain
Configure custom domains in the Cloudflare Pages dashboard under **Custom domains**.

## 🔧 Extending

### Adding New Sports
1. Update sport selection in `public/index.html`
2. Add test scenarios for the new sport
3. Verify sports-proxy routing supports the new sport

### New Test Scenarios
Add buttons to the test scenarios section:
```html
<button onclick="sendTestMessage('Your test query')" class="...">
  <div class="font-medium">Test Name</div>
  <div class="text-sm text-gray-600">Your test query</div>
</button>
```

### Enhanced Debugging
Extend the debug console in the JavaScript section to log additional events or metrics.

## 📚 Related Documentation

- [Sports Platform Main Docs](../README.md)
- [Sports-Proxy API Reference](../workers/sports-proxy/README.md)  
- [OpenAI Responses API Spec](https://platform.openai.com/docs/api-reference/responses)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with local development server
5. Create a pull request

The preview URL will be automatically generated for testing before merging.

---

**Status**: ✅ Production Ready | **Integration**: Sports-Proxy | **Platform**: Cloudflare Pages