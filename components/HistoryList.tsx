'use client';

import { HistoryItem, historyDB } from '@/lib/db-client';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Trash2, ExternalLink, Edit, Tag } from 'lucide-react';
import { useState } from 'react';
import HistoryForm from './HistoryForm';

interface HistoryListProps {
  histories: HistoryItem[];
  onDelete: (id: number) => void;
  onUpdate: () => void;
}

export default function HistoryList({ histories, onDelete, onUpdate }: HistoryListProps) {
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleUpdate = async (id: number, updates: Partial<HistoryItem>) => {
    try {
      await historyDB.updateHistory(id, updates);
      setEditingId(null);
      onUpdate();
    } catch (error) {
      console.error('更新失败:', error);
      alert('更新失败，请重试');
    }
  };

  if (histories.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-12 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          还没有历史记录，点击&quot;添加记录&quot;开始吧！
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {histories.map((item) => (
        <div
          key={item.id}
          className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-shadow p-6"
        >
          {editingId === item.id ? (
            <HistoryForm
              initialData={item}
              onSubmit={async (data) => {
                await handleUpdate(item.id!, data);
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mb-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {item.url}
                    </a>
                  )}
                  {item.description && (
                    <p className="text-slate-600 dark:text-slate-400 mb-3">
                      {item.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 items-center">
                    {item.category && (
                      <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                        {item.category}
                      </span>
                    )}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs flex items-center gap-1"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => setEditingId(item.id!)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                    title="编辑"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id!)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                    title="删除"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-3">
                <span>
                  时间: {format(new Date(item.timestamp), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                </span>
                {item.created_at && (
                  <span className="ml-4">
                    创建: {format(new Date(item.created_at), 'yyyy-MM-dd HH:mm', { locale: zhCN })}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

