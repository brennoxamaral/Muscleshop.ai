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
  chartData: Array<{ time: string; value: number }>;
}

export interface RepurchaseCustomer {
  pedido_id: string;
  telefone: string;
  nome_cliente: string;
  data_pedido: string;
  menor_prazo: number;
  produtos: string;
  dias_passados: number;
  etapa_funil: string;
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
      .in('status', ['finalizado', 'pago', 'entregue', 'concluido', 'concluído']);

    let repeatCustomers = 0;
    let repeatRevenue = 0;

    if (pedidosData) {
      const leadOrders: Record<string, number> = {};
      const leadRevenue: Record<string, number> = {};

      pedidosData.forEach(p => {
        if (p.lead_id) {
          leadOrders[p.lead_id] = (leadOrders[p.lead_id] || 0) + 1;
          // Soma toda a receita do cliente
          leadRevenue[p.lead_id] = (leadRevenue[p.lead_id] || 0) + Number(p.valor_total || 0);
        }
      });

      for (const lead_id in leadOrders) {
        if (leadOrders[lead_id] > 1) {
          repeatCustomers++;
          // Se quisermos apenas a receita DA RECOMPRA (e não a total do cliente recorrente), a lógica exata já está na nossa nova View.
          // Mas como kpi geral, podemos manter a soma aqui para simplificar ou usar a view para tudo.
          // Aqui continuaremos com a receita total dos clientes que recompram para a métrica de "Faturamento Recompra" (ou poderíamos fazer uma query extra).
          // Pela lógica anterior, repeatRevenue estava somando tudo.
        }
      }
    }

    // Buscando dados reais do gráfico de recompra
    const { data: historicoRecompra } = await supabase
      .from('vw_faturamento_recompra_mensal')
      .select('mes, faturamento')
      .order('mes', { ascending: true });

    let chartData: Array<{ time: string; value: number }> = [];

    // Formatar meses
    const mesesPtBr = {
      '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', 
      '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago', 
      '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
    };

    if (historicoRecompra && historicoRecompra.length > 0) {
      chartData = historicoRecompra.map((item: any) => {
        const [ano, mes] = item.mes.split('-');
        return {
          time: `${mesesPtBr[mes as keyof typeof mesesPtBr]}/${ano.slice(2)}`,
          value: Number(item.faturamento || 0)
        };
      });
      
      // Atualizando repeatRevenue para ser estritamente o faturamento gerado APENAS pelos pedidos de recompra
      repeatRevenue = historicoRecompra.reduce((acc, curr) => acc + Number(curr.faturamento), 0);
    } else {
      // Fallback visual vazio para o gráfico quando não há dados reais ainda
      const mesAtual = new Date().getMonth() + 1;
      const chaveMes = mesAtual.toString().padStart(2, '0') as keyof typeof mesesPtBr;
      chartData = [
        { time: mesesPtBr[chaveMes], value: 0 }
      ];
      repeatRevenue = 0;
    }

    return {
      repeatCustomers,
      repeatRevenue,
      automatedRemindersSent: repeatCustomers * 2,
      chartData
    };
  },

  async getRepurchaseCustomers(): Promise<RepurchaseCustomer[]> {
    const { data } = await supabase
      .from('vw_ltv_recompra_suplementos')
      .select('*')
      .order('dias_passados', { ascending: false });

    if (!data) return [];

    return data.map(customer => {
      let etapa = 'Indefinida';
      const { dias_passados, menor_prazo } = customer;

      if (dias_passados <= 3) {
        etapa = 'Pós-venda';
      } else if (dias_passados > 3 && dias_passados <= 14) {
        etapa = 'Follow-up de Satisfação';
      } else if (dias_passados > 14 && dias_passados < (menor_prazo - 3)) {
        etapa = 'Nutrição';
      } else if (dias_passados >= (menor_prazo - 3) && dias_passados < menor_prazo) {
        etapa = 'Janela de Recompra';
      } else if (dias_passados >= menor_prazo) {
        etapa = 'Atrasado / Perdido';
      }

      return {
        ...customer,
        etapa_funil: etapa
      };
    });
  }
};
