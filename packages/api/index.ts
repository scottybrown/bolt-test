import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { z } from 'zod';
import { prisma } from './db';
import { type AuthContext } from './auth';

const t = initTRPC.context<AuthContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.auth) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      auth: ctx.auth,
    },
  });
});

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return `Hello ${input.name}!`;
    }),
  
  getUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { email: ctx.auth.email },
      include: { posts: true },
    });
    return user;
  }),

  createUser: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await prisma.user.create({
      data: {
        email: ctx.auth.email,
      },
    });
    return user;
  }),

  // Post procedures
  getPosts: publicProcedure.query(async () => {
    return prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }),

  getPost: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return prisma.post.findUnique({
        where: { id: input.id },
        include: {
          author: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
    }),

  createPost: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      content: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUnique({
        where: { email: ctx.auth.email },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return prisma.post.create({
        data: {
          ...input,
          authorId: user.id,
        },
      });
    }),

  updatePost: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1),
      content: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const post = await prisma.post.findUnique({
        where: { id: input.id },
        include: { author: true },
      });

      if (!post || post.author.email !== ctx.auth.email) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to update this post',
        });
      }

      return prisma.post.update({
        where: { id: input.id },
        data: {
          title: input.title,
          content: input.content,
        },
      });
    }),

  deletePost: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await prisma.post.findUnique({
        where: { id: input.id },
        include: { author: true },
      });

      if (!post || post.author.email !== ctx.auth.email) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not authorized to delete this post',
        });
      }

      return prisma.post.delete({
        where: { id: input.id },
      });
    }),
});

export type AppRouter = typeof appRouter;