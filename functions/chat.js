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
    
    const proxyResponse = await fetch(upstream, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.PROXY_AUTH_TOKEN || 'dev-token'}`
      },
      body: JSON.stringify(proxyRequest)
    });
    
    if (!proxyResponse.ok) {
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
    return new Response(JSON.stringify({ error: error.message }), {
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