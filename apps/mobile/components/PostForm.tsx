import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import { trpc } from '../utils/trpc';

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

  const handleSubmit = async () => {
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
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
      />
      <TextInput
        style={[styles.input, styles.contentInput]}
        value={content}
        onChangeText={setContent}
        placeholder="Content"
        multiline
      />
      <Button
        title={initialData ? 'Update Post' : 'Create Post'}
        onPress={handleSubmit}
        disabled={createPost.isLoading || updatePost.isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  contentInput: {
    height: 100,
    textAlignVertical: 'top',
  },
});