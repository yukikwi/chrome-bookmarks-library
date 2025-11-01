import { and, asc, count, eq, gt, ilike, or, sql } from "drizzle-orm";
import z from "zod";
import { db } from "../db";
import { book, openHistory } from "../db/schema";
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
  getHostnames: protectedProcedure.query(async () => {
    const hostnames = await db
      .selectDistinct({ hostname: book.hostname })
      .from(book)
      .orderBy(asc(book.hostname));
    return hostnames.map((h) => h.hostname);
  }),
  getBooks: protectedProcedure
    .input(
      z.object({
        keyword: z.string().optional(),
        hostnameFilter: z.string().optional(),
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(), // <-- "cursor" needs to exist, but can be any type
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const keyword = input.keyword ?? "";
      const { cursor } = input;
      const items = await db
        .select()
        .from(book)
        .where(
          and(
            cursor ? gt(book.id, cursor) : undefined,
            or(
              ilike(book.name, `%${keyword}%`),
              ilike(book.hostname, `%${keyword}%`)
            ),
            input.hostnameFilter
              ? eq(book.hostname, input.hostnameFilter)
              : undefined
          )
        ) // if cursor is provided, get rows after it
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
  getRandomBook: protectedProcedure
    .input(
      z.object({
        keyword: z.string().optional(),
        hostnameFilter: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // const randomBook = await db.query.book.findFirst({
      //   orderBy: [sql`random()`],
      //   where: and(
      //     or(
      //       ilike(book.name, `%${input.keyword}%`),
      //       ilike(book.hostname, `%${input.keyword}%`)
      //     ),
      //     input.hostnameFilter
      //       ? eq(book.hostname, input.hostnameFilter)
      //       : undefined
      //   ),
      // });
      const totalOpens = await db.select({ count: count() }).from(openHistory);
      const randomBooks = await db
        .select({
          id: book.id,
          name: book.name,
          url: book.url,
          hostname: book.hostname,
          createdAt: book.createdAt,
          updatedAt: book.updatedAt,
          numberOfOpens: sql<number>`COUNT(${openHistory.id})`.as(
            "numberOfOpens"
          ),
        })
        .from(book)
        .leftJoin(openHistory, eq(book.id, openHistory.bookId))
        .where(
          and(
            or(
              ilike(book.name, `%${input.keyword}%`),
              ilike(book.hostname, `%${input.keyword}%`)
            ),
            input.hostnameFilter
              ? eq(book.hostname, input.hostnameFilter)
              : undefined
          )
        )
        .groupBy(book.id)
        .orderBy(
          sql`
            random() + (COUNT("open_history"."id") / ${totalOpens[0].count + 1
            }) ASC
          `
        )
        .limit(1);

      // add randomBook to recent searches table with timestamp
      if (randomBooks.length > 0) {
        await db.insert(openHistory).values({
          bookId: randomBooks[0].id,
          createdAt: new Date(),
        });
      }
      return randomBooks[0];
    }),
});
export type AppRouter = typeof appRouter;
