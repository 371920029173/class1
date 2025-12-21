// Cloudflare Pages Functions - 单条记录操作

const WORKER_URL = 'https://history-api-production.40761154.workers.dev';

async function proxyRequest(request: Request, id: string): Promise<Response> {
  const url = new URL(request.url);
  const workerUrl = `${WORKER_URL}/api/history/${id}${url.search}`;
  
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'connection') {
      headers.set(key, value);
    }
  });

  const init: RequestInit = {
    method: request.method,
    headers: headers,
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    // 对于 JSON 请求，读取为文本
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      init.body = await request.text();
    } else {
      // 对于 FormData 等，直接传递
      init.body = request.body;
    }
  }

  try {
    const response = await fetch(workerUrl, init);
    
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

export async function onRequestGet(context: { request: Request; params: { id: string } }) {
  return proxyRequest(context.request, context.params.id);
}

export async function onRequestPut(context: { request: Request; params: { id: string } }) {
  return proxyRequest(context.request, context.params.id);
}

export async function onRequestDelete(context: { request: Request; params: { id: string } }) {
  return proxyRequest(context.request, context.params.id);
}

