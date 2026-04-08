# Muscleshop.ai - Documentação do Projeto

## 1. Introdução e Visão Geral do Projeto
O **Muscleshop.ai** é uma plataforma robusta de CRM e gestão operacional sob medida para a Muscle Shop. O sistema foi concebido para resolver o gargalo de fragmentação de dados entre leads de WhatsApp, vendas de balcão e logística de entrega.

Diferente de CRMs genéricos, o Muscleshop.ai foca na estratégia de retenção baseada no consumo (**LTV**). Através da nova estrutura de dados, o sistema é capaz de prever exatamente quando o suplemento de um cliente vai acabar, automatizando o contato no momento exato da necessidade de recompra.

---

## 2. Objetivos Estratégicos e KPIs
Para que o projeto seja considerado um sucesso, ele deve impactar diretamente os seguintes indicadores:

* **Taxa de Recompra (Retention Rate):** Aumentar em 40% a fidelização através dos alertas de LTV.
* **Tempo Médio de Entrega:** Reduzir o tempo de logística através da interface dedicada ao motoboy.
* **Conversão de Leads:** Monitorar quantos leads vindos do n8n (WhatsApp) efetivamente se tornam pedidos.
* **Recuperação de Estoque:** Capturar 100% da demanda reprimida por falta de produtos.

---

## 3. Personas e Fluxos de Experiência (UX)

### 3.1. Gestor de Negócios (Admin)
O gestor precisa de clareza financeira. Ele utiliza o dashboard para entender se o faturamento do dia está dentro da meta e monitorar a saúde do estoque através do Radar.
- **Ponto de dor:** Perda de dados históricos de clientes.
- **Objetivo:** Ter uma visão 360º da operação em uma única tela.

### 3.2. Atendente / SDR (Sales Development Representative)
O atendente lida com o caos das mensagens do WhatsApp. Ele precisa de uma interface rápida para mover leads e cadastrar pedidos sem atrito.
- **Ponto de dor:** Digitação repetitiva de dados.
- **Objetivo:** Transformar um lead em pedido com menos de 5 cliques.

### 3.3. Motoboy (Logística)
O motoboy está em trânsito. Ele precisa de uma visão *mobile-first* que não exija leitura de textos longos, mas sim botões de ação e mapas.
- **Ponto de dor:** Erro de endereço e dificuldade de rota.
- **Objetivo:** Entregar o pacote e finalizar o pedido no sistema instantaneamente.

---

## 4. Funcionalidades Detalhadas (Módulos)

### 4.1. Dashboard de Inteligência Operacional
O coração analítico do sistema. Estética *Dark Mode* com detalhes verdes.

* **KPIs em Tempo Real:** Faturamento Total, Quantidade de Leads, Pedidos Realizados e Taxa de Conversão.
* **Gráfico de Evolução:** Dinâmico (Eixo X: Horas | Eixo Y: R$).
* **Filtros Funcionais:** Seletor de Data (Hoje, Ontem, 7 dias, Mês). Reatividade via queries do Supabase.

### 4.2. Seção Kanban de Acompanhamento de Leads
* **Colunas:** Novo Contato (via n8n), Em Atendimento, Venda Fechada.
* **Cards:** Exibição de nome, telefone, tempo de espera e botão de "Quick Action" para WhatsApp.

### 4.3. Seção Kanban de Gestão de Pedidos
* **Colunas:** Em Andamento, Em Entrega, Finalizado.
* **Cards:** Nome, Telefone, Valor, Badges de Status (Entrega/Retirada) e Qtd de Itens.
* **Modal de Detalhes:** Lista de produtos (Sabor/Qtd), observações e endereço formatado.

### 4.4. Módulo de Logística (Visão do Motoboy)
* **Split Screen:** Lista de pedidos à esquerda/topo e Google Maps integrado à direita/fundo.
* **Ações:** Botão "Ir para Endereço" (dispara GPS) e botão "Finalizar Entrega".

