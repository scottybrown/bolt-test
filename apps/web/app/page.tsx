'use client';

import { useAuth0 } from '@auth0/auth0-react';
import { trpc } from './providers';
import { PostForm } from './components/post-form';
import { PostList } from './components/post-list';

export default function Home() {
  const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();
  const utils = trpc.useContext();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {isAuthenticated ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}!</h1>
              <button
                onClick={() => logout()}
                className="mt-4 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Log Out
              </button>
              <div className="mt-8">
                <h2 className="text-2xl font-semibold">Create a New Post</h2>
                <div className="mt-4">
                  <PostForm onSuccess={() => utils.getPosts.invalidate()} />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">Welcome to the Blog</h1>
              <button
                onClick={() => loginWithRedirect()}
                className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
              >
                Log In to Post
              </button>
            </div>
          )}
        </div>
        <div className="mt-12">
          <h2 className="text-2xl font-semibold">Recent Posts</h2>
          <div className="mt-6">
            <PostList />
          </div>
        </div>
      </div>
    </div>
  );
}