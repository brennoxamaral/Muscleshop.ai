import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Users, ShoppingBag, TrendingUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { DashboardService, DashboardMetrics } from '../services/DashboardService';

// Historical data is now retrieved from the database via DashboardService

export function Dashboard() {
  const [filter, setFilter] = useState('Hoje');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setLoading(true);
      try {
        const data = await DashboardService.getMetrics(filter);
        setMetrics(data);
      } catch (error) {
        console.error('Error loading dashboard metrics', error);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, [filter]);

  const kpis = [
    { title: 'Faturamento', value: `R$ ${metrics?.totalRevenue.toFixed(2) || '0.00'}`, icon: DollarSign, trend: '+12%', isPositive: true },
    { title: 'Total Leads', value: metrics?.totalLeads.toString() || '0', icon: Users, trend: '+5%', isPositive: true },
    { title: 'Pedidos em Andamento', value: metrics?.activeOrders.toString() || '0', icon: ShoppingBag, trend: '-2%', isPositive: false },
    { title: 'Taxa de Conversão', value: `${metrics?.conversionRate.toFixed(1) || '0.0'}%`, icon: TrendingUp, trend: '+8%', isPositive: true },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Operacional</h1>
          <p className="text-gray-400 mt-1">Visão geral do negócio em tempo real.</p>
        </div>
        
        <div className="flex bg-surface rounded-lg p-1 border border-white/5">
          {['Hoje', 'Ontem', '7 dias', 'Mês'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all",
                filter === f 
                  ? "bg-accent text-black shadow-sm" 
                  : "text-gray-400 hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-24 bg-surface/50 rounded-xl"></div>
            <div className="h-24 bg-surface/50 rounded-xl"></div>
            <div className="h-24 bg-surface/50 rounded-xl"></div>
            <div className="h-24 bg-surface/50 rounded-xl"></div>
          </div>
          <div className="h-[400px] bg-surface/50 rounded-xl"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => (
              <div key={i} className="glass rounded-xl p-6 glow-hover">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <kpi.icon className="w-5 h-5 text-accent" />
                  </div>
                  <span className={cn(
                    "text-sm font-medium px-2 py-1 rounded-full",
                    kpi.isPositive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                  )}>
                    {kpi.trend}
                  </span>
                </div>
                <h3 className="text-gray-400 text-sm font-medium">{kpi.title}</h3>
                <p className="text-2xl font-bold text-white mt-1">{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="glass rounded-xl p-6 border border-white/5">
            <h3 className="text-lg font-semibold text-white mb-6">Evolução de Faturamento ({filter})</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.chartData || []} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#888888" 
                    tick={{ fill: '#888888', fontSize: 12 }} 
                    tickMargin={15}
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    tick={{ fill: '#888888', fontSize: 12 }} 
                    tickMargin={15}
                    width={70}
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `R$ ${value}`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161616', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#1EF76A' }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--color-accent)" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                    activeDot={{ r: 6, strokeWidth: 0, fill: "var(--color-accent)" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
