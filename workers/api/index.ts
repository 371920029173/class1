// Cloudflare Workers API
// 处理上传、删除和数据同步

export interface Env {
  HISTORY_KV: KVNamespace;
  UPLOAD_KEY: string; // 上传密钥
  DELETE_KEY: string; // 删除密钥
}

export interface FileItem {
  name: string;
  type: string; // 'image', 'video', 'audio', 'file'
  url: string;
  size?: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  url?: string;
  description?: string;
  category?: string;
  tags?: string[];
  content?: string; // 富文本内容
  attachments?: string[]; // 附件URL列表
  files?: FileItem[]; // 文件列表
  downloadFile?: string; // 独立下载文件URL
  timestamp: number;
  created_at: number;
  updated_at: number;
  author?: string; // 上传者标识
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS 头
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Upload-Key, X-Delete-Key',
    };

    // 处理 OPTIONS 请求
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 获取所有历史记录
      if (path === '/api/history' && request.method === 'GET') {
        return handleGetAll(env, corsHeaders);
      }

      // 获取单条记录
      if (path.startsWith('/api/history/') && request.method === 'GET') {
        const id = path.split('/').pop();
        return handleGetOne(env, id!, corsHeaders);
      }

      // 上传新记录（需要上传密钥）
      if (path === '/api/history' && request.method === 'POST') {
        return handleCreate(request, env, corsHeaders);
      }

      // 更新记录（需要上传密钥）
      if (path.startsWith('/api/history/') && request.method === 'PUT') {
        const id = path.split('/').pop();
        return handleUpdate(request, env, id!, corsHeaders);
      }

      // 删除记录（需要删除密钥）
      if (path.startsWith('/api/history/') && request.method === 'DELETE') {
        const id = path.split('/').pop();
        return handleDelete(request, env, id!, corsHeaders);
      }

      // 批量获取（分页）
      if (path === '/api/history/batch' && request.method === 'GET') {
        return handleBatch(request, env, corsHeaders);
      }

      // 文件上传
      if (path === '/api/upload' && request.method === 'POST') {
        return handleUpload(request, env, corsHeaders);
      }

      // 文件获取
      if (path.startsWith('/api/file/') && request.method === 'GET') {
        const fileId = path.split('/').pop();
        return handleGetFile(env, fileId!, corsHeaders);
      }

      return new Response('Not Found', { status: 404, headers: corsHeaders });
    } catch (error) {
      console.error('API Error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal Server Error', message: String(error) }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  },
};

