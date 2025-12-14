'use client';

import { useState, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { Upload, Image as ImageIcon, Video, Music, File, Copy, Check, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface UploadedFile {
  name: string;
  url: string;
  type: 'image' | 'video' | 'audio' | 'file';
  markdown: string;
}

export default function GalleryPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setUploading(true);

    try {
      for (const file of selectedFiles) {
        // 上传文件
        const url = await apiClient.uploadFile(file);
        
        // 确定文件类型
        let type: 'image' | 'video' | 'audio' | 'file' = 'file';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('video/')) type = 'video';
        else if (file.type.startsWith('audio/')) type = 'audio';

        // 生成Markdown
        let markdown = '';
        if (type === 'image') {
          markdown = `![${file.name}](${url})`;
        } else if (type === 'video') {
          markdown = `<video src="${url}" controls></video>`;
        } else if (type === 'audio') {
          markdown = `<audio src="${url}" controls></audio>`;
        } else {
          markdown = `[${file.name}](${url})`;
        }

        const uploadedFile: UploadedFile = {
          name: file.name,
          url,
          type,
          markdown,
        };

        setFiles((prev) => [...prev, uploadedFile]);
      }
    } catch (error: any) {
      alert('文件上传失败：' + (error.message || '请重试'));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const copyMarkdown = async (index: number) => {
    const markdown = files[index].markdown;
    await navigator.clipboard.writeText(markdown);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

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
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                图床 - Markdown 生成器
              </h1>
              <p className="text-slate-600">
                上传文件后自动生成对应的 Markdown 代码
              </p>
            </div>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回上传
            </Link>
          </div>

          {/* 上传区域 */}
          <div className="mb-8">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,audio/*,*"
              onChange={handleFileSelect}
              className="hidden"
              id="gallery-upload"
            />
            <label
              htmlFor="gallery-upload"
              className="block w-full px-6 py-12 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-purple-500 transition-colors text-center"
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="text-slate-600">上传中...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-12 h-12 text-slate-400" />
                  <span className="text-slate-600 text-lg">
                    点击选择文件或拖拽文件到这里
                  </span>
                  <span className="text-slate-500 text-sm">
                    支持图片、视频、音频和其他文件
                  </span>
                </div>
              )}
            </label>
          </div>

          {/* 文件列表 */}
          {files.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">
                已上传文件 ({files.length})
              </h2>
              {files.map((file, index) => (
                <div
                  key={index}
                  className="border border-slate-300 rounded-lg p-4 bg-slate-50"
                >
                  <div className="flex items-start gap-4">
                    {/* 文件预览 */}
                    <div className="flex-shrink-0">
                      {file.type === 'image' && (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-32 h-32 object-cover rounded"
                        />
                      )}
                      {file.type === 'video' && (
                        <video
                          src={file.url}
                          className="w-32 h-32 object-cover rounded"
                          controls
                        />
                      )}
                      {file.type === 'audio' && (
                        <div className="w-32 h-32 bg-purple-100 rounded flex items-center justify-center">
                          <Music className="w-8 h-8 text-purple-600" />
                        </div>
                      )}
                      {file.type === 'file' && (
                        <div className="w-32 h-32 bg-slate-200 rounded flex items-center justify-center">
                          <File className="w-8 h-8 text-slate-600" />
                        </div>
                      )}
                    </div>

                    {/* 文件信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {file.type === 'image' && <ImageIcon className="w-4 h-4 text-blue-500" />}
                        {file.type === 'video' && <Video className="w-4 h-4 text-red-500" />}
                        {file.type === 'audio' && <Music className="w-4 h-4 text-green-500" />}
                        {file.type === 'file' && <File className="w-4 h-4 text-slate-500" />}
                        <span className="font-medium text-slate-900 truncate">
                          {file.name}
                        </span>
                      </div>

                      {/* Markdown 代码 */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-600">Markdown 代码：</span>
                          <button
                            onClick={() => copyMarkdown(index)}
                            className="btn-hover flex items-center gap-1 px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 shadow-sm"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check className="w-3 h-3" />
                                已复制
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                复制
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="bg-slate-800 text-slate-100 p-3 rounded text-sm overflow-x-auto">
                          <code>{file.markdown}</code>
                        </pre>
                      </div>

                      {/* 删除按钮 */}
                      <button
                        onClick={() => removeFile(index)}
                        className="tag-hover text-xs text-red-600 hover:text-red-700 flex items-center gap-1 transition-all"
                      >
                        <X className="w-3 h-3" />
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {files.length === 0 && !uploading && (
            <div className="text-center py-12 text-slate-500">
              <p>还没有上传文件，点击上方区域开始上传</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

