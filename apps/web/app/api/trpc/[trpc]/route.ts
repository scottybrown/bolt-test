import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@repo/api';
import { verifyAuth0Token } from '@repo/api/auth';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    async createContext() {
      const authHeader = req.headers.get('authorization');
      if (!authHeader) {
        return { auth: null };
      }

      try {
        const token = authHeader.split(' ')[1];
        const payload = await verifyAuth0Token(token);
        return {
          auth: {
            userId: payload.sub as string,
            email: payload.email as string,
          },
        };
      } catch {
        return { auth: null };
      }
    },
  });

export { handler as GET, handler as POST };