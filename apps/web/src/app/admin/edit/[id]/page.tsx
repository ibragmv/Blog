import type { Metadata } from 'next';
import { PostEditorForm } from '@/components/post-editor-form';

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: 'Edit Post',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  return <PostEditorForm mode="edit" postId={id} />;
}
