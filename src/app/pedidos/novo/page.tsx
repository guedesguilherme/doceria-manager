'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

type Recipe = {
  id: number
  name: string
  yieldQuantity: number
  yieldUnit: string
  totalCost: number | null
}

type OrderItemForm = {
  recipeId: number
  recipeName: string
  quantity: string
  unitPrice: string
}

export default function NovoPedidoPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [form, setForm] = useState({
    customerName: '',
    whatsapp: '',
    address: '',
    deliveryDatetime: '',
    deliveryType: 'retirada',
    notes: '',
    status: 'Pendente',
    signalAmount: '',
  })
  const [items, setItems] = useState<OrderItemForm[]>([])
  const [newRecipeId, setNewRecipeId] = useState('')
  const [newQty, setNewQty] = useState('')
  const [newPrice, setNewPrice] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/receitas')
      if (res.ok) setRecipes(await res.json())
    }
    load()
  }, [])

  function addItem() {
    if (!newRecipeId || !newQty || !newPrice) {
      toast({ title: 'Preencha receita, quantidade e preço', variant: 'destructive' })
      return
    }
    const recipe = recipes.find(r => r.id === Number(newRecipeId))
    if (!recipe) return

    setItems(prev => [...prev, {
      recipeId: recipe.id,
      recipeName: recipe.name,
      quantity: newQty,
      unitPrice: newPrice,
    }])
    setNewRecipeId('')
    setNewQty('')
    setNewPrice('')
  }

  function removeItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  function handleRecipeSelect(recipeId: string) {
    setNewRecipeId(recipeId)
    const recipe = recipes.find(r => r.id === Number(recipeId))
    if (recipe?.totalCost && recipe.yieldQuantity) {
      const costPerUnit = recipe.totalCost / recipe.yieldQuantity
      setNewPrice(String((costPerUnit * 3.5).toFixed(2)))
    }
  }

  const totalAmount = items.reduce((sum, item) => sum + Number(item.quantity) * Number(item.unitPrice), 0)
  const remaining = totalAmount - Number(form.signalAmount || 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.customerName || !form.deliveryDatetime || !form.deliveryType) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' })
      return
    }

    if (items.length === 0) {
      toast({ title: 'Adicione pelo menos um item ao pedido', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.customerName,
          whatsapp: form.whatsapp || null,
          address: form.address || null,
          deliveryDatetime: form.deliveryDatetime,
          deliveryType: form.deliveryType,
          notes: form.notes || null,
          status: form.status,
          signalAmount: Number(form.signalAmount) || 0,
          items: items.map(item => ({
            recipeId: item.recipeId,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
          })),
        }),
      })

      if (res.ok) {
        toast({ title: 'Pedido criado com sucesso!' })
        router.push('/pedidos')
      } else {
        const error = await res.json()
        toast({ title: error.error ?? 'Erro ao criar pedido', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro ao criar pedido', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/pedidos">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Novo Pedido</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Dados do Cliente</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome do cliente *</Label>
              <Input
                placeholder="Nome completo"
                value={form.customerName}
                onChange={e => setForm(p => ({ ...p, customerName: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>WhatsApp</Label>
                <Input
                  placeholder="11999887766"
                  value={form.whatsapp}
                  onChange={e => setForm(p => ({ ...p, whatsapp: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Forma de entrega *</Label>
                <Select value={form.deliveryType} onValueChange={v => setForm(p => ({ ...p, deliveryType: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retirada">Retirada</SelectItem>
                    <SelectItem value="entrega">Entrega</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.deliveryType === 'entrega' && (
              <div className="space-y-1.5">
                <Label>Endereço de entrega</Label>
                <Input
                  placeholder="Rua, número, bairro, cidade"
                  value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Data e hora da entrega *</Label>
              <Input
                type="datetime-local"
                value={form.deliveryDatetime}
                onChange={e => setForm(p => ({ ...p, deliveryDatetime: e.target.value }))}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Itens do Pedido</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Select value={newRecipeId} onValueChange={handleRecipeSelect}>
                <SelectTrigger className="flex-1 min-w-[160px]">
                  <SelectValue placeholder="Selecionar receita" />
                </SelectTrigger>
                <SelectContent>
                  {recipes.map(r => (
                    <SelectItem key={r.id} value={String(r.id)}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="0.5"
                min="0.5"
                placeholder="Qtd"
                className="w-20"
                value={newQty}
                onChange={e => setNewQty(e.target.value)}
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Preço unit."
                className="w-28"
                value={newPrice}
                onChange={e => setNewPrice(e.target.value)}
              />
              <Button type="button" onClick={addItem} variant="outline" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {items.length > 0 && (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-pink-50 rounded-lg p-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800">{item.recipeName}</div>
                      <div className="text-xs text-gray-500">
                        {item.quantity} × {formatCurrency(Number(item.unitPrice))} = {formatCurrency(Number(item.quantity) * Number(item.unitPrice))}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-red-400 hover:text-red-600 flex-shrink-0"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {items.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Nenhum item adicionado</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Pagamento e Status</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Em produção">Em produção</SelectItem>
                    <SelectItem value="Pronto">Pronto</SelectItem>
                    <SelectItem value="Entregue">Entregue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Sinal recebido (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={form.signalAmount}
                  onChange={e => setForm(p => ({ ...p, signalAmount: e.target.value }))}
                />
              </div>
            </div>

            {totalAmount > 0 && (
              <div className="bg-pink-50 rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between text-gray-700">
                  <span>Total do pedido</span>
                  <span className="font-semibold">{formatCurrency(totalAmount)}</span>
                </div>
                {Number(form.signalAmount) > 0 && (
                  <>
                    <div className="flex justify-between text-gray-600">
                      <span>Sinal</span>
                      <span>- {formatCurrency(Number(form.signalAmount))}</span>
                    </div>
                    <div className="flex justify-between text-pink-700 font-semibold border-t border-pink-200 pt-1">
                      <span>Restante</span>
                      <span>{formatCurrency(remaining)}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Observações</Label>
              <Textarea
                placeholder="Ex: Escrever 'Feliz Aniversário Maria' no bolo"
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Link href="/pedidos" className="flex-1">
            <Button variant="outline" className="w-full" type="button">Cancelar</Button>
          </Link>
          <Button className="flex-1" type="submit" disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Criar Pedido'}
          </Button>
        </div>
      </form>
    </div>
  )
}
