# Muscleshop.ai - Documentação do Projeto

## 1. Introdução e Visão Geral do Projeto
O **Muscleshop.ai** é uma plataforma robusta de CRM e gestão operacional sob medida para a Muscle Shop. O sistema foi concebido para resolver o gargalo de fragmentação de dados entre leads de WhatsApp, vendas de balcão e logística de entrega.

Diferente de CRMs genéricos, o Muscleshop.ai foca na estratégia de retenção baseada no consumo (**LTV**). Através da nova estrutura de dados, o sistema é capaz de prever exatamente quando o suplemento de um cliente vai acabar, automatizando o contato no momento exato da necessidade de recompra via bot **BIA** (WhatsApp).

---

## 2. Objetivos Estratégicos e KPIs
Para que o projeto seja considerado um sucesso, ele deve impactar diretamente os seguintes indicadores:

* **Taxa de Recompra (Retention Rate):** Aumentar em 40% a fidelização através dos alertas de LTV.
* **Tempo Médio de Entrega:** Reduzir o tempo de logística através da interface dedicada ao motoboy (`/entregas`).
* **Conversão de Leads:** Monitorar quantos leads vindos do n8n (WhatsApp) efetivamente se tornam pedidos.
* **Recuperação de Estoque:** Capturar 100% da demanda reprimida por falta de produtos via Radar de Estoque.

---

## 3. Personas e Fluxos de Experiência (UX)

### 3.1. Gestor de Negócios (Admin)
O gestor precisa de clareza financeira. Ele utiliza o dashboard para entender se o faturamento do dia está dentro da meta e monitorar a saúde do estoque através do Radar.
- **Ponto de dor:** Perda de dados históricos de clientes.
- **Objetivo:** Ter uma visão 360º da operação em uma única tela.

### 3.2. Atendente / SDR (Sales Development Representative)
O atendente lida com o caos das mensagens do WhatsApp. Ele precisa de uma interface rápida para mover leads e cadastrar pedidos sem atrito.
- **Ponto de dor:** Digitação repetitiva de dados.
- **Objetivo:** Transformar um lead em pedido com menos de 5 cliques via modal `NovoPedidoModal`.

### 3.3. Motoboy (Logística)
O motoboy está em trânsito. Ele acessa uma rota separada (`/entregas`) que é 100% mobile-first, sem sidebar nem layout padrão do admin.
- **Ponto de dor:** Erro de endereço e dificuldade de rota.
- **Objetivo:** Visualizar entregas pendentes, abrir o Google Maps com um toque e finalizar o pedido.

---

## 4. Funcionalidades Detalhadas (Módulos)

### 4.1. Dashboard de Inteligência Operacional (`/`)
O coração analítico do sistema. Estética *Dark Mode* com detalhes verdes.

* **KPIs em Tempo Real:** Faturamento Total, Total de Leads, Pedidos em Andamento e Taxa de Conversão.
* **Indicadores de Tendência:** Cada KPI exibe badge colorido (+/- %) comparando com o período anterior.
* **Gráfico de Evolução:** AreaChart dinâmico via Recharts (Eixo X: Horas ou Dias | Eixo Y: R$), com animação de 1,5s na entrada.
* **Filtros Funcionais:** Seletor de período (Hoje, Ontem, 7 dias, Mês). Reatividade via queries diretas ao Supabase com comparação ao período anterior.
* **Loading Skeleton:** Estado de carregamento com `animate-pulse` enquanto dados são buscados.

### 4.2. Seção Kanban de Acompanhamento de Leads (`/leads`)
* **Colunas (3):** Novo Contato, Em Atendimento, Venda Fechada.
* **Cards:** Nome do cliente, telefone (como ID), tempo de espera formatado via `date-fns/ptBR`, botão de WhatsApp direto.
* **Drag & Drop:** Arrasto nativo HTML5 com atualização otimista de estado e persistência no Supabase.
* **Supabase Realtime:** Inscrição ativa no canal `leads_changes` — cards de novos leads via n8n aparecem instantaneamente sem refresh.

