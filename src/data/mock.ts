import { Lead, Pedido, RepressedDemand } from '../types';
import { subDays, addDays } from 'date-fns';

const now = new Date();

export const mockLeads: Lead[] = [
  { id: '5511999990001', nome: 'João Silva', status: 'novo', created_at: subDays(now, 0).toISOString() },
  { id: '5511999990002', nome: 'Maria Oliveira', status: 'atendimento', created_at: subDays(now, 1).toISOString() },
  { id: '5511999990003', nome: 'Carlos Souza', status: 'fechado', created_at: subDays(now, 2).toISOString() },
  { id: '5511999990004', nome: 'Ana Costa', status: 'novo', created_at: subDays(now, 0).toISOString() },
];

export const mockPedidos: Pedido[] = [
  {
    id: 'p1',
    lead_id: '5511999990003',
    nome_cliente: 'Carlos Souza',
    tipo_entrega: 'Delivery',
    endereco_entrega: 'Rua das Flores, 123 - Centro, São Paulo - SP',
    valor_total: 250.00,
    status: 'andamento',
    observacoes: 'Tocar o interfone 2',
    created_at: subDays(now, 0).toISOString(),
    itens: [
      { id: 'i1', pedido_id: 'p1', produto: 'Whey Protein Isolado', sabor: 'Chocolate', quantidade: 1, prazo_recompra_dias: 30 },
      { id: 'i2', pedido_id: 'p1', produto: 'Creatina Monohidratada', sabor: 'Sem sabor', quantidade: 1, prazo_recompra_dias: 60 }
    ]
  },
  {
    id: 'p2',
    lead_id: '5511999990005',
    nome_cliente: 'Fernanda Lima',
    tipo_entrega: 'Retirada',
    endereco_entrega: '',
    valor_total: 120.00,
    status: 'entrega',
    observacoes: '',
    created_at: subDays(now, 1).toISOString(),
    itens: [
      { id: 'i3', pedido_id: 'p2', produto: 'Pré-Treino', sabor: 'Maçã Verde', quantidade: 1, prazo_recompra_dias: 25 }
    ]
  },
  {
    id: 'p3',
    lead_id: '5511999990006',
    nome_cliente: 'Roberto Alves',
    tipo_entrega: 'Delivery',
    endereco_entrega: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    valor_total: 380.00,
    status: 'finalizado',
    observacoes: 'Deixar na portaria',
    created_at: subDays(now, 2).toISOString(),
    itens: [
      { id: 'i4', pedido_id: 'p3', produto: 'Whey Protein Concentrado', sabor: 'Baunilha', quantidade: 2, prazo_recompra_dias: 45 }
    ]
  }
];

export const mockRepressedDemand: RepressedDemand[] = [
  { id: 'r1', lead_id: '5511999990007', nome_cliente: 'Lucas Mendes', produto: 'Barra de Proteína (Caixa)', created_at: subDays(now, 3).toISOString(), notified: false },
  { id: 'r2', lead_id: '5511999990008', nome_cliente: 'Juliana Castro', produto: 'Multivitamínico', created_at: subDays(now, 5).toISOString(), notified: true },
];
