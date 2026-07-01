import {
  pgTable,
  uuid,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";

// Catalog items (theme: books)
export const items = pgTable("items", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// user <-> item favorites
export const favorites = pgTable(
  "favorites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    itemId: uuid("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    // one item cannot be favorited twice by the same user
    uniqueIndex("favorites_user_item_unique").on(table.userId, table.itemId),
  ],
);

export const itemsRelations = relations(items, ({ many }) => ({
  favorites: many(favorites),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  item: one(items, {
    fields: [favorites.itemId],
    references: [items.id],
  }),
  user: one(user, {
    fields: [favorites.userId],
    references: [user.id],
  }),
}));

export type Item = typeof items.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;

// re-export auth tables so a single schema object covers everything
export * from "./auth-schema";
