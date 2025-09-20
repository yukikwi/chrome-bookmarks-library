import "dotenv/config";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { createContext } from "./lib/context";
import { appRouter } from "./routers/index";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { auth } from "./lib/auth";
import z from "zod";
import { bookmarksToJSON } from "bookmarks-to-json";
import { db } from "./db";
import { book } from "./db/schema";
import type { Bookmark } from "./types/bookmark";
import { getAllBookmarks } from "./lib/bookmark";

const app = new Elysia()
	.use(
		cors({
			origin: process.env.CORS_ORIGIN || "",
			methods: ["GET", "POST", "OPTIONS"],
			allowedHeaders: ["Content-Type", "Authorization"],
			credentials: true,
		}),
	)
	.all("/api/auth/*", async (context) => {
		const { request } = context;
		if (["POST", "GET"].includes(request.method)) {
			return auth.handler(request);
		}
		return context.set.status = 405;
	})
	.all("/trpc/*", async (context) => {
		const res = await fetchRequestHandler({
			endpoint: "/trpc",
			router: appRouter,
			req: context.request,
			createContext: () => createContext({ context }),
		});
		return res;
	})
	.post("/import-bookmarks", async ({body}) => {
		const {domains, file} = body;
		const parsedDomains = JSON.parse(domains)
		const parsedBookmarks = bookmarksToJSON(await file.text(), {
			stringify: false
		})

		const bookmarksInAnyFolder = getAllBookmarks(parsedBookmarks)
		const insertValues = bookmarksInAnyFolder.filter((bookmark: Bookmark) => {
			return parsedDomains.includes(new URL(bookmark.url).hostname)
		}).map((bookmark: Bookmark) => {
			return {
				name: bookmark.title !== ''? bookmark.title : bookmark.url,
				createdAt: new Date(bookmark.addDate),
				updatedAt: new Date(bookmark.addDate),
				url: bookmark.url,
				hostname: new URL(bookmark.url).hostname,
			}
		})
		const insertResult = await db.insert(book).values(insertValues)
		.onConflictDoNothing({ target: book.url });

		return {
			inserted: insertResult.rowCount,
		}
	}, {
		body: z.object({
			domains: z.string(),
			file: z.instanceof(File)
		})
	})
	.get("/", () => "OK")
	.listen(3000, () => {
		console.log("Server is running on http://localhost:3000");
	});
