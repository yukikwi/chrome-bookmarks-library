import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const book = pgTable("book", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	url: text("url").notNull().unique(),
	hostname: text("hostname").notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});
