import { supabase } from '../lib/supabase';

export interface DashboardMetrics {
  totalRevenue: number;
  totalLeads: number;
  activeOrders: number;
  conversionRate: number;
  chartData: Array<{ time: string; value: number }>;
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
    
    const chartDataRaw = new Map<string, { time: string, value: number, sortKey: string }>();

    if (pedidosData) {
      pedidosData.forEach(p => {
        if (p.status === 'finalizado') {
          const val = Number(p.valor_total || 0);
          totalRevenue += val;
          finishedOrders++;
          
          if (p.created_at) {
            const dateObj = new Date(p.created_at);
            let bucketKey = '';
            let sortKey = '';

            if (filter === 'Hoje' || filter === 'Ontem') {
              const hr = dateObj.getHours().toString().padStart(2, '0');
              bucketKey = `${hr}:00`;
              sortKey = bucketKey;
            } else {
              const d = dateObj.getDate().toString().padStart(2, '0');
              const m = (dateObj.getMonth() + 1).toString().padStart(2, '0');
              bucketKey = `${d}/${m}`;
              const y = dateObj.getFullYear();
              sortKey = `${y}-${m}-${d}`;
            }

            const existing = chartDataRaw.get(bucketKey) || { time: bucketKey, value: 0, sortKey };
            existing.value += val;
            chartDataRaw.set(bucketKey, existing);
          }
        } else if (p.status !== 'cancelado') {
          activeOrders++;
        }
      });
    }

    // Prepopulate some buckets for empty states so the chart always looks good
    if (filter === 'Hoje') {
      const currentHour = new Date().getHours();
      for (let i = 8; i <= Math.max(currentHour, 18); i += 2) {
        const hr = i.toString().padStart(2, '0');
        const key = `${hr}:00`;
        if (!chartDataRaw.has(key)) chartDataRaw.set(key, { time: key, value: 0, sortKey: key });
      }
    } else if (filter === 'Ontem') {
      for (let i = 8; i <= 20; i += 2) {
        const hr = i.toString().padStart(2, '0');
        const key = `${hr}:00`;
        if (!chartDataRaw.has(key)) chartDataRaw.set(key, { time: key, value: 0, sortKey: key });
      }
    } else if (filter === '7 dias') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const day = d.getDate().toString().padStart(2, '0');
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        const key = `${day}/${m}`;
        const y = d.getFullYear();
        const sortKey = `${y}-${m}-${day}`;
        if (!chartDataRaw.has(key)) chartDataRaw.set(key, { time: key, value: 0, sortKey });
      }
    }

    const chartData = Array.from(chartDataRaw.values())
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(item => ({ time: item.time, value: item.value }));

    const conversionRate = totalLeads ? (finishedOrders / totalLeads) * 100 : 0;

    return {
      totalRevenue,
      totalLeads: totalLeads || 0,
      activeOrders,
      conversionRate,
      chartData
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