// 获取所有记录
async function handleGetAll(env: Env, corsHeaders: Record<string, string>): Promise<Response> {
  const list = await env.HISTORY_KV.list();
  const items: HistoryItem[] = [];

  for (const key of list.keys) {
    if (key.name.startsWith('history:')) {
      const value = await env.HISTORY_KV.get(key.name, 'json');
      if (value) {
        items.push(value as HistoryItem);
      }
    }
  }

  // 按时间戳排序
  items.sort((a, b) => b.timestamp - a.timestamp);

  return new Response(JSON.stringify(items), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// 获取单条记录
async function handleGetOne(
  env: Env,
  id: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const item = await env.HISTORY_KV.get(`history:${id}`, 'json');
  
  if (!item) {
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(item), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// 创建新记录
async function handleCreate(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  // 验证上传密钥
  const uploadKey = request.headers.get('X-Upload-Key');
  if (!uploadKey || uploadKey !== env.UPLOAD_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid upload key' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const data = await request.json();
  const id = `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  const item: HistoryItem = {
    id,
    title: data.title,
    url: data.url,
    description: data.description,
    category: data.category,
    tags: data.tags || [],
    content: data.content, // 富文本内容
    attachments: data.attachments || [],
    files: data.files || [],
    downloadFile: data.downloadFile,
    timestamp: data.timestamp || now,
    created_at: now,
    updated_at: now,
    author: data.author || 'anonymous',
  };

  await env.HISTORY_KV.put(`history:${id}`, JSON.stringify(item));

  return new Response(JSON.stringify(item), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// 更新记录
async function handleUpdate(
  request: Request,
  env: Env,
  id: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  // 验证上传密钥
  const uploadKey = request.headers.get('X-Upload-Key');
  if (!uploadKey || uploadKey !== env.UPLOAD_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid upload key' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const existing = await env.HISTORY_KV.get(`history:${id}`, 'json');
  if (!existing) {
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const data = await request.json();
  const updated: HistoryItem = {
    ...(existing as HistoryItem),
    ...data,
    id,
    updated_at: Date.now(),
  };

  await env.HISTORY_KV.put(`history:${id}`, JSON.stringify(updated));

  return new Response(JSON.stringify(updated), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// 删除记录
async function handleDelete(
  request: Request,
  env: Env,
  id: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  // 验证删除密钥
  const deleteKey = request.headers.get('X-Delete-Key');
  if (!deleteKey || deleteKey !== env.DELETE_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid delete key' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  await env.HISTORY_KV.delete(`history:${id}`);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// 批量获取（支持分页和筛选）
async function handleBatch(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '100');
  const offset = parseInt(url.searchParams.get('offset') || '0');
  const category = url.searchParams.get('category');
  const search = url.searchParams.get('search');

  const list = await env.HISTORY_KV.list();
  const items: HistoryItem[] = [];

  for (const key of list.keys) {
    if (key.name.startsWith('history:')) {
      const value = await env.HISTORY_KV.get(key.name, 'json');
      if (value) {
        const item = value as HistoryItem;
        
      // 筛选（支持多分类，用逗号分隔）
      if (category) {
        const itemCats = (item.category || '').split(',').map(c => c.trim());
        const filterCats = category.split(',').map(c => c.trim());
        const hasMatch = filterCats.some(fc => itemCats.includes(fc));
        if (!hasMatch) continue;
      }
        if (search) {
          const searchLower = search.toLowerCase();
          const matches =
            item.title.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower) ||
            item.content?.toLowerCase().includes(searchLower);
          if (!matches) continue;
        }
        
        items.push(item);
      }
    }
  }

  // 排序
  items.sort((a, b) => b.timestamp - a.timestamp);

  // 分页
  const paginated = items.slice(offset, offset + limit);

  return new Response(
    JSON.stringify({
      items: paginated,
      total: items.length,
      limit,
      offset,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

// 文件上传
async function handleUpload(
  request: Request,
  env: Env,
  corsHeaders: Record<string, string>
): Promise<Response> {
  // 验证上传密钥
  const uploadKey = request.headers.get('X-Upload-Key');
  if (!uploadKey || uploadKey !== env.UPLOAD_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid upload key' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const isDownloadFile = formData.get('type') === 'download';

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 将文件转换为base64存储
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 存储文件元数据
    const fileData = {
      name: file.name,
      type: file.type,
      size: file.size,
      data: base64,
      isDownloadFile,
    };

    await env.HISTORY_KV.put(`file:${fileId}`, JSON.stringify(fileData));

    // 返回文件URL（用于访问）
    const fileUrl = `${new URL(request.url).origin}/api/file/${fileId}`;

    return new Response(
      JSON.stringify({
        url: fileUrl,
        id: fileId,
        name: file.name,
        type: file.type,
        size: file.size,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Upload failed', message: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

// 获取文件
async function handleGetFile(
  env: Env,
  fileId: string,
  corsHeaders: Record<string, string>
): Promise<Response> {
  try {
    const fileData = await env.HISTORY_KV.get(`file:${fileId}`, 'json');
    
    if (!fileData) {
      return new Response('File not found', {
        status: 404,
        headers: corsHeaders,
      });
    }

    // 将base64转换回二进制
    const binaryString = atob(fileData.data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 设置正确的Content-Type
    const contentType = fileData.type || 'application/octet-stream';
    const contentDisposition = fileData.isDownloadFile
      ? `attachment; filename="${fileData.name}"`
      : `inline; filename="${fileData.name}"`;

    return new Response(bytes, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Disposition': contentDisposition,
        'Content-Length': fileData.size.toString(),
      },
    });
  } catch (error) {
    return new Response('Error retrieving file', {
      status: 500,
      headers: corsHeaders,
    });
  }
}
