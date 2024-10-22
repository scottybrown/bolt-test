'use client';

import { trpc } from '../providers';
import { useAuth0 } from '@auth0/auth0-react';

export function PostList() {
  const { user } = useAuth0();
  const utils = trpc.useContext();
  const { data: posts, isLoading } = trpc.getPosts.useQuery();
  const deletePost = trpc.deletePost.useMutation({
    onSuccess: () => {
      utils.getPosts.invalidate();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (!posts) return <div>No posts found</div>;

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div key={post.id} className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold">{post.title}</h2>
          <p className="mt-2 text-gray-600">{post.content}</p>
          <div className="mt-4 text-sm text-gray-500">
            By {post.author.name || post.author.email}
          </div>
          {user?.email === post.author.email && (
            <button
              onClick={() => deletePost.mutate({ id: post.id })}
              className="mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
}