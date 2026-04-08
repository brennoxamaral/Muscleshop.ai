export type LeadStatus = 'novo' | 'atendimento' | 'fechado';
export type PedidoStatus = 'andamento' | 'entrega' | 'finalizado';
export type TipoEntrega = 'Delivery' | 'Retirada';

export interface Lead {
  id: string; // phone number
  nome: string;
  status: LeadStatus;
  created_at: string;
}

export interface PedidoItem {
  id: string;
  pedido_id: string;
  produto: string;
  sabor: string;
  quantidade: number;
  prazo_recompra_dias: number;
}

export interface Pedido {
  id: string;
  lead_id: string;
  nome_cliente: string;
  tipo_entrega: TipoEntrega;
  endereco_entrega: string;
  valor_total: number;
  status: PedidoStatus;
  observacoes: string;
  itens: PedidoItem[];
  created_at: string;
}

export interface RepressedDemand {
  id: string;
  lead_id: string;
  nome_cliente: string;
  produto: string;
  created_at: string;
  notified: boolean;
}
