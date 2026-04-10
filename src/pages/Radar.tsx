import { useState, useEffect } from 'react';
import { Bell, PackageX, Check, Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RadarService } from '../services/RadarService';
import { DemandaReprimida } from '../types/database';
import { NovoRadarModal } from '../components/NovoRadarModal';

export function Radar() {
  const [demandas, setDemandas] = useState<DemandaReprimida[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadDemandas = async () => {
    setIsLoading(true);
    try {
      const data = await RadarService.getDemandaReprimida();
      setDemandas(data);
    } catch (error) {
      console.error('Error loading demandas', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDemandas();
  }, []);

  const handleNotify = async (item: DemandaReprimida) => {
    setLoadingId(item.id);
    let phone = item.telefone_cliente.replace(/\D/g, '');
    if (!phone.startsWith('55')) {
      phone = '55' + phone;
    }
    
    const message = `Olá, ${item.nome_cliente}! Temos uma ótima notícia: o produto "${item.produto_desejado}" que você demonstrou interesse acabou de chegar no nosso estoque! 💪 Quer confirmar o seu pedido?`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
    
    try {
      await RadarService.markAsNotified(item.id);
      await loadDemandas();
    } catch (error) {
      console.error('Error marking as notified', error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este registro?')) return;
    
    setDeletingId(id);
    try {
      await RadarService.deleteDemandaReprimida(id);
      await loadDemandas();
    } catch (error) {
      console.error('Error deleting demanda', error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Radar de Estoque
            <span className="bg-accent/20 text-accent text-sm px-3 py-1 rounded-full font-medium">
              Demanda Reprimida
            </span>
          </h1>
          <p className="text-gray-400 mt-1">Capture vendas perdidas notificando clientes quando produtos chegarem.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-accent text-black px-4 py-2 rounded-lg font-medium hover:bg-accent-hover transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Adicionar Registro
        </button>
      </div>

      {isLoading ? (
        <div className="text-gray-500 py-8">Carregando lista de interessados...</div>
      ) : demandas.length === 0 ? (
        <div className="text-gray-500 py-8">Nenhum registro de demanda reprimida encontrado.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {demandas.map((item) => (
            <div key={item.id} className="glass p-6 rounded-xl glow-hover">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center border border-white/5">
                  <PackageX className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(item.created_at), { locale: ptBR, addSuffix: true })}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="text-red-500 hover:text-red-400 p-1 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50"
                    title="Excluir registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-1">{item.produto_desejado}</h3>
              <p className="text-gray-400 text-sm mb-6">Interesse de: <span className="text-gray-200">{item.nome_cliente}</span></p>

              {item.status === 'notificado' ? (
                <button disabled className="w-full flex items-center justify-center gap-2 bg-surface text-accent border border-accent/20 py-2.5 rounded-lg text-sm font-medium cursor-not-allowed">
                  <Check className="w-4 h-4" />
                  Cliente Notificado
                </button>
              ) : (
                <button 
                  onClick={() => handleNotify(item)}
                  disabled={loadingId === item.id}
                  className="w-full flex items-center justify-center gap-2 bg-accent text-black hover:bg-accent-hover py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <Bell className="w-4 h-4" />
                  {loadingId === item.id ? 'Notificando...' : 'Notificar Chegada'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <NovoRadarModal 
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            loadDemandas();
          }}
        />
      )}
    </div>
  );
}
