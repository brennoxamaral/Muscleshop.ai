import { supabase } from '../lib/supabase';
import { DemandaReprimida } from '../types/database';

export const RadarService = {
  async getDemandaReprimida(): Promise<DemandaReprimida[]> {
    const { data, error } = await supabase
      .from('demanda_reprimida')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching demanda_reprimida:', error);
      throw error;
    }

    return data || [];
  },

  async markAsNotified(id: string): Promise<DemandaReprimida | null> {
    const { data, error } = await supabase
      .from('demanda_reprimida')
      .update({ status: 'notificado' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating status:', error);
      throw error;
    }

    return data;
  },

  async createDemandaReprimida(nome: string, telefone: string, produto: string): Promise<DemandaReprimida | null> {
    const { data, error } = await supabase
      .from('demanda_reprimida')
      .insert([{ 
        nome_cliente: nome, 
        telefone_cliente: telefone, 
        produto_desejado: produto,
        status: 'pendente'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating demanda_reprimida:', error);
      throw error;
    }

    return data;
  }
};
