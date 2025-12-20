// Pages Functions - 批量获取历史记录

const WORKER_URL = 'https://history-api-production.40761154.workers.dev';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

async function proxyRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const workerUrl = `${WORKER_URL}/api/history/batch${url.search}`;
  
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
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function GET(request: Request) {
  return proxyRequest(request);
}

