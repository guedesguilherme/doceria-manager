# SDD — Maria Melo · Bolos & Cia
> Documento de referência para sessões do Claude Code. Leia antes de qualquer tarefa.

---

## Visão geral

Sistema de gestão interno para confeiteira autônoma. O foco é usabilidade simples — a usuária não tem familiaridade com sistemas complexos. Toda decisão de UX deve priorizar clareza acima de funcionalidade avançada.

- **Repositório:** https://github.com/guedesguilherme/doceria-manager
- **Deploy:** Vercel
- **Banco:** Turso (SQLite remoto via libsql)
- **Env vars necessárias:** `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
- **Seed:** `GET /api/seed` — cria tabelas e popula com dados de exemplo

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Banco | Turso (SQLite) + `@libsql/client` |
| ORM | Drizzle ORM |
| Estilo | Tailwind CSS v4 |
| Componentes | shadcn/ui (customizados com paleta própria) |
| Linguagem | TypeScript |
| Fontes | Cormorant Garamond (títulos) + DM Sans (corpo) |

> **Atenção:** Este projeto usa **Next.js 15 / Tailwind v4** — APIs podem diferir do que o modelo conhece de versões anteriores. `params` em rotas dinâmicas é uma `Promise`. Cores customizadas são definidas via `@theme` no CSS, não em `tailwind.config`.

---

## Estrutura de pastas

```
src/
├── app/
│   ├── layout.tsx              # Layout raiz — fontes, sidebar, header mobile
│   ├── page.tsx                # Agenda (página principal)
│   ├── ingredientes/           # CRUD ingredientes
│   │   ├── page.tsx
│   │   ├── novo/page.tsx
│   │   └── [id]/page.tsx
│   ├── receitas/               # CRUD receitas + sub-receitas
│   │   ├── page.tsx
│   │   ├── nova/page.tsx
│   │   └── [id]/page.tsx
│   ├── custos/page.tsx         # Custos indiretos (CRUD inline)
│   ├── precificacao/page.tsx   # Calculadora com slider de markup
│   ├── pedidos/                # CRUD pedidos
│   │   ├── page.tsx
│   │   ├── novo/page.tsx
│   │   └── [id]/page.tsx
│   └── api/
│       ├── seed/route.ts
│       ├── ingredientes/route.ts + [id]/route.ts
│       ├── receitas/route.ts + [id]/route.ts
│       ├── custos/route.ts + [id]/route.ts
│       ├── pedidos/route.ts + [id]/route.ts
│       └── precificacao/[id]/route.ts
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx         # Sidebar desktop com logo horizontal
│   │   └── header.tsx          # Header mobile com logo selo + hamburguer
│   ├── ui/                     # Componentes shadcn customizados
│   └── pwa-register.tsx
├── db/
│   ├── index.ts                # Conexão Turso via drizzle
│   ├── schema.ts               # Todas as tabelas
│   ├── migrate.ts              # Cria tabelas (usado pelo seed)
│   └── seed.ts                 # Dados de exemplo
└── lib/
    ├── utils.ts                # cn(), formatCurrency()
    └── calculations.ts         # calcCostPerUnit(), calcRecipeCost()
```

---

## Banco de dados

### Regra global: soft delete
Nenhum registro é deletado permanentemente. Todo `DELETE` na UI define `deleted_at = CURRENT_TIMESTAMP`. Todas as queries filtram `WHERE deleted_at IS NULL`.

### Schema

**`ingredients`**
```
id, name, unit (kg|L|unidade|cx), purchase_price, purchase_quantity,
cost_per_unit (calculado: price/quantity), user_id, created_at, deleted_at
```

**`recipes`**
```
id, name, yield_quantity, yield_unit (ex: "bolo", "unidades"),
total_cost (calculado), user_id, created_at, deleted_at
```

**`recipe_ingredients`**
```
id, recipe_id, ingredient_id (null se sub-receita), sub_recipe_id (null se ingrediente),
quantity, deleted_at
```
> Um item de receita é **ou** um ingrediente **ou** uma sub-receita — nunca os dois.

**`indirect_costs`**
```
id, name, type (fixo_mensal|por_unidade), value, user_id, created_at, deleted_at
```

**`orders`**
```
id, customer_name, whatsapp, address, delivery_datetime, delivery_type (entrega|retirada),
notes, status (Pendente|Em produção|Pronto|Entregue), signal_amount, total_amount,
user_id, created_at, deleted_at
```

**`order_items`**
```
id, order_id, recipe_id, quantity, unit_price, deleted_at
```

---

## Módulos

### Agenda (/)
Página principal. Visão semanal de pedidos organizados por `delivery_datetime`. Cards coloridos por status. Pedidos do dia em destaque. Filtros: Hoje / Esta semana / Todos. Mobile: exibe só o dia atual.

**Status → cor:**
- Pendente → amarelo
- Em produção → azul
- Pronto → verde
- Entregue → cinza

### Ingredientes (/ingredientes)
CRUD completo. `cost_per_unit` é calculado automaticamente ao salvar: `purchase_price / purchase_quantity`.

### Receitas (/receitas)
CRUD com lista de itens (ingredientes + sub-receitas). `total_cost` é recalculado recursivamente ao salvar. Sub-receitas entram proporcionalmente: `(sub_recipe.total_cost / sub_recipe.yield_quantity) * quantity_used`.

### Custos Indiretos (/custos)
CRUD inline (dialog na mesma página). Dois tipos:
- `fixo_mensal`: dividido por 20 produções/mês para chegar no custo por produção
- `por_unidade`: valor direto por unidade produzida

### Precificação (/precificacao)
Seletor de receita → breakdown de custos → slider de markup (1x–5x, padrão 3.5x) → preço sugerido atualizado em tempo real. Campo livre para a confeiteira registrar o preço que decidiu cobrar.

### Pedidos (/pedidos)
CRUD com múltiplos itens por pedido. `total_amount` calculado pela soma de `(unit_price * quantity)` dos itens. Campo `signal_amount` para registrar sinal recebido.

---

## Decisões de arquitetura

- **Multi-usuário futuro:** `user_id` existe em todas as tabelas mas é `nullable`. Sem auth por enquanto.
- **PWA:** `public/manifest.json` + `public/sw.js`. O SW **nunca** cacheia `/_next/` para evitar conflito com chunks JS atualizados.
- **Imagens:** `next/image` com `mix-blend-multiply` nos logos para eliminar fundo branco do PNG sobre fundo claro.
- **Logos:** `public/logo-horizontal.png` (sidebar desktop) e `public/logo-selo.png` (header mobile). Nomes URL-safe para Vercel.
- **Fontes:** Carregadas via `next/font/google` como variáveis CSS (`--font-display`, `--font-sans`).

---

## Variáveis de ambiente

```env
TURSO_DATABASE_URL=libsql://seu-banco.turso.io
TURSO_AUTH_TOKEN=seu-token-jwt
```

---

## Setup local

```bash
npm install
cp .env.example .env.local
# preencher as vars do Turso
npm run dev
# acessar http://localhost:3000/api/seed UMA vez para criar tabelas e seed
```

---

## O que ainda não foi feito (backlog)

- Autenticação (planejada para adicionar sem breaking changes graças ao `user_id`)
- Export de orçamento/pedido em PDF
- Histórico de preços praticados
- Notificações de pedidos próximos à entrega
- Versão da logo com fundo transparente (elimina necessidade do `mix-blend-multiply`)
