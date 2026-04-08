export interface Lead {
  id: string; // phone
  Nome: string | null;
  Status: string | null;
  created_at: string;
}

export interface Pedido {
  id: string;
  lead_id: string;
  tipo_entrega: 'delivery' | 'retirada';
  endereco_entrega: string | null;
  forma_pagamento: 'pix' | 'debito' | 'credito' | 'dinheiro';
  valor_total: number;
  status: string; // pendente, andamento, em_entrega, finalizado
  created_at: string;
  nome_cliente: string | null;
  observacoes: string | null;
}

export interface ItemPedido {
  id: string;
  pedido_id: string;
  produto: string;
  sabor: string | null;
  quantidade: number;
  preco_unitario: number;
  prazo_recompra_dias: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string | null;
  description: string | null;
  price: number;
  sale_price: number | null;
  stock_quantity: number | null;
  category: string | null;
  brand: string | null;
  image_url: string | null;
  is_active: boolean;
  prazo_produto_dias: number | null;
}

export interface DemandaReprimida {
  id: string;
  nome_cliente: string;
  telefone_cliente: string;
  produto_desejado: string;
  status: string; // 'pendente' | 'notificado'
  created_at: string;
}