### 4.3. Seção Kanban de Gestão de Pedidos (`/pedidos`)
* **Colunas (4):** Pendente, Em Andamento, Em Entrega, Finalizado.
* **Cards:** Nome do cliente, badge Delivery/Retirada, quantidade de itens, valor total e endereço (se delivery).
* **Drag & Drop:** Arrasto nativo com atualização otimista e fallback em caso de erro.
* **Botão "Novo Pedido":** Abre `NovoPedidoModal` para cadastro manual.
* **Modal de Detalhes (`DetalhesPedidoModal`):** Abre ao clicar no card — exibe lista de produtos, sabor, quantidade, valor, endereço e observações.
* **Modal de Criação (`NovoPedidoModal`):** Formulário completo com: lead associado, tipo de entrega, forma de pagamento (pix, débito, crédito, dinheiro), endereço, observações e seleção de produtos do catálogo com quantidade, sabor e prazo de recompra.

### 4.4. Módulo de Logística — Visão Admin (`/logistica`)
* **Split Screen:** Painel esquerdo com lista de pedidos "Em Entrega" (apenas delivery) e painel direito com mapa estilizado dark mode.
* **Seleção de Rota:** Clicar em uma entrega destaca com glow verde e exibe o endereço no painel direito.
* **Ações:** Botão "Navegar" (abre Google Maps Search) e botão "Finalizar" (muda status para `finalizado` e remove da lista).
* **Mapa:** Visual estático premium com overlay dark mode e animação de ping no marcador central.

### 4.5. Módulo de Logística — Visão do Motoboy (`/entregas`)
* **Rota independente:** Sem Layout padrão (sem sidebar). Página standalone, mobile-first (max-w-md).
* **Cards de Entrega:** Nome, valor em badge verde, quantidade de itens, endereço, observações.
* **Ações:** Botão "Mapa" (abre Google Maps) e botão "Finalizar" com confirmação.
* **Estado vazio:** Mensagem "Todas as entregas já foram finalizadas" com ícone.

### 4.6. Dashboard de Retenção (LTV) (`/ltv`)
* **KPIs de Retenção (3):** Faturamento Recompra (receita efetiva dos pedidos classificados como recompra), Clientes Retidos (leads com mais de 1 pedido finalizado), Automações Disparadas (dados calculados com base nas recompras, sem hardcodes fictícios).
* **Evolução do Faturamento de Recompra:** Gráfico de área (AreaChart) 100% funcional. Consulta a view `vw_faturamento_recompra_mensal` e garante o preenchimento (padding) dos últimos 6 meses mesmo se não houver dados, garantindo que o gráfico exiba a curva histórica corretamente, sem usar dados fictícios.
* **Base de Clientes (Funil de Recompra):** Tabela de dados listando clientes elegíveis à retenção (suplementos) com informações dinâmicas de funil: `Pós-venda`, `Follow-up de Satisfação`, `Nutrição`, `Janela de Recompra` e `Atrasado / Perdido`. Utiliza a view `vw_ltv_recompra_suplementos`.
* **Automação de Engajamento:** Mecânica autônoma de LTV no n8n. O sistema agrupa suplementos do mesmo pedido e monitora o menor `prazo_recompra_dias` para disparar 3 comunicações:
    1. **Dia 1:** Pós-venda e dica de consumo.
    2. **Metade do Prazo:** Follow-up de satisfação.
    3. **Aviso Final (-5 dias):** Alerta de recompra e oferta de reposição com cashback.
* **Fallback para IA de Vendas:** Toda mensagem ativa disparada pela automação é injetada na tabela `memory` do Supabase. Assim, caso o cliente decida realizar um novo pedido mesmo nas fases iniciais (ex: responder no follow-up), a "BIA Muscle Shop" recebe o contexto e finaliza a nova venda de forma contínua e natural.
* **Dados reais:** Métricas e funil de clientes calculados dinamicamente a partir das tabelas `pedidos` e view `vw_ltv_recompra_suplementos` no Supabase.

