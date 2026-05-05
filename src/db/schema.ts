import { sql } from 'drizzle-orm'
import { integer, real, text, sqliteTable } from 'drizzle-orm/sqlite-core'

export const ingredients = sqliteTable('ingredients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  unit: text('unit', { enum: ['kg', 'L', 'unidade', 'cx'] }).notNull(),
  purchasePrice: real('purchase_price').notNull(),
  purchaseQuantity: real('purchase_quantity').notNull(),
  costPerUnit: real('cost_per_unit').notNull(),
  userId: integer('user_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  deletedAt: text('deleted_at'),
})

export const recipes = sqliteTable('recipes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  yieldQuantity: real('yield_quantity').notNull(),
  yieldUnit: text('yield_unit').notNull(),
  totalCost: real('total_cost').default(0),
  userId: integer('user_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  deletedAt: text('deleted_at'),
})

export const recipeIngredients = sqliteTable('recipe_ingredients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  recipeId: integer('recipe_id').notNull().references(() => recipes.id),
  ingredientId: integer('ingredient_id').references(() => ingredients.id),
  subRecipeId: integer('sub_recipe_id').references(() => recipes.id),
  quantity: real('quantity').notNull(),
  deletedAt: text('deleted_at'),
})

export const indirectCosts = sqliteTable('indirect_costs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: ['fixo_mensal', 'por_unidade'] }).notNull(),
  value: real('value').notNull(),
  userId: integer('user_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  deletedAt: text('deleted_at'),
})

export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  customerName: text('customer_name').notNull(),
  whatsapp: text('whatsapp'),
  address: text('address'),
  deliveryDatetime: text('delivery_datetime').notNull(),
  deliveryType: text('delivery_type', { enum: ['entrega', 'retirada'] }).notNull(),
  notes: text('notes'),
  status: text('status', { enum: ['Pendente', 'Em produção', 'Pronto', 'Entregue'] }).default('Pendente'),
  signalAmount: real('signal_amount').default(0),
  totalAmount: real('total_amount').default(0),
  userId: integer('user_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  deletedAt: text('deleted_at'),
})

export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id),
  recipeId: integer('recipe_id').notNull().references(() => recipes.id),
  quantity: real('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  deletedAt: text('deleted_at'),
})

export type Ingredient = typeof ingredients.$inferSelect
export type NewIngredient = typeof ingredients.$inferInsert
export type Recipe = typeof recipes.$inferSelect
export type NewRecipe = typeof recipes.$inferInsert
export type RecipeIngredient = typeof recipeIngredients.$inferSelect
export type NewRecipeIngredient = typeof recipeIngredients.$inferInsert
export type IndirectCost = typeof indirectCosts.$inferSelect
export type NewIndirectCost = typeof indirectCosts.$inferInsert
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert
