import { NextRequest } from 'next/server'
import { db } from '@/db'
import { orders, orderItems, recipes } from '@/db/schema'
import { isNull, desc, eq } from 'drizzle-orm'

export async function GET() {
  try {
    const result = await db
      .select()
      .from(orders)
      .where(isNull(orders.deletedAt))
      .orderBy(desc(orders.deliveryDatetime))

    const ordersWithItems = await Promise.all(
      result.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            recipeId: orderItems.recipeId,
            quantity: orderItems.quantity,
            unitPrice: orderItems.unitPrice,
            recipeName: recipes.name,
          })
          .from(orderItems)
          .leftJoin(recipes, eq(orderItems.recipeId, recipes.id))
          .where(eq(orderItems.orderId, order.id))

        return { ...order, items: items.filter(i => !i) || items }
      })
    )

    return Response.json(ordersWithItems)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerName,
      whatsapp,
      address,
      deliveryDatetime,
      deliveryType,
      notes,
      status,
      signalAmount,
      items,
    } = body

    if (!customerName || !deliveryDatetime || !deliveryType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const totalAmount = items?.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) =>
        sum + item.quantity * item.unitPrice,
      0
    ) ?? 0

    const [inserted] = await db
      .insert(orders)
      .values({
        customerName,
        whatsapp: whatsapp || null,
        address: address || null,
        deliveryDatetime,
        deliveryType,
        notes: notes || null,
        status: status || 'Pendente',
        signalAmount: Number(signalAmount) || 0,
        totalAmount,
      })
      .returning()

    if (items && Array.isArray(items) && items.length > 0) {
      await db.insert(orderItems).values(
        items.map((item: { recipeId: number; quantity: number; unitPrice: number }) => ({
          orderId: inserted.id,
          recipeId: item.recipeId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        }))
      )
    }

    return Response.json(inserted, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return Response.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
