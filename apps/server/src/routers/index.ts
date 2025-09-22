import { asc, gt, sql } from "drizzle-orm";
import z from "zod";
import { db } from "../db";
import { book } from "../db/schema";
import { protectedProcedure, publicProcedure, router } from "../lib/trpc";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  privateData: protectedProcedure.query(({ ctx }) => {
    return {
      message: "This is private",
      user: ctx.session.user,
    };
  }),
  getBooks: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(), // <-- "cursor" needs to exist, but can be any type
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;
      const items = await db
        .select()
        .from(book)
        .where(cursor ? gt(book.id, cursor) : undefined) // if cursor is provided, get rows after it
        .limit(limit + 1) // the number of rows to return
        .orderBy(asc(book.id)); // ordering
      let nextCursor: typeof cursor | undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }
      return {
        items,
        nextCursor,
      };
    }),
  getRandomBook: protectedProcedure.mutation(async ({ ctx }) => {
    const randomBook = await db.query.book.findFirst({
      orderBy: [sql`random()`],
    });
    return randomBook;
  }),
});
export type AppRouter = typeof appRouter;
