'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDatetime } from '@/lib/utils'
import { Plus, ShoppingCart, Phone, MapPin, CalendarDays } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

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
  status: 'Pendente' | 'Em produção' | 'Pronto' | 'Entregue'
  signalAmount: number | null
  totalAmount: number | null
  items: OrderItem[]
}

const statusFilters = ['Todos', 'Pendente', 'Em produção', 'Pronto', 'Entregue']

function getStatusVariant(status: string): 'warning' | 'info' | 'success' | 'muted' | 'outline' {
  switch (status) {
    case 'Pendente': return 'warning'
    case 'Em produção': return 'info'
    case 'Pronto': return 'success'
    case 'Entregue': return 'muted'
    default: return 'outline'
  }
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('Todos')

  useEffect(() => { fetchOrders() }, [])

  async function fetchOrders() {
    try {
      const res = await fetch('/api/pedidos')
      if (res.ok) setOrders(await res.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  async function handleStatusChange(id: number, newStatus: string) {
    const order = orders.find(o => o.id === id)
    if (!order) return

    try {
      const res = await fetch(`/api/pedidos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...order,
          status: newStatus,
          items: order.items.map(i => ({
            recipeId: i.id,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        }),
      })
      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus as Order['status'] } : o))
        toast({ title: 'Status atualizado' })
      }
    } catch {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' })
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Deseja excluir o pedido de "${name}"?`)) return
    try {
      const res = await fetch(`/api/pedidos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== id))
        toast({ title: 'Pedido excluído' })
      }
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  const filteredOrders = statusFilter === 'Todos'
    ? orders
    : orders.filter(o => o.status === statusFilter)

  const summary = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pendente').length,
    producing: orders.filter(o => o.status === 'Em produção').length,
    ready: orders.filter(o => o.status === 'Pronto').length,
    totalValue: orders.filter(o => o.status !== 'Entregue').reduce((s, o) => s + (o.totalAmount ?? 0), 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-mint-400">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-sm text-gray-500">{orders.length} pedido(s) no total</p>
        </div>
        <Link href="/pedidos/novo">
          <Button>
            <Plus className="w-4 h-4" />
            Novo Pedido
          </Button>
        </Link>
      </div>

      {orders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-yellow-700">{summary.pending}</div>
              <div className="text-xs text-yellow-600">Pendentes</div>
            </CardContent>
          </Card>
          <Card className="bg-mint-50 border-mint-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-mint-700">{summary.producing}</div>
              <div className="text-xs text-mint-600">Em produção</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-green-700">{summary.ready}</div>
              <div className="text-xs text-green-600">Prontos</div>
            </CardContent>
          </Card>
          <Card className="bg-mint-50 border-mint-200">
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold text-mint-600">{formatCurrency(summary.totalValue)}</div>
              <div className="text-xs text-mint-500">A receber</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusFilters.map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === f
                ? 'bg-mint-500 text-white'
                : 'bg-white border border-mint-200 text-gray-600 hover:bg-mint-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-mint-200" />
            <p className="text-gray-500 mb-4">
              {statusFilter === 'Todos' ? 'Nenhum pedido cadastrado' : `Nenhum pedido "${statusFilter}"`}
            </p>
            {statusFilter === 'Todos' && (
              <Link href="/pedidos/novo">
                <Button>Criar primeiro pedido</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-900">{order.customerName}</span>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {order.deliveryType === 'entrega' ? 'Entrega' : 'Retirada'}
                      </Badge>
                    </div>

                    <div className="space-y-0.5 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-mint-400" />
                        {formatDatetime(order.deliveryDatetime)}
                      </div>
                      {order.whatsapp && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-mint-400" />
                          {order.whatsapp}
                        </div>
                      )}
                      {order.address && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-mint-400" />
                          <span className="truncate">{order.address}</span>
                        </div>
                      )}
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        {order.items.map((item, i) => (
                          <span key={i}>
                            {i > 0 && ', '}
                            {item.quantity}x {item.recipeName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0 space-y-2">
                    <div className="font-bold text-mint-600">{formatCurrency(order.totalAmount ?? 0)}</div>
                    {(order.signalAmount ?? 0) > 0 && (
                      <div className="text-xs text-gray-400">
                        Sinal: {formatCurrency(order.signalAmount ?? 0)}
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      {order.status !== 'Entregue' && (
                        <select
                          className="text-xs border border-mint-200 rounded px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-mint-400"
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value="Pendente">Pendente</option>
                          <option value="Em produção">Em produção</option>
                          <option value="Pronto">Pronto</option>
                          <option value="Entregue">Entregue</option>
                        </select>
                      )}
                      <Link href={`/pedidos/${order.id}`}>
                        <Button variant="outline" size="sm" className="w-full text-xs">
                          Editar
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
