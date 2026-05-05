# Doceria Manager

Sistema de gestão completo para doceria/confeitaria artesanal.

## Funcionalidades

- **Ingredientes** - CRUD com cálculo automático de custo por unidade
- **Receitas** - CRUD com suporte a sub-receitas e custo automático
- **Custos Indiretos** - Gestão de custos fixos e variáveis
- **Precificação** - Cálculo de preço com slider de markup (1x-5x)
- **Pedidos** - CRUD completo com gestão de status
- **Agenda** - Visão semanal dos pedidos por data de entrega
- **PWA** - Funciona como aplicativo no celular

## Stack

- **Next.js 15** (App Router)
- **Turso** (SQLite na nuvem) + **libsql**
- **Drizzle ORM**
- **Tailwind CSS** + **shadcn/ui**
- **TypeScript**

## Setup

### 1. Criar banco de dados no Turso

```bash
# Instalar CLI do Turso
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Criar banco
turso db create doceria-manager

# Pegar URL do banco
turso db show doceria-manager --url

# Criar token de acesso
turso db tokens create doceria-manager
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
# Editar .env.local com suas credenciais do Turso
```

### 3. Instalar dependências

```bash
npm install
```

### 4. Criar tabelas e popular banco

Acesse a URL `/api/seed` no browser após subir o servidor para criar as tabelas e inserir dados de exemplo:

```bash
npm run dev
# Acesse: http://localhost:3000/api/seed
```

### 5. Rodar o projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

## Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # Route Handlers
│   │   ├── ingredientes/
│   │   ├── receitas/
│   │   ├── custos/
│   │   ├── pedidos/
│   │   ├── precificacao/
│   │   └── seed/
│   ├── ingredientes/      # CRUD de ingredientes
│   ├── receitas/          # CRUD de receitas
│   ├── custos/            # Custos indiretos
│   ├── precificacao/      # Calculadora de precos
│   ├── pedidos/           # CRUD de pedidos
│   └── page.tsx           # Agenda (pagina principal)
├── components/
│   ├── ui/                # Componentes shadcn/ui
│   ├── layout/            # Sidebar e Header
│   └── pwa-register.tsx   # Registro do Service Worker
├── db/
│   ├── index.ts           # Conexao com banco
│   ├── schema.ts          # Schema Drizzle
│   ├── migrate.ts         # Migrations manuais
│   └── seed.ts            # Dados de exemplo
└── lib/
    ├── utils.ts           # Utilitarios
    └── calculations.ts    # Funcoes de calculo de custo
```

## Variaveis de Ambiente

| Variavel | Descricao |
|----------|-----------|
| TURSO_DATABASE_URL | URL do banco Turso (ex: libsql://...turso.io) |
| TURSO_AUTH_TOKEN | Token de autenticacao do Turso |

## Deploy

O projeto esta pronto para deploy na Vercel:

1. Conecte o repositorio na Vercel
2. Configure as variaveis de ambiente
3. Deploy automatico a cada push na branch main
