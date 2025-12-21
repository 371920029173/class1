// Cloudflare Pages Functions - 文件上传

const WORKER_URL = 'https://history-api-production.40761154.workers.dev';

async function proxyRequest(request: Request): Promise<Response> {
  const workerUrl = `${WORKER_URL}/api/upload`;
  
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'connection') {
      headers.set(key, value);
    }
  });

  try {
    // 对于文件上传，直接传递 request body（FormData）
    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: headers,
      body: request.body, // FormData 可以直接传递
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

export async function onRequestPost(context: { request: Request }) {
  return proxyRequest(context.request);
}

