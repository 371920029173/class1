'use client';

import { useState } from 'react';
import { ArrowLeft, Book, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';

const markdownCategories = [
  {
    id: 'basic',
    title: '基础格式',
    items: [
      {
        id: 'headings',
        name: '标题',
        description: '使用 # 号创建标题，数量越多级别越小',
        syntax: '# 一级标题\n## 二级标题\n### 三级标题\n#### 四级标题\n##### 五级标题\n###### 六级标题',
        example: '# 一级标题\n## 二级标题\n### 三级标题',
        tips: '标题会自动生成目录，建议合理使用标题层级',
      },
      {
        id: 'bold',
        name: '粗体',
        description: '使用两个星号或下划线包裹文本',
        syntax: '**这是粗体文本**\n或者\n__这也是粗体文本__',
        example: '**这是粗体文本** 和 __这也是粗体文本__',
        tips: '推荐使用 ** 而不是 __，更通用',
      },
      {
        id: 'italic',
        name: '斜体',
        description: '使用一个星号或下划线包裹文本',
        syntax: '*这是斜体文本*\n或者\n_这也是斜体文本_',
        example: '*这是斜体文本* 和 _这也是斜体文本_',
        tips: '推荐使用 * 而不是 _，避免与下划线混淆',
      },
      {
        id: 'bold-italic',
        name: '粗斜体',
        description: '同时使用粗体和斜体',
        syntax: '***粗斜体文本***\n或者\n___粗斜体文本___',
        example: '***这是粗斜体文本***',
        tips: '三个符号组合即可',
      },
      {
        id: 'strikethrough',
        name: '删除线',
        description: '使用两个波浪号包裹文本',
        syntax: '~~这是删除的文本~~',
        example: '原价 ~~100元~~ 现价 50元',
        tips: '常用于标注已删除或过时的内容',
      },
      {
        id: 'inline-code',
        name: '行内代码',
        description: '使用反引号包裹代码',
        syntax: '使用 `代码` 在文本中',
        example: '在 JavaScript 中使用 `console.log()` 输出内容',
        tips: '行内代码适合显示函数名、变量名等短代码',
      },
    ],
  },
  {
    id: 'lists',
    title: '列表',
    items: [
      {
        id: 'unordered-list',
        name: '无序列表',
        description: '使用 -、* 或 + 创建无序列表',
        syntax: '- 项目一\n- 项目二\n- 项目三\n\n或者\n\n* 项目一\n* 项目二\n\n或者\n\n+ 项目一\n+ 项目二',
        example: '- 苹果\n- 香蕉\n- 橙子',
        tips: '三种符号效果相同，推荐使用 -',
      },
      {
        id: 'ordered-list',
        name: '有序列表',
        description: '使用数字加点号创建有序列表',
        syntax: '1. 第一项\n2. 第二项\n3. 第三项',
        example: '1. 第一步：准备材料\n2. 第二步：开始制作\n3. 第三步：完成',
        tips: '数字可以乱序，会自动排序',
      },
      {
        id: 'nested-list',
        name: '嵌套列表',
        description: '在列表项下缩进创建子列表',
        syntax: '- 主项目\n  - 子项目一\n  - 子项目二\n    - 子子项目',
        example: '- 水果\n  - 苹果\n  - 香蕉\n- 蔬菜\n  - 胡萝卜\n  - 白菜',
        tips: '使用两个空格或一个Tab缩进',
      },
      {
        id: 'task-list',
        name: '任务列表',
        description: '创建可勾选的任务列表',
        syntax: '- [ ] 未完成任务\n- [x] 已完成任务',
        example: '- [ ] 学习 Markdown\n- [x] 完成项目\n- [ ] 写文档',
        tips: '使用 [x] 表示完成，[ ] 表示未完成',
      },
    ],
  },
  {
    id: 'links-images',
    title: '链接和图片',
    items: [
      {
        id: 'link',
        name: '链接',
        description: '创建超链接',
        syntax: '[链接文本](https://example.com)\n[带标题的链接](https://example.com "提示文字")',
        example: '[访问百度](https://www.baidu.com)\n[带提示的链接](https://example.com "点击访问")',
        tips: '链接会在新标签页打开',
      },
      {
        id: 'image',
        name: '图片',
        description: '插入图片',
        syntax: '![图片描述](图片URL)\n![带标题的图片](图片URL "图片标题")',
        example: '![示例图片](https://example.com/image.jpg)',
        tips: '可以使用工具栏上传图片，或使用图床功能',
      },
      {
        id: 'reference-link',
        name: '引用式链接',
        description: '使用引用方式创建链接，适合重复使用',
        syntax: '[链接文本][引用ID]\n\n[引用ID]: https://example.com "可选标题"',
        example: '[百度][1] 和 [谷歌][2]\n\n[1]: https://www.baidu.com\n[2]: https://www.google.com',
        tips: '适合在文档中多次引用同一链接',
      },
    ],
  },
  {
    id: 'code',
    title: '代码',
    items: [
      {
        id: 'code-block',
        name: '代码块',
        description: '创建多行代码块',
        syntax: '```\n代码内容\n```',
        example: '```\nfunction hello() {\n  console.log("Hello World");\n}\n```',
        tips: '代码块会保留格式和缩进',
      },
      {
        id: 'syntax-highlight',
        name: '语法高亮',
        description: '指定语言进行语法高亮',
        syntax: '```javascript\n代码内容\n```',
        example: '```javascript\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n```',
        tips: '支持多种语言：javascript, python, java, cpp, html, css 等',
      },
      {
        id: 'code-fence',
        name: '代码围栏',
        description: '使用三个反引号创建代码块',
        syntax: '```\n代码\n```',
        example: '```\nconst x = 10;\nconsole.log(x);\n```',
        tips: '可以在代码块前后添加空行，更美观',
      },
    ],
  },
  {
    id: 'quotes',
    title: '引用',
    items: [
      {
        id: 'blockquote',
        name: '引用块',
        description: '使用 > 创建引用',
        syntax: '> 这是引用内容',
        example: '> 这是一段重要的引用内容\n> 可以跨越多行',
        tips: '引用常用于标注重要信息或引用他人话语',
      },
      {
        id: 'nested-quote',
        name: '嵌套引用',
        description: '在引用中嵌套引用',
        syntax: '> 第一层引用\n>> 第二层引用\n>>> 第三层引用',
        example: '> 原文内容\n>> 对原文的评论\n>>> 对评论的回复',
        tips: '可以多层嵌套，但建议不超过3层',
      },
      {
        id: 'quote-with-format',
        name: '引用中的格式',
        description: '在引用中使用其他格式',
        syntax: '> 这是 **粗体** 和 *斜体*\n> 还有 `代码`',
        example: '> 这是一段包含 **粗体**、*斜体* 和 `代码` 的引用',
        tips: '引用中可以包含所有 Markdown 格式',
      },
    ],
  },
  {
    id: 'tables',
    title: '表格',
    items: [
      {
        id: 'basic-table',
        name: '基础表格',
        description: '使用 | 和 - 创建表格',
        syntax: '| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 数据1 | 数据2 | 数据3 |',
        example: '| 姓名 | 年龄 | 城市 |\n|------|------|------|\n| 张三 | 25 | 北京 |\n| 李四 | 30 | 上海 |',
        tips: '第二行用于分隔表头和内容，至少需要三个 -',
      },
      {
        id: 'aligned-table',
        name: '对齐表格',
        description: '控制表格列的对齐方式',
        syntax: '| 左对齐 | 居中 | 右对齐 |\n|:-------|:----:|-------:|\n| 左 | 中 | 右 |',
        example: '| 左对齐 | 居中 | 右对齐 |\n|:-------|:----:|-------:|\n| 文本 | 文本 | 数字 |',
        tips: ':--- 左对齐，:---: 居中，---: 右对齐',
      },
      {
        id: 'table-format',
        name: '表格中的格式',
        description: '在表格中使用格式',
        syntax: '| 列1 | 列2 |\n|-----|-----|\n| **粗体** | *斜体* |',
        example: '| 格式 | 示例 |\n|------|------|\n| **粗体** | **重要** |\n| *斜体* | *强调* |\n| `代码` | `code` |',
        tips: '表格中可以包含链接、代码等格式',
      },
    ],
  },
  {
    id: 'advanced',
    title: '高级语法',
    items: [
      {
        id: 'math-inline',
        name: '行内数学公式',
        description: '使用 $ 包裹数学公式',
        syntax: '这是行内公式 $E = mc^2$ 在文本中',
        example: '质能方程：$E = mc^2$\n勾股定理：$a^2 + b^2 = c^2$',
        tips: '适合在段落中插入简单公式',
      },
      {
        id: 'math-block',
        name: '块级数学公式',
        description: '使用 $$ 创建独立公式块',
        syntax: '$$\n公式内容\n$$',
        example: '$$\n\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}\n$$',
        tips: '适合显示复杂公式，会居中显示',
      },
      {
        id: 'html-tags',
        name: 'HTML 标签',
        description: '直接使用 HTML 标签',
        syntax: '<div>HTML 内容</div>',
        example: '<div style="color: red;">红色文本</div>\n<strong>粗体</strong>',
        tips: '支持所有 HTML 标签，但要注意安全性',
      },
      {
        id: 'video',
        name: '视频',
        description: '使用 HTML video 标签插入视频',
        syntax: '<video src="视频URL" controls></video>',
        example: '<video src="https://example.com/video.mp4" controls></video>',
        tips: 'controls 属性显示播放控件',
      },
      {
        id: 'audio',
        name: '音频',
        description: '使用 HTML audio 标签插入音频',
        syntax: '<audio src="音频URL" controls></audio>',
        example: '<audio src="https://example.com/audio.mp3" controls></audio>',
        tips: 'controls 属性显示播放控件',
      },
      {
        id: 'footnote',
        name: '脚注',
        description: '创建脚注引用',
        syntax: '文本[^1]\n\n[^1]: 脚注内容',
        example: '这是一段文字[^note1]\n\n[^note1]: 这是脚注的详细说明',
        tips: '脚注会在文档底部显示',
      },
      {
        id: 'definition-list',
        name: '定义列表',
        description: '创建术语定义列表',
        syntax: '术语1\n: 定义1\n\n术语2\n: 定义2',
        example: 'Markdown\n: 一种轻量级标记语言\n\nHTML\n: 超文本标记语言',
        tips: '适合创建词汇表或术语表',
      },
      {
        id: 'emoji',
        name: 'Emoji',
        description: '使用 Emoji 表情',
        syntax: ':emoji_name:',
        example: ':smile: :heart: :thumbsup:',
        tips: '部分编辑器支持，如 :smile: 显示 😊',
      },
    ],
  },
  {
    id: 'formatting',
    title: '格式控制',
    items: [
      {
        id: 'line-break',
        name: '换行',
        description: '在行末添加两个空格后回车',
        syntax: '第一行  \n第二行',
        example: '这是第一行  \n这是第二行',
        tips: '两个空格 + 回车才能换行，否则会合并',
      },
      {
        id: 'horizontal-rule',
        name: '分隔线',
        description: '使用三个或更多符号创建分隔线',
        syntax: '---\n或者\n***\n或者\n___',
        example: '---',
        tips: '至少需要三个符号，推荐使用 ---',
      },
      {
        id: 'escape',
        name: '转义字符',
        description: '使用反斜杠转义特殊字符',
        syntax: '\\* 不会变成斜体\n\\# 不会变成标题',
        example: '\\*这是普通文本\\*\n\\#这不是标题',
        tips: '反斜杠可以转义所有 Markdown 特殊字符',
      },
      {
        id: 'hard-break',
        name: '强制换行',
        description: '使用 HTML br 标签强制换行',
        syntax: '第一行<br/>第二行',
        example: '第一行<br/>第二行',
        tips: '比两个空格更可靠',
      },
    ],
  },
];

export default function MarkdownGuidePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('basic');
  const [selectedItem, setSelectedItem] = useState<string>('headings');

  const currentCategory = markdownCategories.find(cat => cat.id === selectedCategory);
  const currentItem = currentCategory?.items.find(item => item.id === selectedItem);

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
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* 头部 */}
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Book className="w-8 h-8 text-purple-600" />
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    Markdown 完整指南
                  </h1>
                  <p className="text-slate-600 mt-1">
                    从基础到高级，全面掌握 Markdown 语法
                  </p>
                </div>
              </div>
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                返回上传
              </Link>
            </div>
          </div>

          <div className="flex" style={{ minHeight: 'calc(100vh - 300px)' }}>
            {/* 侧边栏导航 */}
            <aside className="w-64 border-r border-slate-200 bg-slate-50 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <nav className="p-4 space-y-2">
                {markdownCategories.map((category) => (
                  <div key={category.id} className="mb-4">
                    <button
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setSelectedItem(category.items[0].id);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors font-medium ${
                        selectedCategory === category.id
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {category.title}
                    </button>
                    {selectedCategory === category.id && (
                      <div className="mt-2 ml-4 space-y-1">
                        {category.items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setSelectedItem(item.id)}
                            className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                              selectedItem === item.id
                                ? 'bg-purple-100 text-purple-700 font-medium'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </aside>

            {/* 主内容区 */}
            <main className="flex-1 overflow-y-auto p-8" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {currentItem ? (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">
                      {currentItem.name}
                    </h2>
                    <p className="text-lg text-slate-600 mb-4">
                      {currentItem.description}
                    </p>
                  </div>

                  {/* 语法示例 */}
                  <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      语法格式
                    </h3>
                    <pre className="bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto">
                      <code>{currentItem.syntax}</code>
                    </pre>
                  </div>

                  {/* 效果展示 */}
                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      效果预览
                    </h3>
                    <div className="prose prose-slate max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex, rehypeRaw, rehypeHighlight]}
                        components={{
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
                        }}
                      >
                        {currentItem.example}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {/* 使用技巧 */}
                  {currentItem.tips && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h3 className="text-sm font-semibold text-blue-900 mb-2">
                        💡 使用技巧
                      </h3>
                      <p className="text-sm text-blue-700">
                        {currentItem.tips}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500">请从左侧选择要学习的内容</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
