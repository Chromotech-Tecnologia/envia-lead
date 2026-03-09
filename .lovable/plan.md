

# Redesign Visual Completo do Sistema EnviaLead

## Escopo

Modernizar toda a interface com gradientes, sombras 3D, micro-animações e UX intuitivo. Afeta: Sidebar, Layout, Dashboard, FlowCards, LeadsTable, Settings e CSS global.

## Mudanças planejadas

### 1. CSS Global (`src/index.css`)
- Adicionar classes utilitárias para glassmorphism (`.glass-card`), sombras 3D (`.shadow-3d`), gradientes modernos
- Adicionar animações de entrada (`fade-in-up`, `scale-in`) com delays escalonados
- Background do body com gradiente sutil ao invés de cinza flat

### 2. Sidebar (`src/components/Sidebar.tsx`)
- Background com gradiente vertical escuro (purple-900 → indigo-900)
- Texto branco, itens de menu com hover glassmorphism
- Item ativo com barra lateral colorida + fundo semi-transparente
- Separador sutil entre seções
- Botão de logout com hover vermelho suave

### 3. Layout (`src/components/Layout.tsx`)
- Background com gradiente sutil (`from-slate-50 via-gray-50 to-purple-50/30`)
- Padding e spacing refinados

### 4. Flow Cards (`src/components/FlowCard.tsx` + sub-componentes)
- Card com glassmorphism: `backdrop-blur`, borda semi-transparente, sombra elevada
- Hover com translate-y negativo (efeito 3D de elevação)
- Barra de cor primária do fluxo no topo do card como accent
- Stats com ícones coloridos em mini-círculos gradient
- Badge de status (Ativo/Inativo) com dot pulsante
- Botões de ação com gradiente e hover scale
- `FlowCardStats.tsx`: ícones para cada stat (perguntas, URLs, emails), mini-cards com background sutil
- `FlowCardHeader.tsx`: tipografia melhorada, badge de cor do fluxo mais proeminente
- `FlowCardActions.tsx`: botões com gradientes e ícones animados

### 5. Dashboard (`src/components/DashboardMetrics.tsx`)
- Cards de métricas com ícone em círculo gradient, sombra 3D, hover elevação
- Cards de gráficos com bordas suaves e headers com gradientes sutis
- Filtros em card com glassmorphism
- Header da página com título gradient

### 6. Flow Manager (`src/components/FlowManager.tsx`)
- Header com título gradient e botão criar com sombra colorida
- Filtros estilizados com bordas arredondadas e ícones

### 7. Settings (`src/pages/Settings.tsx`)
- Header com gradient, cards com estilo consistente

### 8. Tailwind Config (`tailwind.config.ts`)
- Adicionar keyframes: `fade-in-up`, `float`, `shimmer`
- Adicionar animações correspondentes
- Adicionar `boxShadow` customizado para efeito 3D

## Detalhes técnicos

- Glassmorphism: `bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl`
- Hover 3D: `hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`
- Gradientes de texto: `bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent`
- Animações escalonadas via `style={{ animationDelay: '${index * 100}ms' }}`
- Stats com mini-cards: fundo gradient sutil + ícone + valor + label
- Sidebar dark mode: gradiente escuro com itens glassmorphism brancos

Arquivos editados: ~10 arquivos, sem mudança de lógica/funcionalidade.

