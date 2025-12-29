import {
	pgTable,
	text,
	integer,
	timestamp,
	uuid,
	boolean,
	numeric,
	bigint,
	jsonb
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const profiles = pgTable('profiles', {
	id: uuid('id').primaryKey(),
	slug: text('slug').notNull().unique(),
	restaurant_name: text('restaurant_name').notNull(),
	theme_color: text('theme_color').default('orange'),
	address: text('address'),
	phone: text('phone'),
	logo_url: text('logo_url'),
	description: text('description'),
	instagram_url: text('instagram_url'),
	facebook_url: text('facebook_url'),
	whatsapp_number: text('whatsapp_number'),
	website_url: text('website_url'),
	opening_hours: jsonb('opening_hours'),
	created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const categories = pgTable('categories', {
	id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
	restaurant_id: uuid('restaurant_id').references(() => profiles.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	sort_order: integer('sort_order').default(0),
	created_at: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const dishes = pgTable('dishes', {
	id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
	restaurant_id: uuid('restaurant_id').references(() => profiles.id, { onDelete: 'cascade' }),
	category_id: bigint('category_id', { mode: 'number' }).references(() => categories.id, {
		onDelete: 'cascade'
	}),
	name: text('name').notNull(),
	description: text('description'),
	price: numeric('price', { precision: 10, scale: 2 }).notNull(),
	image_url: text('image_url'),
	is_available: boolean('is_available').default(true),
	allergens: text('allergens').array().default([]),
	created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const allergens = pgTable('allergens', {
	id: text('id').primaryKey(),
	number: integer('number').notNull().unique(),
	icon: text('icon').notNull(),
	name: text('name'),
	description: text('description'),
	created_at: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const profilesRelations = relations(profiles, ({ many }) => ({
	categories: many(categories),
	dishes: many(dishes)
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
	profile: one(profiles, {
		fields: [categories.restaurant_id],
		references: [profiles.id]
	}),
	dishes: many(dishes)
}));

export const dishesRelations = relations(dishes, ({ one }) => ({
	category: one(categories, {
		fields: [dishes.category_id],
		references: [categories.id]
	}),
	profile: one(profiles, {
		fields: [dishes.restaurant_id],
		references: [profiles.id]
	})
}));

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export type Dish = typeof dishes.$inferSelect;
export type InsertDish = typeof dishes.$inferInsert;

export type Allergen = typeof allergens.$inferSelect;
export type InsertAllergen = typeof allergens.$inferInsert;