### 4.7. Radar de Estoque (`/radar`)
* **Demanda Reprimida:** Lista de clientes interessados em produtos sem estoque, exibidos em cards grid (1-3 colunas responsivo).
* **Cards:** Produto desejado, nome do cliente, tempo desde o registro.
* **Ação "Notificar Chegada":** Gera link de WhatsApp com mensagem personalizada e atualiza status para `notificado` no Supabase.
* **Estado "Notificado":** Botão desabilitado com feedback visual após notificação.
* **Deletar Registro:** Botão de lixeira com confirmação via `window.confirm`.
* **Adicionar Registro:** Botão "Adicionar Registro" que abre `NovoRadarModal` (nome, telefone, produto desejado).

---

## 5. Arquitetura de Dados (Supabase)

### 5.1. Tabela: `leads`
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | text (PK) | Número de telefone com DDI |
| `Nome` | text | Nome do cliente |
| `Status` | text | novo, atendimento, fechado (Default: 'novo') |
| `created_at` | timestamptz | Default: now() |

> **Nota:** Os campos `Nome` e `Status` usam letra maiúscula conforme o schema real do Supabase.

### 5.2. Tabela: `pedidos`
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | uuid (PK) | uuid_generate_v4() |
| `lead_id` | text (FK) | Relacionamento com leads.id |
| `nome_cliente` | text | Denormalizado para busca rápida |
| `tipo_entrega` | text | delivery, retirada |
| `endereco_entrega` | text | Endereço completo |
| `forma_pagamento` | text | pix, debito, credito, dinheiro |
| `valor_total` | numeric | Soma do pedido |
| `status` | text | pendente, andamento, em_entrega, finalizado |
| `observacoes` | text | Notas adicionais |
| `created_at` | timestamptz | Default: now() |

### 5.3. Tabela: `pedido_itens`
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | uuid (PK) | Identificador único |
| `pedido_id` | uuid (FK) | Relacionamento com pedidos.id |
| `produto` | text | Nome do suplemento |
| `sabor` | text | Sabor escolhido |
| `quantidade` | int4 | Unidades |
| `preco_unitario` | numeric | Preço unitário no momento do pedido |
| `prazo_recompra_dias` | int4 | Base para o cálculo de LTV |

### 5.4. Tabela: `products` (Catálogo)
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | text (PK) | Identificador do produto |
| `sku` | text | Código SKU |
| `name` | text | Nome do produto |
| `slug` | text | Slug para URL |
| `description` | text | Descrição |
| `price` | numeric | Preço regular |
| `sale_price` | numeric | Preço promocional |
| `stock_quantity` | int4 | Quantidade em estoque |
| `category` | text | Categoria |
| `brand` | text | Marca |
| `image_url` | text | URL da imagem |
| `is_active` | boolean | Produto ativo/inativo |
| `prazo_produto_dias` | int4 | Prazo padrão de recompra do produto |

### 5.5. Tabela: `demanda_reprimida`
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | uuid (PK) | Identificador único |
| `nome_cliente` | text | Nome do cliente interessado |
| `telefone_cliente` | text | Telefone para notificação |
| `produto_desejado` | text | Nome do produto sem estoque |
| `status` | text | pendente, notificado |
| `created_at` | timestamptz | Default: now() |

---

## 6. Design e Identidade Visual (UI/UX)
Estética **High-Tech / Fitness Dark**.

* **Background:** `#0A0A0A` (Preto Profundo) — variável `--color-bg`
* **Cards/Surface:** `#161616` (Cinza Escuro) — variável `--color-surface`
* **Accent Color:** `#1EF76A` (Verde Limão Vibrante) — variável `--color-accent`
* **Hover Accent:** `--color-accent-hover` para botões com estado hover
* **Glow Effect:** `--color-accent-glow` para sombra neon em elementos selecionados
* **Componentes:** Bordas arredondadas (8px), Glassmorphism (`glass` class) e efeito Glow no hover (`glow-hover` class)
* **Ícones:** Lucide React (conjunto uniforme de ícones)
* **Animações:** Framer Motion (`motion`) para micro-animações; Recharts com `animationDuration={1500}` nos gráficos
* **Sidebar:** Fixed left, 256px de largura, item ativo com borda verde + sombra glow

---

