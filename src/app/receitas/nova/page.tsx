'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

type Ingredient = { id: number; name: string; unit: string; costPerUnit: number }
type Recipe = { id: number; name: string; yieldQuantity: number; yieldUnit: string; totalCost: number | null }

type RecipeItem = {
  type: 'ingredient' | 'subrecipe'
  ingredientId?: number
  subRecipeId?: number
  quantity: string
  label: string
  costPerUnit: number
  yieldQuantity?: number
}

export default function NovaReceitaPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [form, setForm] = useState({ name: '', yieldQuantity: '', yieldUnit: '' })
  const [items, setItems] = useState<RecipeItem[]>([])
  const [newItemType, setNewItemType] = useState<'ingredient' | 'subrecipe'>('ingredient')
  const [newItemId, setNewItemId] = useState('')
  const [newItemQty, setNewItemQty] = useState('')

  useEffect(() => {
    async function load() {
      const [ingRes, recRes] = await Promise.all([
        fetch('/api/ingredientes'),
        fetch('/api/receitas'),
      ])
      if (ingRes.ok) setIngredients(await ingRes.json())
      if (recRes.ok) setRecipes(await recRes.json())
    }
    load()
  }, [])

  function addItem() {
    if (!newItemId || !newItemQty || Number(newItemQty) <= 0) {
      toast({ title: 'Selecione o item e informe uma quantidade válida', variant: 'destructive' })
      return
    }

    if (newItemType === 'ingredient') {
      const ing = ingredients.find(i => i.id === Number(newItemId))
      if (!ing) return
      setItems(prev => [...prev, {
        type: 'ingredient',
        ingredientId: ing.id,
        quantity: newItemQty,
        label: `${ing.name} (${ing.unit})`,
        costPerUnit: ing.costPerUnit,
      }])
    } else {
      const rec = recipes.find(r => r.id === Number(newItemId))
      if (!rec) return
      setItems(prev => [...prev, {
        type: 'subrecipe',
        subRecipeId: rec.id,
        quantity: newItemQty,
        label: `[Sub] ${rec.name} (${rec.yieldUnit})`,
        costPerUnit: rec.totalCost ? rec.totalCost / rec.yieldQuantity : 0,
        yieldQuantity: rec.yieldQuantity,
      }])
    }

    setNewItemId('')
    setNewItemQty('')
  }

  function removeItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const totalCost = items.reduce((sum, item) => {
    return sum + item.costPerUnit * Number(item.quantity)
  }, 0)

  const costPerUnit = form.yieldQuantity ? totalCost / Number(form.yieldQuantity) : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name || !form.yieldQuantity || !form.yieldUnit) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/receitas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          yieldQuantity: Number(form.yieldQuantity),
          yieldUnit: form.yieldUnit,
          items: items.map(item => ({
            ingredientId: item.ingredientId || null,
            subRecipeId: item.subRecipeId || null,
            quantity: Number(item.quantity),
          })),
        }),
      })

      if (res.ok) {
        toast({ title: 'Receita criada com sucesso!' })
        router.push('/receitas')
      } else {
        const error = await res.json()
        toast({ title: error.error ?? 'Erro ao criar receita', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro ao criar receita', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/receitas">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Nova Receita</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Informações Básicas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome da receita *</Label>
              <Input
                id="name"
                placeholder="Ex: Bolo de Chocolate"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="yieldQuantity">Rendimento (quantidade) *</Label>
                <Input
                  id="yieldQuantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Ex: 8"
                  value={form.yieldQuantity}
                  onChange={e => setForm(p => ({ ...p, yieldQuantity: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="yieldUnit">Unidade do rendimento *</Label>
                <Input
                  id="yieldUnit"
                  placeholder="Ex: porções, unidades, bolo"
                  value={form.yieldUnit}
                  onChange={e => setForm(p => ({ ...p, yieldUnit: e.target.value }))}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Ingredientes e Sub-receitas</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Select value={newItemType} onValueChange={v => { setNewItemType(v as 'ingredient' | 'subrecipe'); setNewItemId('') }}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingredient">Ingrediente</SelectItem>
                  <SelectItem value="subrecipe">Sub-receita</SelectItem>
                </SelectContent>
              </Select>

              <Select value={newItemId} onValueChange={setNewItemId}>
                <SelectTrigger className="flex-1 min-w-[160px]">
                  <SelectValue placeholder={newItemType === 'ingredient' ? 'Selecionar ingrediente' : 'Selecionar receita'} />
                </SelectTrigger>
                <SelectContent>
                  {newItemType === 'ingredient'
                    ? ingredients.map(i => (
                        <SelectItem key={i.id} value={String(i.id)}>
                          {i.name} ({formatCurrency(i.costPerUnit)}/{i.unit})
                        </SelectItem>
                      ))
                    : recipes.map(r => (
                        <SelectItem key={r.id} value={String(r.id)}>
                          {r.name} ({r.yieldUnit})
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>

              <Input
                type="number"
                step="0.001"
                min="0.001"
                placeholder="Qtd"
                className="w-24"
                value={newItemQty}
                onChange={e => setNewItemQty(e.target.value)}
              />

              <Button type="button" onClick={addItem} variant="outline" size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {items.length > 0 && (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-blue-50 rounded-lg p-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{item.label}</div>
                      <div className="text-xs text-gray-500">
                        {item.quantity} × {formatCurrency(item.costPerUnit)} = {formatCurrency(item.costPerUnit * Number(item.quantity))}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-red-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {items.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                Nenhum ingrediente adicionado ainda
              </p>
            )}
          </CardContent>
        </Card>

        {totalCost > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-pink-800 mb-2">Resumo de Custos</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Custo total ingredientes</span>
                  <span className="font-medium">{formatCurrency(totalCost)}</span>
                </div>
                {form.yieldQuantity && (
                  <div className="flex justify-between text-blue-600 font-semibold">
                    <span>Custo por {form.yieldUnit || 'unidade'}</span>
                    <span>{formatCurrency(costPerUnit)}</span>
                  </div>
                )}
                {costPerUnit > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Preço sugerido (3.5x)</span>
                    <span>{formatCurrency(costPerUnit * 3.5)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Link href="/receitas" className="flex-1">
            <Button variant="outline" className="w-full" type="button">Cancelar</Button>
          </Link>
          <Button className="flex-1" type="submit" disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar Receita'}
          </Button>
        </div>
      </form>
    </div>
  )
}
