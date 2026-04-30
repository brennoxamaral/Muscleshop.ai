# Estrutura da Automação: BIA Muscle Shop

[cite_start]Este documento detalha o planejamento técnico e funcional da **Bia**, uma inteligência artificial integrada ao WhatsApp para a loja **Muscle Shop**[cite: 1, 2].

---

## 1. Objetivo Central
[cite_start]Implementar uma IA que atue no atendimento ao cliente de forma natural e versátil, otimizando o ciclo de vendas completo — desde a saudação até o fechamento — sem a rigidez de scripts tradicionais[cite: 2, 4].

---

## 2. Funcionalidades da IA
A "Bia" utiliza um conjunto de ferramentas para garantir precisão e humanização no atendimento:

* [cite_start]**Consulta Semântica (RAG):** Integração com banco de dados **Supabase** para realizar buscas vetoriais[cite: 5, 8]. Isso permite validar em tempo real:
    * [cite_start]Nomes e informações nutricionais[cite: 6].
    * [cite_start]Precificação dinâmica (preços normais e descontos)[cite: 6].
    * [cite_start]Níveis de estoque e sabores disponíveis[cite: 6].
* [cite_start]**Apresentação Visual:** Uso da ferramenta `enviarImagem` para disparar fotos dos produtos armazenadas no Supabase[cite: 9].
* [cite_start]**Registro de Pedidos:** Coleta de dados e formalização da transação via ferramenta `registrarPedido`, com integração direta ao CRM[cite: 15, 16].
* **Transferência Humana:** Acionamento da ferramenta `transferirAtendimento` em casos de:
    * [cite_start]Solicitação de comunicação por áudio pelo cliente[cite: 12].
    * [cite_start]Limitações técnicas da IA ou demandas complexas[cite: 13, 14].

---

## 3. Infraestrutura Tecnológica
[cite_start]A solução é orquestrada pelo **n8n** e utiliza as seguintes tecnologias[cite: 27, 29]:

| Componente | Tecnologia | Função |
| :--- | :--- | :--- |
| **Hospedagem** | Hostinger (VPS) e EasyPanel | [cite_start]Gerenciamento de servidor e aplicações[cite: 28]. |
| **Inteligência Artificial** | OpenAI (GPT-4o mini, Whisper, Vision) | [cite_start]Geração de texto, transcrição de áudios e análise de imagens[cite: 31, 32, 33, 34]. |
| **Banco de Dados** | Supabase (PostgreSQL) | [cite_start]Gestão de leads, estoque, Vector Store (RAG) e memória de longo prazo[cite: 35, 36, 37, 38, 39]. |
| **Cache/Memória** | Redis | [cite_start]"Memória curta" para agrupar mensagens e evitar respostas fragmentadas[cite: 40]. |
| **Comunicação** | API Não Oficial (uazapi) | [cite_start]Conexão entre o número de WhatsApp e o n8n via Webhooks[cite: 30, 68]. |

---

## 4. Fluxo de Automação (Passo a Passo)

1.  [cite_start]**Triagem:** O Webhook recebe a mensagem, identifica o lead no Supabase e verifica se o atendimento já foi transferido para um humano[cite: 43, 44, 45].
2.  [cite_start]**Tratamento Multicanal:** Transcrição de áudios e descrição de imagens para consolidar uma mensagem de texto final[cite: 47, 48].
3.  [cite_start]**Agrupamento (Redis):** O fluxo aguarda (ex: 15 segundos) para agrupar múltiplas mensagens do usuário em um único contexto[cite: 50, 51].
4.  [cite_start]**Processamento da IA:** O agente consulta o histórico e a base de conhecimento para gerar uma resposta baseada em fatos, evitando "alucinações" de preços[cite: 7, 53, 54].
5.  [cite_start]**Envio Humanizado:** A resposta é dividida em blocos menores com tempos de espera dinâmicos, simulando a digitação humana através de JavaScript[cite: 56, 57].
6.  **Subfluxos Especializados:**
    * [cite_start]**Consulta Comercial:** Realiza a busca técnica e devolve uma "etiqueta de venda" formatada[cite: 63, 64].
    * [cite_start]**Registro de Pedido:** Salva telefone, endereço, itens, forma de pagamento e prazo de recompra (estratégia de LTV) no CRM[cite: 17, 20, 23, 24].
    * [cite_start]**Notificação de Transferência:** Gera um resumo da conversa para o atendente humano quando necessário[cite: 59, 61].

---

## 5. Workflow de LTV e Recompra (Retenção)
Este fluxo opera paralelamente à BIA, executando uma varredura diária no CRM para engajar o cliente com base no consumo estimado de suplementos.

* **Cronograma Diário (Schedule Trigger):** Roda todos os dias de manhã para processar os prazos de recompra dos pedidos finalizados.
* **Consulta Inteligente (Supabase View `vw_ltv_recompra_suplementos`):** Realiza `JOIN` entre `pedidos`, `itens_pedido` e `products` com as seguintes regras de robustez:
    * **LEFT JOIN em `products`:** Pedidos cujo produto não está no catálogo não são descartados silenciosamente.
    * **Prazo com COALESCE:** Usa `COALESCE(ip.prazo_recompra_dias, pr.prazo_produto_dias, 30)` — prioriza o prazo gravado pela BIA no item, faz fallback no prazo do catálogo e usa 30 dias como valor padrão.
    * **Filtro de categoria robusto:** Filtra `pr.category ILIKE '%suplemento%'` OU detecta suplementos pelo nome do produto (whey, creatina, proteína, pré-treino, bcaa, etc.) quando o produto não está no catálogo.
    * **Multi-status:** Aceita pedidos com status `finalizado`, `pago`, `entregue`, `concluido` ou `concluído`.
    * **Nome do cliente com fallback:** `COALESCE(p.nome_cliente, l."Nome", 'Cliente')` via LEFT JOIN em `leads`.
    * **Categorias padronizadas:** Todos os produtos do catálogo estão com `category = 'Suplementos'` (normalizado em 2026-04-30).
* **Três Estágios de Engajamento:**
    1. **Dia 01 (Pós-Venda Imediato):** Mensagem de agradecimento com dica de uso técnica e de valor baseada no produto.
    2. **Follow-up (Metade do Prazo):** `dias_passados = FLOOR(menor_prazo / 2)` — mensagem rápida de satisfação.
    3. **Alerta de Recompra (Prazo Final - 5 dias):** `dias_passados = menor_prazo - 5` — abordagem estratégica oferecendo reposição com cashback.
* **Integração Fluida com a BIA (Memória Cache):** Ao enviar a mensagem ativa via API WhatsApp, o fluxo insere instantaneamente o registro do disparo na tabela `memory` do Supabase. Assim, caso o cliente responda à mensagem (ex: na fase de follow-up, ele já decida fazer um novo pedido, mesmo sem ter acabado o estoque), a inteligência da BIA lê esse contexto e assume as vendas perfeitamente, sem perda de continuidade.