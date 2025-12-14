'use client';

import { useEffect, useState } from 'react';
import { apiClient, HistoryItem } from '@/lib/api-client';
import { Plus, Upload, Search, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Home() {
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);

  useEffect(() => {
    loadHistories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadHistories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategories]);

  const loadHistories = async () => {
    try {
      setLoading(true);
      setVisibleItems(new Set()); // 重置可见项
      const response = await apiClient.getBatch({
        search: searchQuery || undefined,
        limit: 100,
      });
      
      const items = response.items || [];
      setHistories(items);

      // 提取所有分类
      const cats = new Set<string>();
      items.forEach(item => {
        if (item.category) {
          item.category.split(',').forEach(cat => {
            const trimmed = cat.trim();
            if (trimmed) cats.add(trimmed);
          });
        }
      });
      setAllCategories(Array.from(cats).sort());

      // 渐进式显示卡片 - 使用 requestAnimationFrame 优化性能
      if (items.length > 0) {
        let index = 0;
        const showNext = () => {
          if (index < items.length) {
            const item = items[index];
            if (item.id) {
              setVisibleItems(prev => new Set([...prev, item.id!]));
            }
            index++;
            if (index < items.length) {
              requestAnimationFrame(() => {
                setTimeout(showNext, 30); // 每个卡片延迟30ms显示
              });
            }
          }
        };
        showNext();
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
      setHistories([]);
    } finally {
      setLoading(false);
    }
  };

  // 筛选分类
  const filteredCategories = allCategories.filter(cat =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // 切换分类选择
  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // 筛选后的内容
  const filteredHistories = histories.filter(item => {
    if (selectedCategories.length === 0) return true;
    if (!item.category) return false;
    const itemCats = item.category.split(',').map(c => c.trim());
    return selectedCategories.some(cat => itemCats.includes(cat));
  });

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条记录吗？')) return;
    
    try {
      await apiClient.delete(id);
      await loadHistories();
    } catch (error: any) {
      console.error('删除失败:', error);
      alert('删除失败：' + (error.message || '请重试'));
    }
  };

  return (
    <div className="min-h-screen bg-white relative">
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
      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* 头部 */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                一班史记
              </h1>
              <p className="text-slate-600">
                历史记录管理系统
              </p>
            </div>
            <Link
              href="/upload"
              className="btn-hover px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 font-medium shadow-md"
            >
              <Upload className="w-5 h-5" />
              上传
            </Link>
          </div>

          {/* 搜索栏 */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索标题、描述..."
              className="input-focus w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-slate-900"
            />
          </div>

          {/* 前往社区链接 */}
          <div className="mb-4">
            <a
              href="https://community-e7i.pages.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-600 hover:underline inline-flex items-center gap-1"
            >
              前往社区
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* 分类栏 */}
          {allCategories.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-700">
                  分类筛选
                </h3>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="text-xs text-purple-600 hover:underline"
                  >
                    清除筛选
                  </button>
                )}
              </div>

              {/* 分类搜索框 */}
              <div className="relative mb-3">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="搜索分类..."
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-slate-900"
                />
              </div>

              {/* 分类标签 */}
              <div className="flex flex-wrap gap-2">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`tag-hover px-3 py-1 rounded-full text-sm transition-all ${
                      selectedCategories.includes(cat)
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
                {filteredCategories.length === 0 && categorySearch && (
                  <span className="text-sm text-slate-500">
                    未找到匹配的分类
                  </span>
                )}
              </div>
            </div>
          )}
        </header>

        {/* 卡片列表 */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-slate-600">加载中...</p>
          </div>
        ) : filteredHistories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-slate-500 text-lg">
              {selectedCategories.length > 0 || searchQuery
                ? '没有找到匹配的记录'
                : '还没有记录，点击"上传"开始吧！'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHistories.map((item, index) => {
              const itemCategories = item.category ? item.category.split(',').map(c => c.trim()) : [];
              const isVisible = item.id ? visibleItems.has(item.id) : false;
              if (!item.id) return null;
              return (
                <Link
                  key={item.id}
                  href={`/post/${item.id}`}
                  className={`card-hover bg-white rounded-lg shadow-md p-6 block ${
                    isVisible ? 'animate-fade-in opacity-100' : 'opacity-0'
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <h3 className="text-xl font-semibold text-slate-900 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                      {item.description}
                    </p>
                  )}
                  {itemCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {itemCategories.map((cat, idx) => (
                        <span
                          key={idx}
                          className="tag-hover inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-slate-500 mt-4 pt-4 border-t border-slate-200">
                    {format(new Date(item.timestamp), 'yyyy年MM月dd日', { locale: zhCN })}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* 底部说明 */}
        <footer className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            tips: 若有疑问或建议可前往社区论坛讨论或直接向社区管理员&quot;371920029173&quot;私信
          </p>
        </footer>
      </div>
    </div>
  );
}
