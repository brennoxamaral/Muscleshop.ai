import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, ShoppingBag, TrendingUp, RefreshCw, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { DashboardService, LTVMetrics, RepurchaseCustomer } from '../services/DashboardService';

export function LTV() {
  const [metrics, setMetrics] = useState<LTVMetrics | null>(null);
  const [customers, setCustomers] = useState<RepurchaseCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [metricsData, customersData] = await Promise.all([
          DashboardService.getLTVMetrics(),
          DashboardService.getRepurchaseCustomers()
        ]);
        setMetrics(metricsData);
        setCustomers(customersData);
      } catch (error) {
        console.error('Falha ao carregar dados LTV', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
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

  const getBadgeColor = (etapa: string) => {
    switch (etapa) {
      case 'Pós-venda':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Follow-up de Satisfação':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Nutrição':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'Janela de Recompra':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Atrasado / Perdido':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

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
        <>
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

          <div className="glass rounded-xl p-6 border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-6">Evolução do Faturamento de Recompra</h3>
            <div className="h-[300px] w-full">
              {metrics?.chartData && metrics.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.chartData}>
                    <defs>
                      <linearGradient id="colorRecompra" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4ADE80" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#ffffff50" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#ffffff50" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `R$ ${value}`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#4ADE80' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#4ADE80" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRecompra)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Sem dados suficientes para o gráfico
                </div>
              )}
            </div>
          </div>

          <div className="glass rounded-xl border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-lg font-semibold text-white">Base de Clientes - Funil de Recompra</h3>
              <p className="text-sm text-gray-400 mt-1">
                Acompanhe em qual estágio do funil de retenção cada cliente de suplementos se encontra.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-gray-400 text-sm">
                    <th className="p-4 font-medium">Cliente</th>
                    <th className="p-4 font-medium">Data do Pedido</th>
                    <th className="p-4 font-medium">Dias Passados</th>
                    <th className="p-4 font-medium">Vencimento</th>
                    <th className="p-4 font-medium">Etapa do Funil</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        Nenhum cliente encontrado na base de LTV.
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr key={customer.pedido_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <p className="text-white font-medium">{customer.nome_cliente}</p>
                          <p className="text-xs text-gray-500">{customer.telefone}</p>
                        </td>
                        <td className="p-4 text-gray-300">
                          {new Date(customer.data_pedido).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-4 text-gray-300">
                          {customer.dias_passados} dias
                        </td>
                        <td className="p-4 text-gray-300">
                          {customer.menor_prazo} dias
                        </td>
                        <td className="p-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium border",
                            getBadgeColor(customer.etapa_funil)
                          )}>
                            {customer.etapa_funil}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

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
        </>
      )}
    </div>
  );
}
