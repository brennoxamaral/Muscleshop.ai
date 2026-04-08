import { mockPedidos } from '../data/mock';
import { addDays, differenceInDays } from 'date-fns';
import { MessageCircle, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export function LTV() {
  // Simula o cálculo de recompra
  const repurchases = mockPedidos.flatMap(pedido => 
    pedido.itens.map(item => {
      const dataPedido = new Date(pedido.created_at);
      const dataRecompra = addDays(dataPedido, item.prazo_recompra_dias);
      const diasRestantes = differenceInDays(dataRecompra, new Date());
      
      let status: 'ok' | 'warning' | 'danger' = 'ok';
      if (diasRestantes <= 0) status = 'danger';
      else if (diasRestantes <= 3) status = 'warning';

      return {
        id: item.id,
        cliente: pedido.nome_cliente,
        telefone: pedido.lead_id,
        produto: item.produto,
        diasRestantes,
        status
      };
    })
  ).sort((a, b) => a.diasRestantes - b.diasRestantes);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Inteligência de LTV</h1>
        <p className="text-gray-400 mt-1">Previsão de recompra baseada no consumo de suplementos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass p-6 rounded-xl border-l-4 border-l-red-500">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-red-500 w-5 h-5" />
            <h3 className="text-white font-medium">Atrasados</h3>
          </div>
          <p className="text-3xl font-bold text-white">{repurchases.filter(r => r.status === 'danger').length}</p>
        </div>
        <div className="glass p-6 rounded-xl border-l-4 border-l-orange-500">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-orange-500 w-5 h-5" />
            <h3 className="text-white font-medium">Próximos (3 dias)</h3>
          </div>
          <p className="text-3xl font-bold text-white">{repurchases.filter(r => r.status === 'warning').length}</p>
        </div>
        <div className="glass p-6 rounded-xl border-l-4 border-l-green-500">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="text-green-500 w-5 h-5" />
            <h3 className="text-white font-medium">No Prazo</h3>
          </div>
          <p className="text-3xl font-bold text-white">{repurchases.filter(r => r.status === 'ok').length}</p>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-surface/50 border-b border-white/5">
            <tr>
              <th className="p-4 text-sm font-medium text-gray-400">Cliente</th>
              <th className="p-4 text-sm font-medium text-gray-400">Produto</th>
              <th className="p-4 text-sm font-medium text-gray-400">Status</th>
              <th className="p-4 text-sm font-medium text-gray-400">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {repurchases.map((item) => (
              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4">
                  <p className="font-medium text-white">{item.cliente}</p>
                  <p className="text-sm text-gray-500">{item.telefone}</p>
                </td>
                <td className="p-4 text-gray-300">{item.produto}</td>
                <td className="p-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    item.status === 'danger' && "bg-red-500/10 text-red-400",
                    item.status === 'warning' && "bg-orange-500/10 text-orange-400",
                    item.status === 'ok' && "bg-green-500/10 text-green-400"
                  )}>
                    {item.diasRestantes < 0 
                      ? `Atrasado ${Math.abs(item.diasRestantes)} dias`
                      : item.diasRestantes === 0 
                        ? 'Acaba hoje'
                        : `Faltam ${item.diasRestantes} dias`}
                  </span>
                </td>
                <td className="p-4">
                  <button className="flex items-center gap-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    Lembrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