### 4.5. Inteligência de LTV e Dashboard de Recompra
* **Ação Autônoma:** O processo de notificação de recompra é 100% automatizado, o n8n monitora e dispara mensagens persuasivas ao cliente quando atinge a data baseada no cálculo `data_pedido + itens_pedido.prazo_recompra_dias`.
* **Dashboard de LTV Funcional:** Uma visão analítica voltada a apresentar os resultados da estratégia de retenção (ex.: volume de clientes notificados via IA, taxa de conversão em recompra, faturamento ganho pelas automações). Nenhuma intervenção ou gatilho manual na tela é necessária.

### 4.6. Radar de Estoque (Demanda Reprimida)
* Registro de clientes interessados em produtos sem estoque.
* **Ação de Venda:** Botão "Notificar Cliente" que gera link de WhatsApp personalizado quando o produto chega.

---

## 5. Arquitetura de Dados (Supabase)

### 5.1. Tabela: `leads`
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | text (PK) | Número de telefone com DDI |
| `nome` | text | Nome do cliente |
| `status` | text | novo, atendimento, fechado |
| `created_at` | timestamptz | Default: now() |

### 5.2. Tabela: `pedidos`
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | uuid (PK) | uuid_generate_v4() |
| `lead_id` | text (FK) | Relacionamento com leads.id |
| `nome_cliente` | text | Denormalizado para busca |
| `tipo_entrega` | text | Delivery, Retirada |
| `endereco_entrega` | text | Endereço completo |
| `valor_total` | numeric | Soma do pedido |
| `status` | text | andamento, entrega, finalizado |
| `observacoes` | text | Notas adicionais |

### 5.3. Tabela: `pedido_itens`
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | uuid (PK) | Identificador único |
| `pedido_id` | uuid (FK) | Relacionamento com pedidos.id |
| `produto` | text | Nome do suplemento |
| `sabor` | text | Sabor escolhido |
| `quantidade` | int4 | Unidades |
| `prazo_recompra_dias`| int4 | Base para o LTV |

---

## 6. Design e Identidade Visual (UI/UX)
Estética **High-Tech / Fitness Dark**.

* **Background:** `#0A0A0A` (Preto Profundo)
* **Cards:** `#161616` (Cinza Escuro)
* **Accent Color:** `#1EF76A` (Verde Limão Vibrante)
* **Componentes:** Bordas arredondadas (8px), Glassmorphism e efeito Glow no hover.

---

## 7. Regras de Negócio e Automação
1.  **Cálculo de Recompra:** `data_pedido + prazo_recompra_dias`. Priorizar item de menor prazo em pedidos múltiplos.
2.  **Entrada n8n:** Upsert na tabela `leads` via telefone. Atualização em tempo real no Kanban.
3.  **Registro Manual:** Cálculo automático de `valor_total` baseado em `preco_unitario * quantidade`.

---

## 8. Requisitos Técnicos e Stack
* **Frontend:** Next.js (App Router) + React.js
* **Estilização:** Tailwind CSS
* **Estado/Sync:** TanStack Query
* **Backend:** Supabase (PostgreSQL, Auth, Realtime)
* **Automação:** n8n

---

## 9. Plano de Implementação (Roadmap)
1.  **Fase 1:** Setup Supabase, tabelas, RLS e Layout Base.
2.  **Fase 2:** Kanbans de Leads e Pedidos + Cadastro Manual.
3.  **Fase 3:** Visão do Motoboy, Mapas e Dashboard de KPIs.
4.  **Fase 4:** Lógica de LTV, Radar de Estoque e Webhooks n8n.

---

## 10. Considerações Finais
O **Muscleshop.ai** transforma a Muscle Shop em uma operação proativa. A inteligência de dados aplicada ao ciclo de recompra permite previsibilidade de caixa e garante que o cliente nunca fique sem seu suplemento, aumentando o faturamento sem depender exclusivamente de novos leads.