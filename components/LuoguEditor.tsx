'use client';

import { useState, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import { 
  Bold, Italic, Heading, List, Link, Image, Code, 
  Split, Eye, FileText, ExternalLink
} from 'lucide-react';
import NextLink from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';

interface LuoguEditorProps {
  value: string;
  onChange: (value: string) => void;
  onFileUpload?: (file: File) => Promise<string>;
}

export default function LuoguEditor({ value, onChange, onFileUpload }: LuoguEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // 插入文本到光标位置
  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    // 恢复光标位置
    setTimeout(() => {
      textarea.focus();
      const newPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  // 工具栏按钮
  const toolbarButtons = [
    { icon: Bold, action: () => insertText('**', '**'), title: '粗体' },
    { icon: Italic, action: () => insertText('*', '*'), title: '斜体' },
    { icon: Heading, action: () => insertText('## ', ''), title: '标题' },
    { icon: List, action: () => insertText('- ', ''), title: '列表' },
    { icon: Link, action: () => insertText('[', '](url)'), title: '链接' },
    { icon: Code, action: () => insertText('`', '`'), title: '行内代码' },
  ];

  // 上传图片
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      let imageUrl: string;
      
      if (onFileUpload) {
        imageUrl = await onFileUpload(file);
      } else {
        // 使用默认上传
        imageUrl = await apiClient.uploadFile(file);
      }

      // 插入图片Markdown
      const imageMarkdown = `![${file.name}](${imageUrl})\n`;
      insertText(imageMarkdown);
      
      setUploadProgress(100);
    } catch (error: any) {
      alert('图片上传失败：' + (error.message || '请重试'));
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 代码块插入
  const insertCodeBlock = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      insertText('```\n', '\n```');
    } else {
      insertText('```\n', '\n```');
    }
  };

  return (
    <div className="border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
      {/* 工具栏 */}
      <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 border-b border-slate-300 dark:border-slate-600">
        <div className="flex items-center gap-1">
          {toolbarButtons.map((btn, index) => (
            <button
              key={index}
              type="button"
              onClick={btn.action}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
              title={btn.title}
            >
              <btn.icon className="w-4 h-4" />
            </button>
          ))}
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
          <button
            type="button"
            onClick={insertCodeBlock}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
            title="代码块"
          >
            <Code className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors cursor-pointer"
            title="上传图片"
          >
            <Image className="w-4 h-4" />
          </label>
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
          <NextLink
            href="/gallery"
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400"
            title="前往图床"
          >
            <ExternalLink className="w-3 h-3" />
            图床
          </NextLink>
          <NextLink
            href="/markdown-guide"
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400"
            title="Markdown 指南"
          >
            <ExternalLink className="w-3 h-3" />
            指南
          </NextLink>
        </div>

        {/* 视图切换 */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'edit'
                ? 'bg-purple-600 text-white'
                : 'hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
            title="编辑模式"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'split'
                ? 'bg-purple-600 text-white'
                : 'hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
            title="分屏模式"
          >
            <Split className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'preview'
                ? 'bg-purple-600 text-white'
                : 'hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
            title="预览模式"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 上传进度 */}
      {uploading && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-slate-300 dark:border-slate-600">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {uploadProgress}%
            </span>
          </div>
        </div>
      )}

      {/* 编辑器内容区 */}
      <div className="flex" style={{ height: '600px' }}>
        {/* 编辑区 */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} border-r border-slate-300 dark:border-slate-600`}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-full p-4 resize-none focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm"
              placeholder="开始输入 Markdown 内容..."
              spellCheck={false}
            />
          </div>
        )}

        {/* 预览区 */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900`}>
            <div className="prose prose-slate dark:prose-invert max-w-none">
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
                      <pre className="bg-slate-800 dark:bg-slate-900 rounded-lg p-4 overflow-x-auto">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                  a: ({ node, ...props }) => (
                    <a
                      {...props}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                }}
              >
                {value || '*暂无内容*'}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


