import { db } from './index'
import { ingredients, recipes, recipeIngredients, indirectCosts, orders, orderItems } from './schema'
import { eq } from 'drizzle-orm'

async function seed() {
  console.log('Seeding database...')

  // Insert ingredients
  const insertedIngredients = await db.insert(ingredients).values([
    { name: 'Farinha de trigo', unit: 'kg', purchasePrice: 5.90, purchaseQuantity: 1, costPerUnit: 5.90 },
    { name: 'Açúcar refinado', unit: 'kg', purchasePrice: 4.50, purchaseQuantity: 1, costPerUnit: 4.50 },
    { name: 'Manteiga sem sal', unit: 'kg', purchasePrice: 35.00, purchaseQuantity: 0.5, costPerUnit: 70.00 },
    { name: 'Ovos', unit: 'unidade', purchasePrice: 0.80, purchaseQuantity: 1, costPerUnit: 0.80 },
    { name: 'Leite integral', unit: 'L', purchasePrice: 6.50, purchaseQuantity: 1, costPerUnit: 6.50 },
    { name: 'Chocolate em pó 50%', unit: 'kg', purchasePrice: 28.00, purchaseQuantity: 0.4, costPerUnit: 70.00 },
    { name: 'Cream cheese', unit: 'kg', purchasePrice: 22.00, purchaseQuantity: 0.3, costPerUnit: 73.33 },
    { name: 'Creme de leite', unit: 'L', purchasePrice: 8.00, purchaseQuantity: 0.2, costPerUnit: 40.00 },
    { name: 'Fermento em pó', unit: 'kg', purchasePrice: 12.00, purchaseQuantity: 0.1, costPerUnit: 120.00 },
    { name: 'Essência de baunilha', unit: 'L', purchasePrice: 18.00, purchaseQuantity: 0.03, costPerUnit: 600.00 },
    { name: 'Leite condensado', unit: 'kg', purchasePrice: 7.50, purchaseQuantity: 0.395, costPerUnit: 18.99 },
    { name: 'Biscoito maisena', unit: 'kg', purchasePrice: 9.00, purchaseQuantity: 0.4, costPerUnit: 22.50 },
    { name: 'Cacau em pó', unit: 'kg', purchasePrice: 45.00, purchaseQuantity: 0.2, costPerUnit: 225.00 },
  ]).returning()

  // Insert sub-recipe first: Base de Cheesecake
  const baseRecipes = await db.insert(recipes).values([
    { name: 'Base de Cheesecake', yieldQuantity: 1, yieldUnit: 'base', totalCost: 0 },
  ]).returning()

  const baseId = baseRecipes[0].id

  const biscoitoId = insertedIngredients.find(i => i.name === 'Biscoito maisena')!.id
  const manteiraId = insertedIngredients.find(i => i.name === 'Manteiga sem sal')!.id
  const acucarId = insertedIngredients.find(i => i.name === 'Açúcar refinado')!.id
  const ovosId = insertedIngredients.find(i => i.name === 'Ovos')!.id
  const leiteId = insertedIngredients.find(i => i.name === 'Leite integral')!.id
  const chocolateId = insertedIngredients.find(i => i.name === 'Chocolate em pó 50%')!.id
  const creamCheeseId = insertedIngredients.find(i => i.name === 'Cream cheese')!.id
  const cremeLeiteId = insertedIngredients.find(i => i.name === 'Creme de leite')!.id
  const fermentoId = insertedIngredients.find(i => i.name === 'Fermento em pó')!.id
  const baunilhaId = insertedIngredients.find(i => i.name === 'Essência de baunilha')!.id
  const leiteCondId = insertedIngredients.find(i => i.name === 'Leite condensado')!.id
  const farinhaId = insertedIngredients.find(i => i.name === 'Farinha de trigo')!.id
  const cacauId = insertedIngredients.find(i => i.name === 'Cacau em pó')!.id

  await db.insert(recipeIngredients).values([
    { recipeId: baseId, ingredientId: biscoitoId, quantity: 0.2 },
    { recipeId: baseId, ingredientId: manteiraId, quantity: 0.08 },
  ])

  await db.update(recipes).set({ totalCost: 10.10 }).where(eq(recipes.id, baseId))

  const mainRecipes = await db.insert(recipes).values([
    { name: 'Bolo de Chocolate', yieldQuantity: 8, yieldUnit: 'porções', totalCost: 0 },
    { name: 'Brigadeiro', yieldQuantity: 50, yieldUnit: 'unidades', totalCost: 0 },
    { name: 'Cheesecake', yieldQuantity: 10, yieldUnit: 'porções', totalCost: 0 },
  ]).returning()

  const boloId = mainRecipes.find(r => r.name === 'Bolo de Chocolate')!.id
  const brigId = mainRecipes.find(r => r.name === 'Brigadeiro')!.id
  const cheesecakeId = mainRecipes.find(r => r.name === 'Cheesecake')!.id

  await db.insert(recipeIngredients).values([
    { recipeId: boloId, ingredientId: farinhaId, quantity: 0.3 },
    { recipeId: boloId, ingredientId: acucarId, quantity: 0.25 },
    { recipeId: boloId, ingredientId: manteiraId, quantity: 0.1 },
    { recipeId: boloId, ingredientId: ovosId, quantity: 3 },
    { recipeId: boloId, ingredientId: leiteId, quantity: 0.2 },
    { recipeId: boloId, ingredientId: chocolateId, quantity: 0.05 },
    { recipeId: boloId, ingredientId: fermentoId, quantity: 0.01 },
    { recipeId: boloId, ingredientId: baunilhaId, quantity: 0.005 },
    { recipeId: boloId, ingredientId: cacauId, quantity: 0.03 },
  ])

  await db.update(recipes).set({ totalCost: 28.05 }).where(eq(recipes.id, boloId))

  await db.insert(recipeIngredients).values([
    { recipeId: brigId, ingredientId: leiteCondId, quantity: 0.395 },
    { recipeId: brigId, ingredientId: cacauId, quantity: 0.04 },
    { recipeId: brigId, ingredientId: manteiraId, quantity: 0.02 },
  ])

  await db.update(recipes).set({ totalCost: 17.90 }).where(eq(recipes.id, brigId))

  await db.insert(recipeIngredients).values([
    { recipeId: cheesecakeId, subRecipeId: baseId, quantity: 1 },
    { recipeId: cheesecakeId, ingredientId: creamCheeseId, quantity: 0.6 },
    { recipeId: cheesecakeId, ingredientId: acucarId, quantity: 0.15 },
    { recipeId: cheesecakeId, ingredientId: ovosId, quantity: 3 },
    { recipeId: cheesecakeId, ingredientId: cremeLeiteId, quantity: 0.1 },
    { recipeId: cheesecakeId, ingredientId: baunilhaId, quantity: 0.01 },
  ])

  await db.update(recipes).set({ totalCost: 67.17 }).where(eq(recipes.id, cheesecakeId))

  await db.insert(indirectCosts).values([
    { name: 'Luz e Gás', type: 'fixo_mensal', value: 150.00 },
    { name: 'Embalagens', type: 'por_unidade', value: 8.00 },
    { name: 'Gás de cozinha', type: 'fixo_mensal', value: 80.00 },
  ])

  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(now)
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
    { orderId: sampleOrders[0].id, recipeId: boloId, quantity: 2, unitPrice: 65.00 },
    { orderId: sampleOrders[0].id, recipeId: brigId, quantity: 20, unitPrice: 1.00 },
    { orderId: sampleOrders[1].id, recipeId: cheesecakeId, quantity: 1, unitPrice: 89.50 },
  ])

  console.log('Seed completed!')
}

seed().catch(console.error)
