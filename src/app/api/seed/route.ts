import { db } from '@/db'
import { ingredients, recipes, recipeIngredients, indirectCosts, orders, orderItems } from '@/db/schema'
import { sql } from 'drizzle-orm'
import { calcCostPerUnit } from '@/lib/calculations'

export async function GET() {
  try {
    // Create tables first
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        unit TEXT NOT NULL,
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
        recipe_id INTEGER NOT NULL,
        ingredient_id INTEGER,
        sub_recipe_id INTEGER,
        quantity REAL NOT NULL,
        deleted_at TEXT
      )
    `)

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS indirect_costs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
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
        delivery_type TEXT NOT NULL,
        notes TEXT,
        status TEXT DEFAULT 'Pendente',
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
        order_id INTEGER NOT NULL,
        recipe_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        unit_price REAL NOT NULL,
        deleted_at TEXT
      )
    `)

    // Insert ingredients
    const insertedIngredients = await db.insert(ingredients).values([
      { name: 'Farinha de trigo', unit: 'kg', purchasePrice: 5.90, purchaseQuantity: 1, costPerUnit: calcCostPerUnit(5.90, 1) },
      { name: 'Açúcar refinado', unit: 'kg', purchasePrice: 4.50, purchaseQuantity: 1, costPerUnit: calcCostPerUnit(4.50, 1) },
      { name: 'Manteiga sem sal', unit: 'kg', purchasePrice: 35.00, purchaseQuantity: 0.5, costPerUnit: calcCostPerUnit(35.00, 0.5) },
      { name: 'Ovos', unit: 'unidade', purchasePrice: 0.80, purchaseQuantity: 1, costPerUnit: calcCostPerUnit(0.80, 1) },
      { name: 'Leite integral', unit: 'L', purchasePrice: 6.50, purchaseQuantity: 1, costPerUnit: calcCostPerUnit(6.50, 1) },
      { name: 'Chocolate em pó 50%', unit: 'kg', purchasePrice: 28.00, purchaseQuantity: 0.4, costPerUnit: calcCostPerUnit(28.00, 0.4) },
      { name: 'Cream cheese', unit: 'kg', purchasePrice: 22.00, purchaseQuantity: 0.3, costPerUnit: calcCostPerUnit(22.00, 0.3) },
      { name: 'Creme de leite', unit: 'L', purchasePrice: 8.00, purchaseQuantity: 0.2, costPerUnit: calcCostPerUnit(8.00, 0.2) },
      { name: 'Fermento em pó', unit: 'kg', purchasePrice: 12.00, purchaseQuantity: 0.1, costPerUnit: calcCostPerUnit(12.00, 0.1) },
      { name: 'Essência de baunilha', unit: 'L', purchasePrice: 18.00, purchaseQuantity: 0.03, costPerUnit: calcCostPerUnit(18.00, 0.03) },
      { name: 'Leite condensado', unit: 'kg', purchasePrice: 7.50, purchaseQuantity: 0.395, costPerUnit: calcCostPerUnit(7.50, 0.395) },
      { name: 'Biscoito maisena', unit: 'kg', purchasePrice: 9.00, purchaseQuantity: 0.4, costPerUnit: calcCostPerUnit(9.00, 0.4) },
      { name: 'Cacau em pó', unit: 'kg', purchasePrice: 45.00, purchaseQuantity: 0.2, costPerUnit: calcCostPerUnit(45.00, 0.2) },
    ]).returning()

    const findIngredient = (name: string) => insertedIngredients.find(i => i.name === name)!

    // Insert base sub-recipe
    const [baseRecipe] = await db.insert(recipes).values([
      { name: 'Base de Cheesecake', yieldQuantity: 1, yieldUnit: 'base', totalCost: 0 },
    ]).returning()

    await db.insert(recipeIngredients).values([
      { recipeId: baseRecipe.id, ingredientId: findIngredient('Biscoito maisena').id, quantity: 0.2 },
      { recipeId: baseRecipe.id, ingredientId: findIngredient('Manteiga sem sal').id, quantity: 0.08 },
    ])

    const baseCost = (0.2 * findIngredient('Biscoito maisena').costPerUnit) + (0.08 * findIngredient('Manteiga sem sal').costPerUnit)
    await db.run(sql`UPDATE recipes SET total_cost = ${baseCost} WHERE id = ${baseRecipe.id}`)

    // Insert main recipes
    const mainRecipesList = await db.insert(recipes).values([
      { name: 'Bolo de Chocolate', yieldQuantity: 8, yieldUnit: 'porções', totalCost: 0 },
      { name: 'Brigadeiro', yieldQuantity: 50, yieldUnit: 'unidades', totalCost: 0 },
      { name: 'Cheesecake', yieldQuantity: 10, yieldUnit: 'porções', totalCost: 0 },
    ]).returning()

    const boloRecipe = mainRecipesList.find(r => r.name === 'Bolo de Chocolate')!
    const brigRecipe = mainRecipesList.find(r => r.name === 'Brigadeiro')!
    const cheesecakeRecipe = mainRecipesList.find(r => r.name === 'Cheesecake')!

    // Bolo ingredients
    await db.insert(recipeIngredients).values([
      { recipeId: boloRecipe.id, ingredientId: findIngredient('Farinha de trigo').id, quantity: 0.3 },
      { recipeId: boloRecipe.id, ingredientId: findIngredient('Açúcar refinado').id, quantity: 0.25 },
      { recipeId: boloRecipe.id, ingredientId: findIngredient('Manteiga sem sal').id, quantity: 0.1 },
      { recipeId: boloRecipe.id, ingredientId: findIngredient('Ovos').id, quantity: 3 },
      { recipeId: boloRecipe.id, ingredientId: findIngredient('Leite integral').id, quantity: 0.2 },
      { recipeId: boloRecipe.id, ingredientId: findIngredient('Chocolate em pó 50%').id, quantity: 0.05 },
      { recipeId: boloRecipe.id, ingredientId: findIngredient('Fermento em pó').id, quantity: 0.01 },
      { recipeId: boloRecipe.id, ingredientId: findIngredient('Essência de baunilha').id, quantity: 0.005 },
      { recipeId: boloRecipe.id, ingredientId: findIngredient('Cacau em pó').id, quantity: 0.03 },
    ])

    const boloCost =
      0.3 * findIngredient('Farinha de trigo').costPerUnit +
      0.25 * findIngredient('Açúcar refinado').costPerUnit +
      0.1 * findIngredient('Manteiga sem sal').costPerUnit +
      3 * findIngredient('Ovos').costPerUnit +
      0.2 * findIngredient('Leite integral').costPerUnit +
      0.05 * findIngredient('Chocolate em pó 50%').costPerUnit +
      0.01 * findIngredient('Fermento em pó').costPerUnit +
      0.005 * findIngredient('Essência de baunilha').costPerUnit +
      0.03 * findIngredient('Cacau em pó').costPerUnit

    await db.run(sql`UPDATE recipes SET total_cost = ${boloCost} WHERE id = ${boloRecipe.id}`)

    // Brigadeiro ingredients
    await db.insert(recipeIngredients).values([
      { recipeId: brigRecipe.id, ingredientId: findIngredient('Leite condensado').id, quantity: 0.395 },
      { recipeId: brigRecipe.id, ingredientId: findIngredient('Cacau em pó').id, quantity: 0.04 },
      { recipeId: brigRecipe.id, ingredientId: findIngredient('Manteiga sem sal').id, quantity: 0.02 },
    ])

    const brigCost =
      0.395 * findIngredient('Leite condensado').costPerUnit +
      0.04 * findIngredient('Cacau em pó').costPerUnit +
      0.02 * findIngredient('Manteiga sem sal').costPerUnit

    await db.run(sql`UPDATE recipes SET total_cost = ${brigCost} WHERE id = ${brigRecipe.id}`)

    // Cheesecake ingredients
    await db.insert(recipeIngredients).values([
      { recipeId: cheesecakeRecipe.id, subRecipeId: baseRecipe.id, quantity: 1 },
      { recipeId: cheesecakeRecipe.id, ingredientId: findIngredient('Cream cheese').id, quantity: 0.6 },
      { recipeId: cheesecakeRecipe.id, ingredientId: findIngredient('Açúcar refinado').id, quantity: 0.15 },
      { recipeId: cheesecakeRecipe.id, ingredientId: findIngredient('Ovos').id, quantity: 3 },
      { recipeId: cheesecakeRecipe.id, ingredientId: findIngredient('Creme de leite').id, quantity: 0.1 },
      { recipeId: cheesecakeRecipe.id, ingredientId: findIngredient('Essência de baunilha').id, quantity: 0.01 },
    ])

    const cheesecakeCost =
      baseCost +
      0.6 * findIngredient('Cream cheese').costPerUnit +
      0.15 * findIngredient('Açúcar refinado').costPerUnit +
      3 * findIngredient('Ovos').costPerUnit +
      0.1 * findIngredient('Creme de leite').costPerUnit +
      0.01 * findIngredient('Essência de baunilha').costPerUnit

    await db.run(sql`UPDATE recipes SET total_cost = ${cheesecakeCost} WHERE id = ${cheesecakeRecipe.id}`)

    // Insert indirect costs
    await db.insert(indirectCosts).values([
      { name: 'Luz e Gás', type: 'fixo_mensal', value: 150.00 },
      { name: 'Embalagens', type: 'por_unidade', value: 8.00 },
      { name: 'Gás de cozinha', type: 'fixo_mensal', value: 80.00 },
    ])

    // Insert sample orders
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 5)

    const sampleOrders = await db.insert(orders).values([
      {
        customerName: 'Maria Silva',
        whatsapp: '11999887766',
        address: 'Rua das Flores, 123 - São Paulo',
        deliveryDatetime: tomorrow.toISOString(),
        deliveryType: 'entrega',
        notes: 'Tocar campainha duas vezes',
        status: 'Em produção',
        signalAmount: 50.00,
        totalAmount: 150.00,
      },
      {
        customerName: 'João Souza',
        whatsapp: '11988776655',
        address: null,
        deliveryDatetime: nextWeek.toISOString(),
        deliveryType: 'retirada',
        notes: 'Retirar pela manhã',
        status: 'Pendente',
        signalAmount: 0,
        totalAmount: 89.50,
      },
    ]).returning()

    await db.insert(orderItems).values([
      { orderId: sampleOrders[0].id, recipeId: boloRecipe.id, quantity: 2, unitPrice: 65.00 },
      { orderId: sampleOrders[0].id, recipeId: brigRecipe.id, quantity: 20, unitPrice: 1.00 },
      { orderId: sampleOrders[1].id, recipeId: cheesecakeRecipe.id, quantity: 1, unitPrice: 89.50 },
    ])

    return Response.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        ingredients: insertedIngredients.length,
        recipes: 1 + mainRecipesList.length,
        indirectCosts: 3,
        orders: sampleOrders.length,
      },
    })
  } catch (error) {
    console.error('Seed error:', error)
    return Response.json({ error: 'Failed to seed database', details: String(error) }, { status: 500 })
  }
}
