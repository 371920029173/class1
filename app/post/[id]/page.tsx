import { params } from 'next/navigation';
import PostClient from './PostClient';

// 静态导出需要 generateStaticParams
// 返回空数组，因为内容是动态的，无法在构建时预知所有 id
export async function generateStaticParams() {
  return [];
}

// 允许动态参数
export const dynamicParams = true;

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  return <PostClient id={id} />;
}

