'use client';

import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: string[];
  categoryCounts: Record<string, number>;
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
  categories,
  categoryCounts,
  categoryFilter,
  onCategoryChange,
}: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4">
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索标题、描述、URL或标签..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            categoryFilter
              ? 'bg-purple-600 text-white'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          <Filter className="w-4 h-4" />
          筛选
        </button>
      </div>

      {showFilters && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onCategoryChange('')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                !categoryFilter
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              全部
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat === categoryFilter ? '' : cat)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  categoryFilter === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {cat} ({categoryCounts[cat] || 0})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

