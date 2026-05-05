'use client'

import { useState, useEffect } from 'react'
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { CalendarDays, Clock, User, Package } from 'lucide-react'
import Link from 'next/link'

type OrderItem = {
  id: number
  recipeName: string | null
  quantity: number
  unitPrice: number
}

type Order = {
  id: number
  customerName: string
  whatsapp: string | null
  address: string | null
  deliveryDatetime: string
  deliveryType: 'entrega' | 'retirada'
  notes: string | null
  status: string
  signalAmount: number | null
  totalAmount: number | null
  items: OrderItem[]
}

type FilterType = 'hoje' | 'semana' | 'todos'

function getStatusBadgeVariant(status: string): 'warning' | 'info' | 'success' | 'muted' | 'outline' {
  switch (status) {
    case 'Pendente': return 'warning'
    case 'Em produção': return 'info'
    case 'Pronto': return 'success'
    case 'Entregue': return 'muted'
    default: return 'outline'
  }
}

function OrderCard({ order, highlight }: { order: Order; highlight: boolean }) {
  const deliveryDate = new Date(order.deliveryDatetime)

  return (
    <div className={`bg-white rounded-lg p-3 border shadow-sm ${highlight ? 'border-blue-400 border-2' : 'border-blue-100'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <User className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <span className="font-semibold text-sm text-gray-900 truncate">{order.customerName}</span>
        </div>
        <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs flex-shrink-0">
          {order.status}
        </Badge>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
        <Clock className="w-3 h-3" />
        <span>{format(deliveryDate, 'HH:mm')}</span>
        <span className="text-blue-300">•</span>
        <span>{order.deliveryType === 'entrega' ? 'Entrega' : 'Retirada'}</span>
      </div>

      {order.items && order.items.length > 0 && (
        <div className="mt-1.5">
          {order.items.slice(0, 2).map((item, i) => (
            <div key={i} className="flex items-center gap-1 text-xs text-gray-600">
              <Package className="w-3 h-3 text-blue-400" />
              <span>{item.quantity}x {item.recipeName}</span>
            </div>
          ))}
          {order.items.length > 2 && (
            <span className="text-xs text-gray-400">+{order.items.length - 2} item(s)</span>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-blue-600">
          {formatCurrency(order.totalAmount ?? 0)}
        </span>
        <Link href={`/pedidos/${order.id}`}>
          <Button variant="ghost" size="sm" className="text-xs h-6 px-2">
            Ver
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function AgendaPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<FilterType>('semana')
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    try {
      const res = await fetch('/api/pedidos')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  function getOrdersForDay(day: Date) {
    return orders
      .filter(order => {
        const orderDate = new Date(order.deliveryDatetime)
        return isSameDay(orderDate, day)
      })
      .sort((a, b) => new Date(a.deliveryDatetime).getTime() - new Date(b.deliveryDatetime).getTime())
  }

  function getFilteredOrders() {
    if (filter === 'hoje') {
      return orders.filter(order => isSameDay(new Date(order.deliveryDatetime), today))
    }
    if (filter === 'semana') {
      return orders.filter(order => {
        const d = new Date(order.deliveryDatetime)
        return d >= weekStart && d <= addDays(weekStart, 6)
      })
    }
    return orders
  }

  const daysToShow = isMobile
    ? [today]
    : filter === 'hoje'
      ? [today]
      : weekDays

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-blue-400 text-sm">Carregando agenda...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-sm text-gray-500">
            {format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="flex rounded-lg border border-blue-200 overflow-hidden">
            {(['hoje', 'semana', 'todos'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
              >
                {f === 'hoje' ? 'Hoje' : f === 'semana' ? 'Esta semana' : 'Todos'}
              </button>
            ))}
          </div>

          <Link href="/pedidos/novo">
            <Button size="sm" className="text-sm">
              + Novo Pedido
            </Button>
          </Link>
        </div>
      </div>

      {filter === 'todos' ? (
        <div className="space-y-3">
          {getFilteredOrders().length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <CalendarDays className="w-12 h-12 mx-auto mb-3 text-blue-200" />
              <p>Nenhum pedido encontrado</p>
              <Link href="/pedidos/novo">
                <Button variant="outline" className="mt-3 text-sm">
                  Criar primeiro pedido
                </Button>
              </Link>
            </div>
          ) : (
            getFilteredOrders().map(order => (
              <div key={order.id} className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{order.customerName}</span>
                      <Badge variant={getStatusBadgeVariant(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5" />
                        {format(new Date(order.deliveryDatetime), "dd/MM 'às' HH:mm")}
                      </span>
                      <span>{order.deliveryType === 'entrega' ? 'Entrega' : 'Retirada'}</span>
                    </div>
                    {order.items && (
                      <div className="text-sm text-gray-600 mt-1">
                        {order.items.map(i => `${i.quantity}x ${i.recipeName}`).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-blue-600">{formatCurrency(order.totalAmount ?? 0)}</div>
                    <Link href={`/pedidos/${order.id}`}>
                      <Button variant="ghost" size="sm" className="mt-1">Ver</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className={`grid gap-3 ${daysToShow.length > 1 ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-7' : 'grid-cols-1 max-w-sm mx-auto w-full'}`}>
          {daysToShow.map((day) => {
            const dayOrders = getOrdersForDay(day)
            const todayDay = isToday(day)
            return (
              <div
                key={day.toISOString()}
                className={`rounded-xl p-2 min-h-[120px] ${
                  todayDay ? 'bg-blue-50 border-2 border-blue-200' : 'bg-white border border-blue-100'
                }`}
              >
                <div className={`text-center mb-2 pb-2 border-b ${todayDay ? 'border-blue-200' : 'border-blue-50'}`}>
                  <div className={`text-xs font-medium uppercase ${todayDay ? 'text-blue-500' : 'text-gray-400'}`}>
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  <div className={`text-lg font-bold ${todayDay ? 'text-blue-600' : 'text-gray-700'}`}>
                    {format(day, 'd')}
                  </div>
                </div>

                <div className="space-y-2">
                  {dayOrders.length === 0 ? (
                    <p className="text-xs text-gray-300 text-center py-2">—</p>
                  ) : (
                    dayOrders.map(order => (
                      <OrderCard key={order.id} order={order} highlight={todayDay} />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
