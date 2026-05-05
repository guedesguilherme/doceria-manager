'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, Wheat } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

type Ingredient = {
  id: number
  name: string
  unit: string
  purchasePrice: number
  purchaseQuantity: number
  costPerUnit: number
  createdAt: string | null
}

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    fetchIngredients()
  }, [])

  async function fetchIngredients() {
    try {
      const res = await fetch('/api/ingredientes')
      if (res.ok) {
        const data = await res.json()
        setIngredients(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Deseja excluir o ingrediente "${name}"?`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/ingredientes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setIngredients(prev => prev.filter(i => i.id !== id))
        toast({ title: 'Ingrediente excluído', variant: 'default' })
      } else {
        toast({ title: 'Erro ao excluir', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    } finally {
      setDeleting(null)
    }
  }

  const unitLabels: Record<string, string> = {
    kg: 'kg',
    L: 'L',
    unidade: 'un',
    cx: 'cx',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-blue-400">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ingredientes</h1>
          <p className="text-sm text-gray-500">{ingredients.length} ingrediente(s) cadastrado(s)</p>
        </div>
        <Link href="/ingredientes/novo">
          <Button>
            <Plus className="w-4 h-4" />
            Novo Ingrediente
          </Button>
        </Link>
      </div>

      {ingredients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <Wheat className="w-12 h-12 mx-auto mb-3 text-blue-200" />
            <p className="text-gray-500 mb-4">Nenhum ingrediente cadastrado ainda</p>
            <Link href="/ingredientes/novo">
              <Button>Cadastrar primeiro ingrediente</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ingredients.map(ingredient => (
            <Card key={ingredient.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{ingredient.name}</h3>
                    <Badge variant="secondary" className="mt-1 text-xs">
                      {unitLabels[ingredient.unit] ?? ingredient.unit}
                    </Badge>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Link href={`/ingredientes/${ingredient.id}`}>
                      <Button variant="ghost" size="icon" className="w-8 h-8">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(ingredient.id, ingredient.name)}
                      disabled={deleting === ingredient.id}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Preço de compra</span>
                    <span className="font-medium">{formatCurrency(ingredient.purchasePrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Qtd. comprada</span>
                    <span className="font-medium">{ingredient.purchaseQuantity} {unitLabels[ingredient.unit]}</span>
                  </div>
                  <div className="flex justify-between text-blue-600 font-semibold border-t border-blue-50 pt-1 mt-1">
                    <span>Custo por {unitLabels[ingredient.unit]}</span>
                    <span>{formatCurrency(ingredient.costPerUnit)}</span>
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
