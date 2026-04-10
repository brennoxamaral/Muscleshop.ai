import { supabase } from '../lib/supabase';
import { Lead } from '../types/database';

export const LeadsService = {
  async getLeads(): Promise<Lead[]> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }

    return data || [];
  },

  async updateStatus(id: string, newStatus: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .update({ Status: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }

    return data;
  },

  async createLead(telefone: string, nome: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .insert([{ id: telefone, Nome: nome, Status: 'novo' }])
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      throw error;
    }

    return data;
  }
};
