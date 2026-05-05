'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { use } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

type Params = { id: string }

export default function EditIngredientPage({ params }: { params: Promise<Params> }) {
  const { id } = use(params)
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    name: '',
    unit: '',
    purchasePrice: '',
    purchaseQuantity: '',
  })

  const previewCost = form.purchasePrice && form.purchaseQuantity
    ? Number(form.purchasePrice) / Number(form.purchaseQuantity)
    : 0

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/ingredientes/${id}`)
        if (res.ok) {
          const data = await res.json()
          setForm({
            name: data.name,
            unit: data.unit,
            purchasePrice: String(data.purchasePrice),
            purchaseQuantity: String(data.purchaseQuantity),
          })
        } else {
          toast({ title: 'Ingrediente não encontrado', variant: 'destructive' })
          router.push('/ingredientes')
        }
      } catch {
        toast({ title: 'Erro ao carregar', variant: 'destructive' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, router])

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
      const res = await fetch(`/api/ingredientes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          unit: form.unit,
          purchasePrice: Number(form.purchasePrice),
          purchaseQuantity: Number(form.purchaseQuantity),
        }),
      })

      if (res.ok) {
        toast({ title: 'Ingrediente atualizado com sucesso!' })
        router.push('/ingredientes')
      } else {
        const error = await res.json()
        toast({ title: error.error ?? 'Erro ao atualizar', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro ao atualizar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-blue-400">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/ingredientes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Editar Ingrediente</h1>
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
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-sm text-blue-500">
                  Custo por {form.unit || 'unidade'}:{' '}
                  <span className="font-bold">{formatCurrency(previewCost)}</span>
                </p>
                <p className="text-xs text-blue-400 mt-0.5">
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
