# Design System — Maria Melo · Bolos & Cia

---

## Marca

**Nome completo:** Maria Melo  
**Tagline:** Bolos & Cia  
**Tom de voz:** Artesanal, afetivo, profissional sem ser frio. Como uma confeiteira que sabe o que faz e trata cada cliente pelo nome.

---

## Logos

Arquivos disponíveis em `/public`:

| Arquivo | Uso digital |
|---|---|
| `logo-horizontal.png` | Sidebar desktop, headers de documentos |
| `logo-selo.png` | Header mobile, favicon, PWA icon, avatar |

**Atenção técnica:** os PNGs têm fundo branco. Em fundos claros, aplicar `mix-blend-multiply` via CSS/Tailwind para tornar o branco transparente. Em fundos escuros, usar versão com fundo transparente (a ser criada).

---

## Paleta de cores

### Cores principais

| Nome | Token Tailwind | Hex | Uso |
|---|---|---|---|
| Menta Imperial | `mint-500` | `#4A8C8C` | Primária — botões, ícones ativos, destaques |
| Rosa Veludo | `velvet-500` | `#D49A9A` | Acento — badges, elementos decorativos, hover secundário |
| Cacau Profundo | `cocoa` | `#2D2421` | Tipografia principal, títulos |
| Chantilly | `chantilly` | `#F9F8F6` | Fundo global, cards em repouso |

### Escala Menta (primária)

| Token | Hex | Uso típico |
|---|---|---|
| `mint-50` | `#EEF5F5` | Fundo de item ativo na nav, hover suave |
| `mint-100` | `#D5E8E8` | Bordas suaves, separadores |
| `mint-200` | `#BCDADA` | Bordas de inputs, bordas de cards |
| `mint-300` | `#9EC8C8` | Estados desabilitados, placeholders |
| `mint-400` | `#6AACAC` | Ícones secundários, labels |
| `mint-500` | `#4A8C8C` | **Cor primária** — botões, links ativos |
| `mint-600` | `#3A7070` | Hover de botões, texto em fundo menta |
| `mint-700` | `#2D5A5A` | Texto ativo na nav, ênfase |

### Escala Veludo (acento)

| Token | Hex | Uso típico |
|---|---|---|
| `velvet-50` | `#FAF3F3` | Fundo de alertas suaves |
| `velvet-100` | `#F0DADA` | Bordas decorativas |
| `velvet-300` | `#E0B5B5` | Badges secundários |
| `velvet-500` | `#D49A9A` | **Cor de acento** — badges, tags |
| `velvet-600` | `#C07A7A` | Hover de elementos veludo |

### Como usar no código

As cores são definidas via `@theme` no `globals.css` e geram classes Tailwind automaticamente:

```tsx
// Fundos
<div className="bg-chantilly">       // fundo global
<div className="bg-mint-50">         // fundo suave
<div className="bg-mint-500">        // fundo primário

// Texto
<p className="text-cocoa">           // texto principal
<p className="text-mint-700">        // texto de destaque
<p className="text-cocoa/60">        // texto secundário (60% opacidade)

// Bordas
<div className="border-mint-100">    // borda suave
<div className="border-mint-200">    // borda de input

// Botão primário
<button className="bg-mint-500 hover:bg-mint-600 text-white">
```

---

## Tipografia

### Famílias

| Família | Variável CSS | Classe Tailwind | Uso |
|---|---|---|---|
| Cormorant Garamond | `--font-display` | `font-display` | Logotipo, títulos de página (h1, h2, h3) |
| DM Sans | `--font-sans` | `font-sans` | Tudo mais — labels, inputs, textos, botões |

**Cormorant Garamond** traz o peso editorial e artesanal da marca — referência à tipografia francesa do séc. XVI. Usar apenas em títulos e elementos de destaque.

**DM Sans** é sem serifa de baixa distorção, legível em telas pequenas. É a fonte padrão do `body`.

### Escala de tamanhos recomendada

| Elemento | Classe | Família |
|---|---|---|
| Título de página | `text-3xl font-display font-semibold` | Cormorant |
| Subtítulo de seção | `text-xl font-display` | Cormorant |
| Label de campo | `text-sm font-medium` | DM Sans |
| Corpo de texto | `text-sm` | DM Sans |
| Texto auxiliar | `text-xs text-cocoa/60` | DM Sans |

---

## Componentes

### Botão primário
```tsx
<button className="bg-mint-500 hover:bg-mint-600 text-white font-medium px-4 py-2 rounded-lg transition-colors">
  Salvar
</button>
```

### Botão secundário / outline
```tsx
<button className="border border-mint-200 text-mint-700 hover:bg-mint-50 font-medium px-4 py-2 rounded-lg transition-colors">
  Cancelar
</button>
```

### Card
```tsx
<div className="bg-white border border-mint-100 rounded-xl shadow-sm p-5">
  ...
</div>
```

### Input
```tsx
<input className="border border-mint-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-400 focus:border-transparent" />
```

### Badge de status

```tsx
// Pendente
<span className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs px-2 py-0.5 rounded-full">Pendente</span>

// Em produção
<span className="bg-mint-50 text-mint-700 border border-mint-200 text-xs px-2 py-0.5 rounded-full">Em produção</span>

// Pronto
<span className="bg-green-50 text-green-700 border border-green-200 text-xs px-2 py-0.5 rounded-full">Pronto</span>

// Entregue
<span className="bg-gray-100 text-gray-500 border border-gray-200 text-xs px-2 py-0.5 rounded-full">Entregue</span>
```

### Nav item (sidebar)
```tsx
// Ativo
<a className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-mint-50 text-mint-700 border border-mint-200 shadow-sm">

// Inativo
<a className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-cocoa/70 hover:bg-mint-50 hover:text-mint-600">
```

---

## Layout

### Grid geral
- **Sidebar:** 256px fixa, visível apenas `lg:` (≥1024px)
- **Conteúdo:** `flex-1`, padding `p-4 lg:p-6`
- **Mobile:** header fixo com hamburguer, sem sidebar

### Princípios de UX (usuária não-técnica)
1. **Rótulos descritivos** — evitar termos técnicos. "Arquivar" em vez de "Deletar". "Salvar" em vez de "Submit".
2. **Confirmação antes de ações destrutivas** — sempre usar dialog de confirmação para arquivar.
3. **Feedback imediato** — toasts após qualquer ação de escrita.
4. **Formulários curtos** — campos obrigatórios reduzidos ao mínimo. Nada que a usuária não vá preencher.
5. **Números sempre formatados** — usar `formatCurrency()` de `src/lib/utils.ts` para todo valor monetário.

---

## Arquivos de configuração

### globals.css — onde as cores são declaradas
```css
@theme {
  --color-mint-50: #EEF5F5;
  /* ... escala completa ... */
  --color-velvet-500: #D49A9A;
  --color-cocoa: #2D2421;
  --color-chantilly: #F9F8F6;
  --font-display: "Cormorant Garamond", Georgia, serif;
  --font-sans: "DM Sans", system-ui, sans-serif;
}
```

> Para adicionar uma nova cor à paleta, basta adicionar `--color-nome: #hex` no bloco `@theme`. A classe `bg-nome`, `text-nome`, `border-nome` é gerada automaticamente pelo Tailwind v4.

### layout.tsx — onde as fontes são carregadas
```tsx
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-display' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' })

// aplicado no <html>:
<html className={`${cormorant.variable} ${dmSans.variable}`}>
```
