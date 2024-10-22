import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { trpc } from '../utils/trpc';

export function PostList() {
  const utils = trpc.useContext();
  const { data: posts, isLoading } = trpc.getPosts.useQuery();
  const deletePost = trpc.deletePost.useMutation({
    onSuccess: () => {
      utils.getPosts.invalidate();
    },
  });

  if (isLoading) return <Text>Loading...</Text>;
  if (!posts) return <Text>No posts found</Text>;

  return (
    <ScrollView style={styles.container}>
      {posts.map((post) => (
        <View key={post.id} style={styles.post}>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.content}>{post.content}</Text>
          <Text style={styles.author}>
            By {post.author.name || post.author.email}
          </Text>
          <Button
            title="Delete"
            onPress={() => deletePost.mutate({ id: post.id })}
            color="#ff4444"
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  post: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  content: {
    marginBottom: 8,
  },
  author: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
});