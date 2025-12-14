'use client';

import { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, Link, Image } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('输入链接URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('输入图片URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  return (
    <div className="border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden">
      {/* 工具栏 */}
      <div className="flex items-center gap-1 p-2 bg-slate-50 dark:bg-slate-700 border-b border-slate-300 dark:border-slate-600">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          title="粗体"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          title="斜体"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          title="下划线"
        >
          <Underline className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1" />
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          title="无序列表"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={insertLink}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          title="插入链接"
        >
          <Link className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
          title="插入图片"
        >
          <Image className="w-4 h-4" />
        </button>
      </div>

      {/* 编辑器 */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`min-h-[200px] p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none ${
            isFocused ? 'ring-2 ring-purple-500' : ''
          }`}
          style={{
            wordBreak: 'break-word',
          }}
          suppressContentEditableWarning
        />

        {/* 占位符 */}
        {!value && !isFocused && (
          <div className="absolute top-4 left-4 pointer-events-none text-slate-400">
            开始输入内容...支持富文本格式
          </div>
        )}
      </div>
    </div>
  );
}

