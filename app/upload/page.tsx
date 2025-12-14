'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { Upload, Download, Save, X, Eye, EyeOff, Link as LinkIcon } from 'lucide-react';
import LuoguEditor from '@/components/LuoguEditor';

export default function UploadPage() {
  const router = useRouter();
  const downloadFileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [downloadFile, setDownloadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载已有分类
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const items = await apiClient.getAll();
      const cats = new Set<string>();
      items.forEach(item => {
        if (item.category) {
          item.category.split(',').forEach(cat => {
            const trimmed = cat.trim();
            if (trimmed) cats.add(trimmed);
          });
        }
      });
      setAvailableCategories(Array.from(cats).sort());
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  // 文件上传处理（用于编辑器图床）
  const handleFileUpload = async (file: File): Promise<string> => {
    try {
      const url = await apiClient.uploadFile(file);
      return url;
    } catch (error: any) {
      throw new Error('文件上传失败：' + (error.message || '请重试'));
    }
  };

  // 选择下载文件
  const handleDownloadFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const url = await apiClient.uploadDownloadFile(file);
      setDownloadFile(file);
      (downloadFileInputRef.current as any).dataUrl = url;
    } catch (err: any) {
      setError('文件上传失败：' + (err.message || '请重试'));
    } finally {
      setUploading(false);
    }
  };

  // 添加分类
  const addCategory = (cat: string) => {
    if (cat && !categories.includes(cat)) {
      setCategories([...categories, cat]);
    }
  };

  // 移除分类
  const removeCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
  };

  // 添加新分类
  const handleAddNewCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      if (!availableCategories.includes(trimmed)) {
        setAvailableCategories([...availableCategories, trimmed].sort());
      }
      setNewCategory('');
    }
  };

  // 提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('标题不能为空');
      return;
    }

    // 验证密钥（去除空格）
    const trimmedKey = key.trim();
    if (!apiClient.verifyUploadKey(trimmedKey)) {
      setError('密钥错误，请检查密钥输入是否正确');
      setKey(''); // 清空输入栏
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const downloadFileUrl = (downloadFileInputRef.current as any)?.dataUrl || null;

      await apiClient.create({
        title: title.trim(),
        description: description.trim() || undefined,
        content: content || undefined,
        category: categories.length > 0 ? categories.join(',') : undefined,
        downloadFile: downloadFileUrl || undefined,
        timestamp: Date.now(),
      });

      // 清空表单
      setTitle('');
      setDescription('');
      setContent('');
      setCategories([]);
      setKey('');
      setDownloadFile(null);
      if (downloadFileInputRef.current) {
        downloadFileInputRef.current.value = '';
        (downloadFileInputRef.current as any).dataUrl = null;
      }

      router.push('/');
    } catch (err: any) {
      let errorMsg = '上传失败：' + (err.message || '请重试');
      if (err.message?.includes('Failed to fetch') || err.message?.includes('fetch')) {
        errorMsg = '无法连接到服务器，请检查：\n1. API 服务器是否正常运行\n2. 网络连接是否正常\n3. 环境变量 NEXT_PUBLIC_API_URL 是否正确设置';
      }
      setError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 relative">
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
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">
              发布内容
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <LinkIcon className="w-5 h-5 text-slate-300" />
                <Link
                  href="/gallery"
                  className="text-sm text-purple-300 hover:text-purple-200 hover:underline"
                >
                  前往图床
                </Link>
                <span className="text-slate-300">|</span>
                <Link
                  href="/markdown-guide"
                  className="text-sm text-purple-300 hover:text-purple-200 hover:underline"
                >
                  Markdown 指南
                </Link>
              </div>
              <Link
                href="/"
                className="p-2 hover:bg-white/20 rounded-lg transition-colors flex items-center justify-center"
                title="返回主页"
              >
                <X className="w-6 h-6 text-white" />
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/50 rounded-lg text-red-200">
              <div className="font-medium mb-1">上传失败</div>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 标题 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                标题 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-focus w-full px-4 py-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60 text-lg"
                placeholder="输入标题..."
                required
              />
            </div>

            {/* 描述 - 改为可选 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                简短描述（可选）
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="input-focus w-full px-4 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60"
                placeholder="输入简短描述（可选）..."
              />
            </div>

            {/* 分类选择 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                分类（可多选）
              </label>
              <div className="space-y-3">
                {/* 已有分类 */}
                {availableCategories.length > 0 && (
                  <div>
                    <div className="text-xs text-white/80 mb-2">已有分类：</div>
                    <div className="flex flex-wrap gap-2">
                      {availableCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            if (categories.includes(cat)) {
                              removeCategory(cat);
                            } else {
                              addCategory(cat);
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            categories.includes(cat)
                              ? 'bg-purple-500 text-white'
                              : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 添加新分类 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewCategory();
                      }
                    }}
                    className="input-focus flex-1 px-4 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60"
                    placeholder="输入新分类名称..."
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="btn-hover px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 shadow-md"
                  >
                    添加
                  </button>
                </div>

                {/* 已选分类 */}
                {categories.length > 0 && (
                  <div>
                    <div className="text-xs text-white/80 mb-2">已选分类：</div>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <span
                          key={cat}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/50 text-white rounded-full text-sm"
                        >
                          {cat}
                          <button
                            type="button"
                            onClick={() => removeCategory(cat)}
                            className="hover:text-purple-200"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Luogu 编辑器 */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                内容（支持 Markdown）
              </label>
              <LuoguEditor
                value={content}
                onChange={setContent}
                onFileUpload={handleFileUpload}
              />
            </div>

            {/* 密钥输入 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                上传密钥 <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  className="input-focus w-full px-4 py-2 pr-12 border border-white/30 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder:text-white/60"
                  placeholder="输入上传密钥..."
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                  title={showKey ? '隐藏密钥' : '显示密钥'}
                >
                  {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-white/70">
                密钥用于验证身份，请妥善保管
              </p>
            </div>

            {/* 独立下载文件 */}
            <div>
              <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                <Download className="w-4 h-4" />
                独立下载文件（可选）
              </label>
              <input
                ref={downloadFileInputRef}
                type="file"
                onChange={handleDownloadFileSelect}
                className="hidden"
                id="download-file-upload"
              />
              <label
                htmlFor="download-file-upload"
                className="block w-full px-4 py-3 border-2 border-dashed border-white/30 rounded-lg cursor-pointer hover:border-purple-400 transition-colors text-center bg-white/5"
              >
                {downloadFile ? (
                  <span className="text-white">{downloadFile.name}</span>
                ) : (
                  <span className="text-white/70">点击选择文件（将保存为UTF-8格式）</span>
                )}
              </label>
            </div>

            {/* 提交按钮 */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={uploading}
                className="btn-hover flex-1 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    上传中...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    发布
                  </>
                )}
              </button>
              <Link
                href="/"
                className="btn-hover px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 font-medium inline-block text-center shadow-md backdrop-blur-sm"
              >
                取消
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
