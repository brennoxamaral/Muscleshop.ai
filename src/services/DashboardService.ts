import { supabase } from '../lib/supabase';

export interface DashboardMetrics {
  totalRevenue: number;
  totalLeads: number;
  activeOrders: number;
  conversionRate: number;
  chartData: Array<{ time: string; value: number }>;
  trends: {
    revenue: string;
    leads: string;
    orders: string;
    conversion: string;
  };
}

export interface LTVMetrics {
  repeatCustomers: number;
  repeatRevenue: number;
  automatedRemindersSent: number;
}

export const DashboardService = {
  calculateTrend(current: number, prev: number): string {
    if (prev === 0) {
      return current > 0 ? '+100%' : '0%';
    }
    const diff = current - prev;
    const percent = (diff / prev) * 100;
    const sign = percent > 0 ? '+' : '';
    // Format to 1 decimal place, or int if whole
    return `${sign}${percent.toFixed(1).replace('.0', '')}%`;
  },

  async getMetrics(filter: string = 'Hoje'): Promise<DashboardMetrics> {
    const { current: currentRange, previous: prevRange } = this.getDateRanges(filter);

    let pedidosQuery = supabase
      .from('pedidos')
      .select('valor_total, status, created_at')
      .gte('created_at', prevRange.start);
    
    if (currentRange.end) {
      pedidosQuery = pedidosQuery.lte('created_at', currentRange.end);
    }

    const { data: pedidosData } = await pedidosQuery;
    
    let leadsQuery = supabase
      .from('leads')
      .select('created_at')
      .not('Nome', 'is', null)
      .neq('Nome', '')
      .gte('created_at', prevRange.start);

    if (currentRange.end) {
      leadsQuery = leadsQuery.lte('created_at', currentRange.end);
    }

    const { data: leadsData } = await leadsQuery;

    let totalRevenue = 0;
    let prevRevenue = 0;
    
    let activeOrders = 0;
    let prevActiveOrders = 0;
    
    let finishedOrders = 0;
    let prevFinishedOrders = 0;
    
    const chartDataRaw = new Map<string, { time: string, value: number, sortKey: string }>();

    if (pedidosData) {
      pedidosData.forEach(p => {
        const isCurrent = p.created_at >= currentRange.start && (!currentRange.end || p.created_at <= currentRange.end);
        const isPrev = p.created_at >= prevRange.start && p.created_at <= prevRange.end;

        if (p.status === 'finalizado') {
          const val = Number(p.valor_total || 0);
          
          if (isCurrent) {
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
          }
          if (isPrev) {
            prevRevenue += val;
            prevFinishedOrders++;
          }
        } else if (p.status !== 'cancelado') {
          if (isCurrent) activeOrders++;
          if (isPrev) prevActiveOrders++;
        }
      });
    }

    let totalLeads = 0;
    let prevLeads = 0;

    if (leadsData) {
      leadsData.forEach(l => {
        const isCurrent = l.created_at >= currentRange.start && (!currentRange.end || l.created_at <= currentRange.end);
        const isPrev = l.created_at >= prevRange.start && l.created_at <= prevRange.end;

        if (isCurrent) totalLeads++;
        if (isPrev) prevLeads++;
      });
    }

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
    const prevConversionRate = prevLeads ? (prevFinishedOrders / prevLeads) * 100 : 0;

    return {
      totalRevenue,
      totalLeads,
      activeOrders,
      conversionRate,
      chartData,
      trends: {
        revenue: this.calculateTrend(totalRevenue, prevRevenue),
        leads: this.calculateTrend(totalLeads, prevLeads),
        orders: this.calculateTrend(activeOrders, prevActiveOrders),
        conversion: this.calculateTrend(conversionRate, prevConversionRate)
      }
    };
  },

  getDateRanges(filter: string): { current: { start: string; end?: string }; previous: { start: string; end: string } } {
    const now = new Date();
    const currentStart = new Date(now);
    let currentEnd: Date | undefined;

    const previousStart = new Date(now);
    let previousEnd = new Date(now);

    switch (filter) {
      case 'Hoje':
        currentStart.setHours(0, 0, 0, 0);
        
        previousStart.setDate(now.getDate() - 1);
        previousStart.setHours(0, 0, 0, 0);
        previousEnd = new Date(previousStart);
        previousEnd.setHours(23, 59, 59, 999);
        break;
      case 'Ontem':
        currentStart.setDate(now.getDate() - 1);
        currentStart.setHours(0, 0, 0, 0);
        currentEnd = new Date(currentStart);
        currentEnd.setHours(23, 59, 59, 999);

        previousStart.setDate(now.getDate() - 2);
        previousStart.setHours(0, 0, 0, 0);
        previousEnd = new Date(previousStart);
        previousEnd.setHours(23, 59, 59, 999);
        break;
      case '7 dias':
        currentStart.setDate(now.getDate() - 7);
        currentStart.setHours(0, 0, 0, 0);

        previousStart.setDate(now.getDate() - 14);
        previousStart.setHours(0, 0, 0, 0);
        previousEnd = new Date(currentStart);
        previousEnd.setMilliseconds(-1);
        break;
      case 'Mês':
        currentStart.setDate(1);
        currentStart.setHours(0, 0, 0, 0);

        previousStart.setMonth(now.getMonth() - 1);
        previousStart.setDate(1);
        previousStart.setHours(0, 0, 0, 0);
        previousEnd = new Date(currentStart);
        previousEnd.setMilliseconds(-1);
        break;
      default:
        currentStart.setHours(0, 0, 0, 0);
        previousStart.setDate(now.getDate() - 1);
        previousStart.setHours(0, 0, 0, 0);
        previousEnd = new Date(previousStart);
        previousEnd.setHours(23, 59, 59, 999);
    }

    return { 
      current: { start: currentStart.toISOString(), end: currentEnd?.toISOString() },
      previous: { start: previousStart.toISOString(), end: previousEnd.toISOString() }
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
          repeatRevenue += leadRevenue[lead_id];
        }
      }
    }

    return {
      repeatCustomers,
      repeatRevenue,
      automatedRemindersSent: repeatCustomers * 2
    };
  }
};
