'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

export default function NovoIngredientePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    unit: '',
    purchasePrice: '',
    purchaseQuantity: '',
  })

  const previewCost = form.purchasePrice && form.purchaseQuantity
    ? Number(form.purchasePrice) / Number(form.purchaseQuantity)
    : 0

  function handleChange(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name || !form.unit || !form.purchasePrice || !form.purchaseQuantity) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' })
      return
    }

    if (Number(form.purchaseQuantity) <= 0) {
      toast({ title: 'A quantidade deve ser maior que zero', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/ingredientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          unit: form.unit,
          purchasePrice: Number(form.purchasePrice),
          purchaseQuantity: Number(form.purchaseQuantity),
        }),
      })

      if (res.ok) {
        toast({ title: 'Ingrediente criado com sucesso!' })
        router.push('/ingredientes')
      } else {
        const error = await res.json()
        toast({ title: error.error ?? 'Erro ao criar ingrediente', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro ao criar ingrediente', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/ingredientes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Novo Ingrediente</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações do Ingrediente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Ex: Farinha de trigo"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="unit">Unidade de medida *</Label>
              <Select value={form.unit} onValueChange={v => handleChange('unit', v)}>
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg (quilograma)</SelectItem>
                  <SelectItem value="L">L (litro)</SelectItem>
                  <SelectItem value="unidade">unidade</SelectItem>
                  <SelectItem value="cx">cx (caixa)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="purchasePrice">Preço de compra (R$) *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={form.purchasePrice}
                  onChange={e => handleChange('purchasePrice', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="purchaseQuantity">
                  Qtd. comprada {form.unit ? `(${form.unit})` : ''} *
                </Label>
                <Input
                  id="purchaseQuantity"
                  type="number"
                  step="0.001"
                  min="0.001"
                  placeholder="1"
                  value={form.purchaseQuantity}
                  onChange={e => handleChange('purchaseQuantity', e.target.value)}
                  required
                />
              </div>
            </div>

            {previewCost > 0 && (
              <div className="bg-pink-50 rounded-lg p-3 border border-pink-100">
                <p className="text-sm text-pink-600">
                  Custo por {form.unit || 'unidade'}:{' '}
                  <span className="font-bold">{formatCurrency(previewCost)}</span>
                </p>
                <p className="text-xs text-pink-400 mt-0.5">
                  Calculado automaticamente: {formatCurrency(Number(form.purchasePrice))} ÷ {form.purchaseQuantity} {form.unit}
                </p>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Link href="/ingredientes" className="flex-1">
                <Button variant="outline" className="w-full" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button className="flex-1" type="submit" disabled={saving}>
                <Save className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
