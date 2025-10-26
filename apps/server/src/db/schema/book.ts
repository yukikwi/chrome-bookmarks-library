import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const book = pgTable("book", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull().unique(),
  hostname: text("hostname").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const bookRelations = relations(book, ({ many }) => ({
  openHistories: many(openHistory),
}));

export const openHistory = pgTable("open_history", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id")
    .references(() => book.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const openHistoryRelations = relations(openHistory, ({ one }) => ({
  book: one(book, {
    fields: [openHistory.bookId],
    references: [book.id],
  }),
}));
