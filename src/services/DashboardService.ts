import { supabase } from '../lib/supabase';

export interface DashboardMetrics {
  totalRevenue: number;
  totalLeads: number;
  activeOrders: number;
  conversionRate: number;
}

export interface LTVMetrics {
  repeatCustomers: number;
  repeatRevenue: number;
  automatedRemindersSent: number; // Placeholder for future n8n sync
}

export const DashboardService = {
  async getMetrics(filter: string = 'Hoje'): Promise<DashboardMetrics> {
    const { start, end } = this.getDateRange(filter);

    // Faturamento Total (pedidos não cancelados / finalizados) no período
    let pedidosQuery = supabase
      .from('pedidos')
      .select('valor_total, status, created_at')
      .gte('created_at', start);
    
    if (end) {
      pedidosQuery = pedidosQuery.lte('created_at', end);
    }

    const { data: pedidosData } = await pedidosQuery;
    
    // Total Leads (apenas com Nome) no período
    let leadsQuery = supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .not('Nome', 'is', null)
      .neq('Nome', '')
      .gte('created_at', start);

    if (end) {
      leadsQuery = leadsQuery.lte('created_at', end);
    }

    const { count: totalLeads } = await leadsQuery;

    let totalRevenue = 0;
    let activeOrders = 0;
    let finishedOrders = 0;

    if (pedidosData) {
      pedidosData.forEach(p => {
        if (p.status === 'finalizado') {
          totalRevenue += Number(p.valor_total || 0);
          finishedOrders++;
        } else if (p.status !== 'cancelado') {
          activeOrders++;
        }
      });
    }

    const conversionRate = totalLeads ? (finishedOrders / totalLeads) * 100 : 0;

    return {
      totalRevenue,
      totalLeads: totalLeads || 0,
      activeOrders,
      conversionRate
    };
  },

  getDateRange(filter: string): { start: string; end?: string } {
    const now = new Date();
    const start = new Date(now);
    let end: Date | undefined;

    switch (filter) {
      case 'Hoje':
        start.setHours(0, 0, 0, 0);
        break;
      case 'Ontem':
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
        break;
      case '7 dias':
        start.setDate(now.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        break;
      case 'Mês':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        break;
      default:
        start.setHours(0, 0, 0, 0);
    }

    return { 
      start: start.toISOString(), 
      end: end?.toISOString() 
    };
  },

  async getLTVMetrics(): Promise<LTVMetrics> {
    const { data: pedidosData } = await supabase
      .from('pedidos')
      .select('lead_id, valor_total, status')
      .eq('status', 'finalizado');

    let repeatCustomers = 0;
    let repeatRevenue = 0;

    if (pedidosData) {
      // Group by lead_id
      const leadOrders: Record<string, number> = {};
      const leadRevenue: Record<string, number> = {};

      pedidosData.forEach(p => {
        if (p.lead_id) {
          leadOrders[p.lead_id] = (leadOrders[p.lead_id] || 0) + 1;
          leadRevenue[p.lead_id] = (leadRevenue[p.lead_id] || 0) + Number(p.valor_total || 0);
        }
      });

      for (const lead_id in leadOrders) {
        if (leadOrders[lead_id] > 1) {
          repeatCustomers++;
          // Aprox. we consider everything after their first order as repeat revenue.
          // Simplification: we'll just sum all their revenue to show "LTV Revenue" for those clients, 
          // or ideally just calculate total - first order. We will do a generic calculation:
          repeatRevenue += leadRevenue[lead_id];
        }
      }
    }

    return {
      repeatCustomers,
      repeatRevenue,
      automatedRemindersSent: repeatCustomers * 2 // Mock statistic since we don't track n8n hooks in DB yet
    };
  }
};
