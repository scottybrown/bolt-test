'use client';

import { useState } from 'react';
import { trpc } from '../providers';

interface PostFormProps {
  initialData?: {
    id: string;
    title: string;
    content: string;
  };
  onSuccess?: () => void;
}

export function PostForm({ initialData, onSuccess }: PostFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? '');
  const [content, setContent] = useState(initialData?.content ?? '');

  const createPost = trpc.createPost.useMutation({
    onSuccess: () => {
      setTitle('');
      setContent('');
      onSuccess?.();
    },
  });

  const updatePost = trpc.updatePost.useMutation({
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (initialData) {
      await updatePost.mutate({
        id: initialData.id,
        title,
        content,
      });
    } else {
      await createPost.mutate({
        title,
        content,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        disabled={createPost.isLoading || updatePost.isLoading}
      >
        {initialData ? 'Update Post' : 'Create Post'}
      </button>
    </form>
  );
}