import { mockRepressedDemand } from '../data/mock';
import { Bell, PackageX, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Radar() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          Radar de Estoque
          <span className="bg-accent/20 text-accent text-sm px-3 py-1 rounded-full font-medium">
            Demanda Reprimida
          </span>
        </h1>
        <p className="text-gray-400 mt-1">Capture vendas perdidas notificando clientes quando produtos chegarem.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockRepressedDemand.map((item) => (
          <div key={item.id} className="glass p-6 rounded-xl glow-hover">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-white/5">
                <PackageX className="w-5 h-5 text-gray-400" />
              </div>
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(item.created_at), { locale: ptBR, addSuffix: true })}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-1">{item.produto}</h3>
            <p className="text-gray-400 text-sm mb-6">Interesse de: <span className="text-gray-200">{item.nome_cliente}</span></p>

            {item.notified ? (
              <button disabled className="w-full flex items-center justify-center gap-2 bg-surface border border-white/5 text-gray-500 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed">
                <Check className="w-4 h-4" />
                Cliente Notificado
              </button>
            ) : (
              <button className="w-full flex items-center justify-center gap-2 bg-accent text-black hover:bg-accent-hover py-2.5 rounded-lg text-sm font-medium transition-colors">
                <Bell className="w-4 h-4" />
                Notificar Chegada
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
