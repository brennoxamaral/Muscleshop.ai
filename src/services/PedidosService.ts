import { supabase } from '../lib/supabase';
import { Pedido, ItemPedido } from '../types/database';

export interface PedidoComItens extends Pedido {
  itens_pedido: ItemPedido[];
}

export const PedidosService = {
  async getPedidos(statusFilter?: string[]): Promise<PedidoComItens[]> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    let query = supabase
      .from('pedidos')
      .select('*, itens_pedido(*)')
      .gte('created_at', twentyFourHoursAgo);

    if (statusFilter && statusFilter.length > 0) {
      query = query.in('status', statusFilter);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pedidos:', error);
      throw error;
    }

    return (data || []) as PedidoComItens[];
  },

  async updateStatus(id: string, newStatus: string): Promise<Pedido | null> {
    const { data, error } = await supabase
      .from('pedidos')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating pedido status:', error);
      throw error;
    }

    return data;
  },

  async createPedido(pedido: Omit<Pedido, 'id' | 'created_at'>, itens: Omit<ItemPedido, 'id' | 'pedido_id'>[]): Promise<Pedido | null> {
    // We can use a transaction via RPC, but for simplicity, we'll insert pedido then itens_pedido
    const { data: novoPedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert([pedido])
      .select()
      .single();

    if (pedidoError) {
      console.error('Error creating pedido:', pedidoError);
      throw pedidoError;
    }

    if (novoPedido && itens.length > 0) {
      const itensToInsert = itens.map(item => ({
        ...item,
        pedido_id: novoPedido.id
      }));

      const { error: itensError } = await supabase
        .from('itens_pedido')
        .insert(itensToInsert);

      if (itensError) {
        console.error('Error inserting itens_pedido:', itensError);
        // Warning: Partial insert. We should ideally use an RPC for atomic transactions
      }
    }

    return novoPedido;
  }
};
