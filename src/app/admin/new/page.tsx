import type { Metadata } from 'next';
import { PostEditorForm } from '@/components/post-editor-form';

export const metadata: Metadata = {
  title: 'New Post',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewPostPage() {
  return <PostEditorForm mode="create" />;
}
