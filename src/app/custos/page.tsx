'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, FlaskConical } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

type IndirectCost = {
  id: number
  name: string
  type: 'fixo_mensal' | 'por_unidade'
  value: number
}

const emptyForm = { name: '', type: '', value: '' }

export default function CustosPage() {
  const [costs, setCosts] = useState<IndirectCost[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { fetchCosts() }, [])

  async function fetchCosts() {
    try {
      const res = await fetch('/api/custos')
      if (res.ok) setCosts(await res.json())
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  function openCreate() {
    setEditId(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function openEdit(cost: IndirectCost) {
    setEditId(cost.id)
    setForm({ name: cost.name, type: cost.type, value: String(cost.value) })
    setOpen(true)
  }

  async function handleSave() {
    if (!form.name || !form.type || !form.value) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const url = editId ? `/api/custos/${editId}` : '/api/custos'
      const method = editId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, type: form.type, value: Number(form.value) }),
      })

      if (res.ok) {
        toast({ title: editId ? 'Custo atualizado!' : 'Custo criado!' })
        setOpen(false)
        fetchCosts()
      } else {
        const error = await res.json()
        toast({ title: error.error ?? 'Erro ao salvar', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Deseja excluir o custo "${name}"?`)) return
    try {
      const res = await fetch(`/api/custos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCosts(prev => prev.filter(c => c.id !== id))
        toast({ title: 'Custo excluído' })
      }
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  const totalFixed = costs
    .filter(c => c.type === 'fixo_mensal')
    .reduce((sum, c) => sum + c.value, 0)

  const totalPerUnit = costs
    .filter(c => c.type === 'por_unidade')
    .reduce((sum, c) => sum + c.value, 0)

  const estimatedMonthly = 20
  const allocationPerProduction = totalFixed / estimatedMonthly + totalPerUnit

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
          <h1 className="text-2xl font-bold text-gray-900">Custos Indiretos</h1>
          <p className="text-sm text-gray-500">{costs.length} custo(s) cadastrado(s)</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Novo Custo
        </Button>
      </div>

      {costs.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-pink-800 mb-2">Rateio Estimado</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Total fixo mensal</div>
                <div className="font-semibold text-gray-800">{formatCurrency(totalFixed)}</div>
              </div>
              <div>
                <div className="text-gray-500">Total por unidade</div>
                <div className="font-semibold text-gray-800">{formatCurrency(totalPerUnit)}</div>
              </div>
              <div>
                <div className="text-gray-500">Custo por produção*</div>
                <div className="font-semibold text-blue-600">{formatCurrency(allocationPerProduction)}</div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              * Considerando {estimatedMonthly} produções/mês. Ajuste na tela de Precificação.
            </p>
          </CardContent>
        </Card>
      )}

      {costs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <FlaskConical className="w-12 h-12 mx-auto mb-3 text-blue-200" />
            <p className="text-gray-500 mb-4">Nenhum custo indireto cadastrado</p>
            <Button onClick={openCreate}>Cadastrar primeiro custo</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {costs.map(cost => (
            <Card key={cost.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{cost.name}</h3>
                    <Badge variant={cost.type === 'fixo_mensal' ? 'info' : 'secondary'} className="mt-1 text-xs">
                      {cost.type === 'fixo_mensal' ? 'Fixo mensal' : 'Por unidade'}
                    </Badge>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => openEdit(cost)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(cost.id, cost.name)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 text-sm font-semibold text-blue-600">
                  {formatCurrency(cost.value)}
                  <span className="text-gray-400 font-normal text-xs">
                    {cost.type === 'fixo_mensal' ? '/mês' : '/unidade'}
                  </span>
                </div>
                {cost.type === 'fixo_mensal' && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    ≈ {formatCurrency(cost.value / estimatedMonthly)} por produção
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? 'Editar Custo Indireto' : 'Novo Custo Indireto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Nome *</Label>
              <Input
                placeholder="Ex: Energia elétrica"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo *</Label>
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixo_mensal">Fixo mensal</SelectItem>
                  <SelectItem value="por_unidade">Por unidade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Valor (R$) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={form.value}
                onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
