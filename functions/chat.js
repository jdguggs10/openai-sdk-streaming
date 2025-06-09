/**
 * Sports Platform Chat Handler for Pages Functions
 * Streams responses from sports-proxy to frontend via SSE
 */

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    
    // Extract message from request
    const userMessage = body.message || body.input || "Hello";
    const userId = body.userId || "dev-user";
    const sport = body.sport || "baseball";
    
    // Build sports-proxy compatible request
    const proxyRequest = {
      model: "gpt-4",
      input: userMessage,
      tools: [
        {
          name: "resolve_team",
          description: "Resolve team name to team information",
          input_schema: {
            type: "object",
            properties: {
              name: { type: "string", description: "Team name" }
            }
          }
        }
      ],
      memories: [
        { key: "user_sport", value: sport },
        { key: "user_id", value: userId }
      ],
      stream: true
    };
    
    // Point to sports-proxy instead of OpenAI
    const upstream = env.SPORTS_PROXY_URL || "https://sports-proxy.gerrygugger.workers.dev/responses";
    
    // For development, we can use a test token or skip auth
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Only add auth header if we have a token
    if (env.PROXY_AUTH_TOKEN) {
      headers['Authorization'] = `Bearer ${env.PROXY_AUTH_TOKEN}`;
    }
    
    const proxyResponse = await fetch(upstream, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(proxyRequest)
    });
    
    if (!proxyResponse.ok) {
      // For development, return a mock response when auth fails
      if (proxyResponse.status === 401 && env.ENVIRONMENT !== 'production') {
        const mockResponse = `data: {"response_created":true}\n\ndata: {"text":"🏟️ **Development Mode** - Mock response for testing\\n\\nI would normally connect to the sports-proxy to get real Yankees data, but authentication is required for the production API.\\n\\n**Test Query:** ${userMessage}\\n**Sport Context:** ${sport}\\n**User ID:** ${userId}\\n\\nIn production, this would resolve team names, fetch roster data, and provide real-time statistics through the sports data platform."}\n\ndata: {"response_completed":true}\n\ndata: [DONE]\n\n`;
        
        return new Response(mockResponse, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      }
      
      throw new Error(`Sports proxy error: ${proxyResponse.status}`);
    }
    
    // Stream the response back to the client
    return new Response(proxyResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    console.error('Chat handler error:', error);
    
    // Enhanced error response with debug info
    const errorResponse = {
      error: error.message,
      debug: {
        upstream: env.SPORTS_PROXY_URL || "https://sports-proxy.gerrygugger.workers.dev/responses",
        hasToken: !!env.PROXY_AUTH_TOKEN
      }
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle OPTIONS for CORS
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}