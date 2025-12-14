'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient, HistoryItem } from '@/lib/api-client';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';

interface PostClientProps {
  id: string;
}

export default function PostClient({ id }: PostClientProps) {
  const router = useRouter();
  const [item, setItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPost(id);
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
    if (!confirm('确定要删除这条记录吗？')) return;
    
    try {
      await apiClient.delete(item.id);
      router.push('/');
    } catch (error: any) {
      alert('删除失败：' + (error.message || '请重试'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white relative flex items-center justify-center">
        {/* 背景图片 - 从上到下渐变 */}
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
        {/* 背景图片 - 从上到下渐变 */}
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
      {/* 背景图片 - 从上到下渐变 */}
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

          {/* 文件展示 */}
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

          {/* 下载链接 */}
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

          {/* 删除按钮 */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={handleDelete}
              className="btn-hover px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 shadow-md"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}

