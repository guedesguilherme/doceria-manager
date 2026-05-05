import { NextRequest } from 'next/server'
import { db } from '@/db'
import { orders, orderItems, recipes } from '@/db/schema'
import { eq, isNull } from 'drizzle-orm'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, Number(id)))
      .limit(1)

    if (!order || order.deletedAt) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    const items = await db
      .select({
        id: orderItems.id,
        recipeId: orderItems.recipeId,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        recipeName: recipes.name,
        recipeYieldUnit: recipes.yieldUnit,
      })
      .from(orderItems)
      .leftJoin(recipes, eq(orderItems.recipeId, recipes.id))
      .where(eq(orderItems.orderId, Number(id)))

    return Response.json({ ...order, items })
  } catch (error) {
    console.error('Error fetching order:', error)
    return Response.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    await db
      .update(orders)
      .set({
        customerName,
        whatsapp: whatsapp || null,
        address: address || null,
        deliveryDatetime,
        deliveryType,
        notes: notes || null,
        status,
        signalAmount: Number(signalAmount) || 0,
        totalAmount,
      })
      .where(eq(orders.id, Number(id)))

    // Delete old items and reinsert
    await db
      .delete(orderItems)
      .where(eq(orderItems.orderId, Number(id)))

    if (items && Array.isArray(items) && items.length > 0) {
      await db.insert(orderItems).values(
        items.map((item: { recipeId: number; quantity: number; unitPrice: number }) => ({
          orderId: Number(id),
          recipeId: item.recipeId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        }))
      )
    }

    const [updated] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, Number(id)))
      .limit(1)

    return Response.json(updated)
  } catch (error) {
    console.error('Error updating order:', error)
    return Response.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const now = new Date().toISOString()

    const [deleted] = await db
      .update(orders)
      .set({ deletedAt: now })
      .where(eq(orders.id, Number(id)))
      .returning()

    if (!deleted) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting order:', error)
    return Response.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}
