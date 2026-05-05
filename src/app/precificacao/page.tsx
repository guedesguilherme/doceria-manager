'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Info } from 'lucide-react'

type Recipe = { id: number; name: string; yieldQuantity: number; yieldUnit: string; totalCost: number | null }

type Pricing = {
  ingredientCost: number
  indirectCostPerUnit: number
  totalCostPerUnit: number
  suggestedPrice: number
  markup: number
}

type PricingResult = {
  recipe: Recipe
  pricing: Pricing
}

function PrecificacaoContent() {
  const searchParams = useSearchParams()
  const initialRecipe = searchParams.get('receita')

  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<string>(initialRecipe ?? '')
  const [markup, setMarkup] = useState(3.5)
  const [result, setResult] = useState<PricingResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [customPrice, setCustomPrice] = useState('')

  useEffect(() => {
    async function loadRecipes() {
      const res = await fetch('/api/receitas')
      if (res.ok) setRecipes(await res.json())
    }
    loadRecipes()
  }, [])

  const fetchPricing = useCallback(async (recipeId: string, markupVal: number) => {
    if (!recipeId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/precificacao/${recipeId}?markup=${markupVal}`)
      if (res.ok) {
        setResult(await res.json())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedRecipe) {
      fetchPricing(selectedRecipe, markup)
    }
  }, [selectedRecipe, markup, fetchPricing])

  const recipe = result?.recipe
  const pricing = result?.pricing
  const costPerYieldUnit = pricing && recipe
    ? pricing.ingredientCost / recipe.yieldQuantity
    : 0

  const margin = pricing && customPrice
    ? ((Number(customPrice) - pricing.totalCostPerUnit) / Number(customPrice)) * 100
    : null

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Precificação</h1>
        <p className="text-sm text-gray-500">Calcule o preço ideal para suas receitas</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-1.5">
            <Label>Selecionar Receita</Label>
            <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha uma receita..." />
              </SelectTrigger>
              <SelectContent>
                {recipes.map(r => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    {r.name} (rende {r.yieldQuantity} {r.yieldUnit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedRecipe && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Markup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>1x</span>
                <span className="font-bold text-pink-700 text-lg">{markup.toFixed(1)}x</span>
                <span>5x</span>
              </div>
              <Slider
                min={1}
                max={5}
                step={0.1}
                value={[markup]}
                onValueChange={([v]) => setMarkup(v)}
                className="w-full"
              />
              <div className="flex gap-2 justify-center flex-wrap">
                {[2, 2.5, 3, 3.5, 4, 4.5, 5].map(m => (
                  <button
                    key={m}
                    onClick={() => setMarkup(m)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      Math.abs(markup - m) < 0.05
                        ? 'bg-pink-600 text-white'
                        : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
                    }`}
                  >
                    {m}x
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <Card>
              <CardContent className="py-8 text-center text-pink-400">
                Calculando...
              </CardContent>
            </Card>
          ) : result && pricing && recipe ? (
            <>
              <Card className="border-pink-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-pink-600" />
                    {recipe.name}
                    <Badge variant="secondary">Rende {recipe.yieldQuantity} {recipe.yieldUnit}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-pink-50 rounded-lg p-3 space-y-2">
                    <h4 className="text-xs font-semibold text-pink-600 uppercase tracking-wide">Custo por {recipe.yieldUnit}</h4>

                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between text-gray-700">
                        <span>Ingredientes</span>
                        <span className="font-medium">{formatCurrency(costPerYieldUnit)}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Custos indiretos</span>
                        <span className="font-medium">{formatCurrency(pricing.indirectCostPerUnit)}</span>
                      </div>
                      <div className="flex justify-between text-gray-900 font-semibold border-t border-pink-200 pt-1.5">
                        <span>Custo total por {recipe.yieldUnit}</span>
                        <span>{formatCurrency(pricing.totalCostPerUnit)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl p-4 text-white">
                    <div className="text-xs font-medium opacity-80 mb-1">
                      Preço sugerido (markup {markup.toFixed(1)}x) por {recipe.yieldUnit}
                    </div>
                    <div className="text-3xl font-bold">
                      {formatCurrency(pricing.suggestedPrice)}
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      Margem: {((1 - 1 / markup) * 100).toFixed(0)}%
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Custo total da produção</h4>
                    <div className="flex justify-between text-gray-700">
                      <span>Ingredientes ({recipe.yieldQuantity} {recipe.yieldUnit})</span>
                      <span>{formatCurrency(pricing.ingredientCost)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Indiretos estimados</span>
                      <span>{formatCurrency(pricing.indirectCostPerUnit * recipe.yieldQuantity)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-gray-900">
                      <span>Total</span>
                      <span>{formatCurrency(pricing.totalCostPerUnit * recipe.yieldQuantity)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-pink-700 border-t border-gray-200 pt-1">
                      <span>Receita total ({markup.toFixed(1)}x)</span>
                      <span>{formatCurrency(pricing.suggestedPrice * recipe.yieldQuantity)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Info className="w-4 h-4 text-gray-400" />
                    Simular preço de venda
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Preço que deseja cobrar por {recipe.yieldUnit} (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={formatCurrency(pricing.suggestedPrice).replace('R$\u00a0', '')}
                      value={customPrice}
                      onChange={e => setCustomPrice(e.target.value)}
                    />
                  </div>

                  {customPrice && Number(customPrice) > 0 && (
                    <div className={`rounded-lg p-3 text-sm ${
                      margin! >= 30 ? 'bg-green-50 border border-green-200' :
                      margin! >= 0 ? 'bg-yellow-50 border border-yellow-200' :
                      'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex justify-between">
                        <span className="font-medium">Markup efetivo</span>
                        <span>{(Number(customPrice) / pricing.totalCostPerUnit).toFixed(2)}x</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Margem de lucro</span>
                        <span className={`font-bold ${
                          margin! >= 30 ? 'text-green-700' :
                          margin! >= 0 ? 'text-yellow-700' :
                          'text-red-700'
                        }`}>
                          {margin?.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Lucro por {recipe.yieldUnit}</span>
                        <span>{formatCurrency(Number(customPrice) - pricing.totalCostPerUnit)}</span>
                      </div>
                      {margin! < 0 && (
                        <p className="text-red-600 text-xs mt-1 font-medium">
                          Atenção: preço abaixo do custo!
                        </p>
                      )}
                      {margin! >= 0 && margin! < 20 && (
                        <p className="text-yellow-600 text-xs mt-1">
                          Margem baixa. Considere aumentar o preço.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : null}
        </>
      )}

      {!selectedRecipe && (
        <Card>
          <CardContent className="py-16 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-pink-200" />
            <p className="text-gray-500">Selecione uma receita para calcular o preço</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function PrecificacaoPage() {
  return (
    <Suspense fallback={<div className="text-pink-400 text-center py-16">Carregando...</div>}>
      <PrecificacaoContent />
    </Suspense>
  )
}
