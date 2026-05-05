'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, CakeSlice } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

type Recipe = {
  id: number
  name: string
  yieldQuantity: number
  yieldUnit: string
  totalCost: number | null
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    fetchRecipes()
  }, [])

  async function fetchRecipes() {
    try {
      const res = await fetch('/api/receitas')
      if (res.ok) {
        const data = await res.json()
        setRecipes(data)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Deseja excluir a receita "${name}"?`)) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/receitas/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setRecipes(prev => prev.filter(r => r.id !== id))
        toast({ title: 'Receita excluída' })
      } else {
        toast({ title: 'Erro ao excluir', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    } finally {
      setDeleting(null)
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Receitas</h1>
          <p className="text-sm text-gray-500">{recipes.length} receita(s) cadastrada(s)</p>
        </div>
        <Link href="/receitas/nova">
          <Button>
            <Plus className="w-4 h-4" />
            Nova Receita
          </Button>
        </Link>
      </div>

      {recipes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <CakeSlice className="w-12 h-12 mx-auto mb-3 text-mint-200" />
            <p className="text-gray-500 mb-4">Nenhuma receita cadastrada ainda</p>
            <Link href="/receitas/nova">
              <Button>Cadastrar primeira receita</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map(recipe => {
            const costPerUnit = recipe.totalCost && recipe.yieldQuantity
              ? recipe.totalCost / recipe.yieldQuantity
              : 0

            return (
              <Card key={recipe.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{recipe.name}</h3>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Rende: {recipe.yieldQuantity} {recipe.yieldUnit}
                      </Badge>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Link href={`/receitas/${recipe.id}`}>
                        <Button variant="ghost" size="icon" className="w-8 h-8">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-8 h-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(recipe.id, recipe.name)}
                        disabled={deleting === recipe.id}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-sm border-t border-mint-50 pt-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Custo total</span>
                      <span className="font-medium">{formatCurrency(recipe.totalCost ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-mint-600 font-semibold">
                      <span>Custo por {recipe.yieldUnit}</span>
                      <span>{formatCurrency(costPerUnit)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500 text-xs">
                      <span>Preço sugerido (3.5x)</span>
                      <span>{formatCurrency(costPerUnit * 3.5)}</span>
                    </div>
                  </div>

                  <div className="mt-2">
                    <Link href={`/precificacao?receita=${recipe.id}`}>
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        Ver Precificação
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
