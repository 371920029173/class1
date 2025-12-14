// API 客户端 - 与 Cloudflare Workers 通信

// API 基础URL - 如果未设置，使用本地开发服务器或提示错误
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? '' : 'https://your-worker.your-subdomain.workers.dev');

// 硬编码密钥
const UPLOAD_KEY = 'ssfz2027n15662768895';
const DELETE_KEY = 'ssfz2027371920029173';

export interface HistoryItem {
  id?: string;
  title: string;
  url?: string;
  description?: string;
  category?: string;
  tags?: string[];
  content?: string; // 富文本内容
  attachments?: string[]; // 附件URL列表
  files?: FileItem[]; // 文件列表（包含音视频图片等）
  timestamp: number;
  created_at?: number;
  updated_at?: number;
  author?: string;
  downloadFile?: string; // 独立下载文件URL
}

export interface FileItem {
  name: string;
  type: string; // 'image', 'video', 'audio', 'file'
  url: string;
  size?: number;
}

export interface ApiResponse<T> {
  items?: T[];
  item?: T;
  total?: number;
  limit?: number;
  offset?: number;
  error?: string;
  success?: boolean;
}

class ApiClient {
  // 使用硬编码密钥
  private get uploadKey(): string {
    return UPLOAD_KEY;
  }

  private get deleteKey(): string {
    return DELETE_KEY;
  }

  // 获取所有记录
  async getAll(): Promise<HistoryItem[]> {
    const response = await fetch(`${API_BASE_URL}/api/history`);
    if (!response.ok) throw new Error('Failed to fetch history');
    return await response.json();
  }

  // 获取单条记录
  async getOne(id: string): Promise<HistoryItem> {
    const response = await fetch(`${API_BASE_URL}/api/history/${id}`);
    if (!response.ok) throw new Error('Failed to fetch item');
    return await response.json();
  }

  // 批量获取（支持分页和筛选）
  async getBatch(options?: {
    limit?: number;
    offset?: number;
    category?: string;
    search?: string;
  }): Promise<ApiResponse<HistoryItem>> {
    const params = new URLSearchParams();
    if (options?.limit) params.set('limit', options.limit.toString());
    if (options?.offset) params.set('offset', options.offset.toString());
    if (options?.category) params.set('category', options.category);
    if (options?.search) params.set('search', options.search);

    const response = await fetch(`${API_BASE_URL}/api/history/batch?${params}`);
    if (!response.ok) throw new Error('Failed to fetch batch');
    return await response.json();
  }

  // 创建记录（使用硬编码密钥）
  async create(item: Omit<HistoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<HistoryItem> {
    if (!API_BASE_URL || API_BASE_URL.includes('your-worker')) {
      throw new Error('API 服务器未配置。请在环境变量中设置 NEXT_PUBLIC_API_URL，或部署 Cloudflare Workers。');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Upload-Key': this.uploadKey,
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        throw new Error(error.error || 'Failed to create item');
      }

      return await response.json();
    } catch (error: any) {
      if (error.message?.includes('fetch')) {
        throw new Error('无法连接到服务器。请检查：1) API 服务器是否正常运行 2) 网络连接 3) NEXT_PUBLIC_API_URL 环境变量');
      }
      throw error;
    }
  }

  // 更新记录（使用硬编码密钥）
  async update(
    id: string,
    updates: Partial<HistoryItem>
  ): Promise<HistoryItem> {
    const response = await fetch(`${API_BASE_URL}/api/history/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Upload-Key': this.uploadKey,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update item');
    }

    return await response.json();
  }

  // 删除记录（使用硬编码密钥）
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/history/${id}`, {
      method: 'DELETE',
      headers: {
        'X-Delete-Key': this.deleteKey,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete item');
    }
  }

  // 上传文件
  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'X-Upload-Key': this.uploadKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }

    const data = await response.json();
    return data.url;
  }

  // 上传独立文件（用于下载）
  async uploadDownloadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'download');

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'X-Upload-Key': this.uploadKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }

    const data = await response.json();
    return data.url;
  }

  // 检查连接
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/history?limit=1`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // 验证密钥（用于上传页面）
  verifyUploadKey(key: string): boolean {
    return key.trim() === UPLOAD_KEY;
  }

  verifyDeleteKey(key: string): boolean {
    return key.trim() === DELETE_KEY;
  }
}

export const apiClient = new ApiClient();
