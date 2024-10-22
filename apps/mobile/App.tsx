import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, SafeAreaView } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useState, useEffect } from 'react';
import { trpc } from './utils/trpc';
import { PostForm } from './components/PostForm';
import { PostList } from './components/PostList';

WebBrowser.maybeCompleteAuthSession();

const queryClient = new QueryClient();

const useProxy = true;
const redirectUri = AuthSession.makeRedirectUri({ useProxy });

const config = {
  clientId: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID || '',
  domain: process.env.EXPO_PUBLIC_AUTH0_DOMAIN || '',
  audience: process.env.EXPO_PUBLIC_AUTH0_AUDIENCE || '',
};

const discovery = {
  authorizationEndpoint: `https://${config.domain}/authorize`,
  tokenEndpoint: `https://${config.domain}/oauth/token`,
};

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [request, result, promptAsync] = AuthSession.useAuthRequest(
    {
      redirectUri,
      clientId: config.clientId,
      responseType: 'token',
      scopes: ['openid', 'profile', 'email'],
      extraParams: {
        audience: config.audience,
      },
    },
    discovery
  );

  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: 'http://localhost:3000/api/trpc',
        headers: token ? {
          Authorization: `Bearer ${token}`,
        } : undefined,
      }),
    ],
    transformer: superjson,
  });

  useEffect(() => {
    if (result?.type === 'success') {
      setToken(result.params.access_token);
    }
  }, [result]);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaView style={styles.container}>
          {token ? (
            <>
              <Text style={styles.header}>Welcome!</Text>
              <Button title="Logout" onPress={() => setToken(null)} />
              <PostForm onSuccess={() => queryClient.invalidateQueries()} />
              <PostList />
            </>
          ) : (
            <View style={styles.center}>
              <Text style={styles.header}>Welcome to the Blog</Text>
              <Button
                title="Login with Auth0"
                onPress={() => promptAsync({ useProxy })}
              />
            </View>
          )}
          <StatusBar style="auto" />
        </SafeAreaView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
});