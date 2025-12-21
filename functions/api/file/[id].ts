// Cloudflare Pages Functions - 文件获取

const WORKER_URL = 'https://history-api-production.40761154.workers.dev';

// CORS 头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function proxyRequest(request: Request, id: string): Promise<Response> {
  const url = new URL(request.url);
  const workerUrl = `${WORKER_URL}/api/file/${id}${url.search}`;
  
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'connection') {
      headers.set(key, value);
    }
  });

  try {
    const response = await fetch(workerUrl, {
      method: 'GET',
      headers: headers,
    });
    
    const responseHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to connect to API server', message: String(error) }),
      { 
        status: 502,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders,
        }
      }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function onRequestGet(context: { request: Request; params: { id: string } }) {
  return proxyRequest(context.request, context.params.id);
}

