import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, ShoppingBag, TrendingUp, RefreshCw, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { DashboardService, LTVMetrics } from '../services/DashboardService';

export function LTV() {
  const [metrics, setMetrics] = useState<LTVMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await DashboardService.getLTVMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Falha ao carregar LTV', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const kpis = [
    { 
      title: 'Faturamento Recompra', 
      value: metrics ? `R$ ${metrics.repeatRevenue.toFixed(2)}` : 'R$ 0,00', 
      icon: DollarSign, 
      trend: '+24%', 
      isPositive: true,
      description: 'Receita gerada a partir da 2ª compra'
    },
    { 
      title: 'Clientes Retidos', 
      value: metrics?.repeatCustomers.toString() || '0', 
      icon: RefreshCw, 
      trend: '+12%', 
      isPositive: true,
      description: 'Clientes que compraram mais de uma vez'
    },
    { 
      title: 'Automações Disparadas', 
      value: metrics?.automatedRemindersSent.toString() || '0', 
      icon: Zap, 
      trend: 'Automatizado', 
      isPositive: true,
      description: 'Lembretes enviados pelo n8n'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard de Retenção (LTV)</h1>
        <p className="text-gray-400 mt-1">Acompanhamento dos resultados da estratégia de recompra automatizada.</p>
      </div>

      {isLoading ? (
        <div className="flex animate-pulse space-x-4">
          <div className="h-32 bg-surface/50 rounded-xl w-full"></div>
          <div className="h-32 bg-surface/50 rounded-xl w-full"></div>
          <div className="h-32 bg-surface/50 rounded-xl w-full"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {kpis.map((kpi, i) => (
            <div key={i} className="glass rounded-xl p-6 glow-hover border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <kpi.icon className="w-5 h-5 text-accent" />
                </div>
                <span className={cn(
                  "text-sm font-medium px-2 py-1 rounded-full bg-accent/10 text-accent"
                )}>
                  {kpi.trend}
                </span>
              </div>
              <h3 className="text-gray-400 text-sm font-medium">{kpi.title}</h3>
              <p className="text-3xl font-bold text-white mt-1">{kpi.value}</p>
              <p className="text-xs text-gray-500 mt-2">{kpi.description}</p>
            </div>
          ))}
        </div>
      )}

      <div className="glass rounded-xl p-6 border border-white/5">
        <h3 className="text-lg font-semibold text-white mb-6">Mecânica Ativa</h3>
        <div className="bg-surface/30 p-4 rounded-lg flex items-start gap-4">
          <div className="bg-green-500/20 p-3 rounded-full">
            <Zap className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h4 className="text-white font-medium">Automação Silenciosa n8n</h4>
            <p className="text-gray-400 text-sm mt-1">
              O sistema calcula automaticamente a fórmula de prazo de recompra dos itens do pedido. 
              Ao atingir o vencimento, o bot da BIA entra em ação pelo WhatsApp de forma autônoma 
              para reengajar o cliente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
