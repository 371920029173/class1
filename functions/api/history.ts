// Cloudflare Pages Functions - 作为反向代理转发到 Workers API
// 这样前端和 API 都在同一个域名下，避免被拦截

const WORKER_URL = 'https://history-api-production.40761154.workers.dev';

async function proxyRequest(request: Request, path: string): Promise<Response> {
  const url = new URL(request.url);
  const workerUrl = `${WORKER_URL}${path}${url.search}`;
  
  // 复制请求头和 body
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    // 跳过一些不需要的头部
    if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'connection') {
      headers.set(key, value);
    }
  });

  const init: RequestInit = {
    method: request.method,
    headers: headers,
  };

  // 如果有 body，复制它
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
    
    // 复制响应
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

export async function onRequestGet(context: { request: Request }) {
  return proxyRequest(context.request, '/api/history');
}

export async function onRequestPost(context: { request: Request }) {
  return proxyRequest(context.request, '/api/history');
}

