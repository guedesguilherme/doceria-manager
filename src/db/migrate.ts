import { db } from './index'
import { sql } from 'drizzle-orm'

async function migrate() {
  console.log('Running migrations...')

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      unit TEXT NOT NULL CHECK(unit IN ('kg', 'L', 'unidade', 'cx')),
      purchase_price REAL NOT NULL,
      purchase_quantity REAL NOT NULL,
      cost_per_unit REAL NOT NULL,
      user_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      deleted_at TEXT
    )
  `)

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      yield_quantity REAL NOT NULL,
      yield_unit TEXT NOT NULL,
      total_cost REAL DEFAULT 0,
      user_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      deleted_at TEXT
    )
  `)

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL REFERENCES recipes(id),
      ingredient_id INTEGER REFERENCES ingredients(id),
      sub_recipe_id INTEGER REFERENCES recipes(id),
      quantity REAL NOT NULL,
      deleted_at TEXT
    )
  `)

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS indirect_costs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('fixo_mensal', 'por_unidade')),
      value REAL NOT NULL,
      user_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      deleted_at TEXT
    )
  `)

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      whatsapp TEXT,
      address TEXT,
      delivery_datetime TEXT NOT NULL,
      delivery_type TEXT NOT NULL CHECK(delivery_type IN ('entrega', 'retirada')),
      notes TEXT,
      status TEXT DEFAULT 'Pendente' CHECK(status IN ('Pendente', 'Em produção', 'Pronto', 'Entregue')),
      signal_amount REAL DEFAULT 0,
      total_amount REAL DEFAULT 0,
      user_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      deleted_at TEXT
    )
  `)

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id),
      recipe_id INTEGER NOT NULL REFERENCES recipes(id),
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      deleted_at TEXT
    )
  `)

  console.log('Migrations completed!')
}

migrate().catch(console.error)
