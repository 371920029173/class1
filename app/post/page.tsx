'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient, HistoryItem } from '@/lib/api-client';
import { ArrowLeft, Download, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';

function PostContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');
  const [item, setItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteKey, setShowDeleteKey] = useState(false);
  const [deleteKey, setDeleteKey] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadPost(id);
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadPost = async (postId: string) => {
    try {
      setLoading(true);
      const data = await apiClient.getOne(postId);
      setItem(data);
    } catch (error) {
      console.error('加载失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!item?.id) return;
    
    // 验证删除密钥
    const trimmedKey = deleteKey.trim();
    if (!apiClient.verifyDeleteKey(trimmedKey)) {
      alert('删除密钥错误，请检查密钥输入是否正确');
      setDeleteKey(''); // 清空输入栏
      return;
    }
    
    if (!confirm('确定要删除这条记录吗？此操作不可恢复！')) return;
    
    try {
      await apiClient.delete(item.id);
      router.push('/');
    } catch (error: any) {
      alert('删除失败：' + (error.message || '请重试'));
      setDeleteKey(''); // 清空输入栏
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-white relative flex items-center justify-center">
        <div 
          className="absolute top-0 left-0 w-full h-[450px] z-0"
          style={{
            backgroundImage: `url('/bg-image.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
            filter: 'saturate(1)',
          }}
        />
        <div className="text-center relative z-10">
          <p className="text-slate-600 text-lg">缺少参数</p>
          <Link href="/" className="mt-4 inline-block text-purple-600 hover:text-purple-700">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white relative flex items-center justify-center">
        <div 
          className="absolute top-0 left-0 w-full h-[450px] z-0"
          style={{
            backgroundImage: `url('/bg-image.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
            filter: 'saturate(1)',
          }}
        />
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-slate-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-white relative flex items-center justify-center">
        <div 
          className="absolute top-0 left-0 w-full h-[450px] z-0"
          style={{
            backgroundImage: `url('/bg-image.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
            filter: 'saturate(1)',
          }}
        />
        <div className="text-center relative z-10">
          <p className="text-slate-600 text-lg">记录不存在</p>
          <Link href="/" className="mt-4 inline-block text-purple-600 hover:text-purple-700">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative py-8">
      <div 
        className="absolute top-0 left-0 w-full h-[450px] z-0"
        style={{
          backgroundImage: `url('/bg-image.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
          filter: 'saturate(1)',
        }}
      />
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </Link>

        <article className="bg-white rounded-lg shadow-lg p-8">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              {item.title}
            </h1>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {item.url}
              </a>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
              <span>
                {format(new Date(item.timestamp), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
              </span>
              {item.category && (
                <div className="flex flex-wrap gap-2">
                  {item.category.split(',').map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full"
                    >
                      {cat.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          {item.description && (
            <div className="mb-6 text-slate-700">
              <p className="text-lg">{item.description}</p>
            </div>
          )}

          {item.content && (
            <div className="mb-6 prose max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex, rehypeRaw, rehypeHighlight]}
                components={{
                  img: ({ node, ...props }) => (
                    <img
                      {...props}
                      className="max-w-full h-auto rounded-lg shadow-md my-4"
                      alt={props.alt || ''}
                    />
                  ),
                  code: ({ node, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <pre className="bg-slate-800 rounded-lg p-4 overflow-x-auto">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className="bg-slate-100 px-1 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                }}
              >
                {item.content}
              </ReactMarkdown>
            </div>
          )}

          {item.files && item.files.length > 0 && (
            <div className="mb-6 space-y-4">
              {item.files.map((file, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  {file.type === 'image' && (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="max-w-full h-auto rounded"
                    />
                  )}
                  {file.type === 'video' && (
                    <video
                      src={file.url}
                      controls
                      className="max-w-full rounded"
                    >
                      您的浏览器不支持视频播放
                    </video>
                  )}
                  {file.type === 'audio' && (
                    <audio
                      src={file.url}
                      controls
                      className="w-full"
                    >
                      您的浏览器不支持音频播放
                    </audio>
                  )}
                  {file.type === 'file' && (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {file.name}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {item.downloadFile && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <a
                href={item.downloadFile}
                download
                className="btn-hover inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md"
              >
                <Download className="w-5 h-5" />
                下载文件
              </a>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-200">
            {!showDeleteModal ? (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn-hover px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 shadow-md"
              >
                <Trash2 className="w-4 h-4" />
                删除
              </button>
            ) : (
              <div className="space-y-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    删除密钥 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showDeleteKey ? 'text' : 'password'}
                      value={deleteKey}
                      onChange={(e) => setDeleteKey(e.target.value)}
                      className="input-focus w-full px-4 py-2 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                      placeholder="输入删除密钥..."
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeleteKey(!showDeleteKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                      title={showDeleteKey ? '隐藏密钥' : '显示密钥'}
                    >
                      {showDeleteKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    密钥用于验证身份，请妥善保管
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDelete}
                    className="btn-hover px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 shadow-md"
                  >
                    <Trash2 className="w-4 h-4" />
                    确认删除
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteKey('');
                      setShowDeleteKey(false);
                    }}
                    className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

export default function PostPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white relative flex items-center justify-center">
        <div 
          className="absolute top-0 left-0 w-full h-[450px] z-0"
          style={{
            backgroundImage: `url('/bg-image.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0) 100%)',
            filter: 'saturate(1)',
          }}
        />
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-slate-600">加载中...</p>
        </div>
      </div>
    }>
      <PostContent />
    </Suspense>
  );
}