## 7. Regras de Negócio e Automação
1. **Cálculo de Recompra:** `data_pedido + prazo_recompra_dias` do item com menor prazo em pedidos múltiplos.
2. **Entrada n8n / BIA:** Upsert na tabela `leads` via telefone. O Supabase Realtime propaga a atualização instantaneamente no Kanban de Leads.
3. **Registro Manual de Pedido:** `valor_total` calculado automaticamente como `SUM(preco_unitario × quantidade)` pelo `NovoPedidoModal`.
4. **Forma de Pagamento:** Campo obrigatório no pedido — pix, débito, crédito, dinheiro.
5. **Fluxo de Kanban de Pedidos:** `pendente → andamento → em_entrega → finalizado`.
6. **Notificação de Radar:** O botão "Notificar Chegada" gera link `wa.me` com mensagem personalizada e marca o registro como `notificado`.
7. **Automação LTV (BIA):** Processo 100% autônomo via n8n — sem intervenção manual no front-end.

---

## 8. Requisitos Técnicos e Stack

### Stack Real Implementada
| Camada | Tecnologia |
| :--- | :--- |
| **Frontend** | React 19 + Vite 6 (TypeScript) |
| **Roteamento** | React Router DOM v7 |
| **Estilização** | Tailwind CSS v4 (`@tailwindcss/vite`) |
| **Ícones** | Lucide React |
| **Gráficos** | Recharts |
| **Animações** | Motion (Framer Motion v12) |
| **Datas** | date-fns v4 (locale ptBR) |
| **Backend/DB** | Supabase (PostgreSQL + Realtime) |
| **Auth/Cliente** | @supabase/supabase-js v2 |
| **Automação** | n8n (externo) |
| **Deploy** | Vercel (`vercel.json` configurado) |
| **AI SDK** | @google/genai (Google GenAI) |

> **⚠️ Nota:** O PRD original previa Next.js + TanStack Query. A implementação real usa **Vite + React** com gerenciamento de estado via hooks nativos (`useState`/`useEffect`) e Supabase Realtime. **TanStack Query não está presente.**

---

## 9. Estrutura de Rotas

| Rota | Componente | Layout | Acesso |
| :--- | :--- | :--- | :--- |
| `/` | Dashboard | Admin (com Sidebar) | Admin/Gestor |
| `/leads` | Leads | Admin (com Sidebar) | Admin/Atendente |
| `/pedidos` | Pedidos | Admin (com Sidebar) | Admin/Atendente |
| `/logistica` | Logistica | Admin (com Sidebar) | Admin/Gestor |
| `/ltv` | LTV | Admin (com Sidebar) | Admin/Gestor |
| `/radar` | Radar | Admin (com Sidebar) | Admin/Atendente |
| `/entregas` | Entregas | **Sem sidebar** | Motoboy (mobile) |

---

## 10. Plano de Implementação (Status Atual)
1. ✅ **Fase 1 — Concluída:** Setup Supabase, tabelas (`leads`, `pedidos`, `pedido_itens`, `products`, `demanda_reprimida`), Layout base com Sidebar.
2. ✅ **Fase 2 — Concluída:** Kanbans de Leads e Pedidos + Modal de Cadastro Manual (`NovoPedidoModal`) + Modal de Detalhes (`DetalhesPedidoModal`).
3. ✅ **Fase 3 — Concluída:** Visão do Motoboy (`/entregas`), Logística Admin com mapa estilizado e Dashboard de KPIs com gráfico Recharts e tendências comparativas.
4. ✅ **Fase 4 — Concluída:** Dashboard de LTV com métricas de retenção, Radar de Estoque com `demanda_reprimida`, Supabase Realtime nos Leads, Radar com delete/notificação.

---

## 11. Considerações Finais
O **Muscleshop.ai** transforma a Muscle Shop em uma operação proativa. A inteligência de dados aplicada ao ciclo de recompra (via bot BIA no n8n) permite previsibilidade de caixa e garante que o cliente nunca fique sem seu suplemento, aumentando o faturamento sem depender exclusivamente de novos leads.

A separação de interface entre **admin** (sidebar + split screen) e **motoboy** (`/entregas` standalone mobile) garante que cada persona utilize a ferramenta sem fricção, no dispositivo adequado.