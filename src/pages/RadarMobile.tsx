import React, { useState, useEffect } from 'react';
import { Bell, PackageX, Check, Plus, Trash2, Radar as RadarIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { RadarService } from '../services/RadarService';
import { DemandaReprimida } from '../types/database';
import { NovoRadarModal } from '../components/NovoRadarModal';

export function RadarMobile() {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Carregando Radar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-md mx-auto relative pb-20">
      <header className="mb-6 pt-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-accent flex items-center gap-2">
            <RadarIcon className="w-6 h-6" />
            Radar Estoque
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            {demandas.length === 0 ? 'Nenhum registro pendente.' : `${demandas.length} registros.`}
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-accent/10 text-accent p-2 rounded-xl hover:bg-accent/20 transition-colors"
          title="Adicionar Registro"
        >
          <Plus className="w-6 h-6" />
        </button>
      </header>

      <div className="space-y-4">
        {demandas.map(item => (
          <div key={item.id} className="bg-surface border border-white/10 p-5 rounded-2xl shadow-lg relative">
            
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                    <PackageX className="w-5 h-5 text-gray-400" />
                 </div>
                 <div>
                   <h3 className="font-semibold text-lg text-white leading-tight">{item.produto_desejado}</h3>
                   <span className="text-xs text-gray-500 block mt-1">
                      {formatDistanceToNow(new Date(item.created_at), { locale: ptBR, addSuffix: true })}
                   </span>
                 </div>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
                className="text-red-500/70 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white/5 p-3 rounded-xl mb-4 border border-white/5">
              <div className="text-sm text-gray-300 font-medium mb-1">Cliente Interessado:</div>
              <p className="text-accent text-sm font-semibold">
                {item.nome_cliente}
              </p>
            </div>

            <div className="mt-2">
              {item.status === 'notificado' ? (
                <button disabled className="w-full flex items-center justify-center gap-2 bg-white/5 text-accent border border-accent/20 py-3 rounded-xl text-sm font-medium cursor-not-allowed">
                  <Check className="w-5 h-5" />
                  Notificado
                </button>
              ) : (
                <button 
                  onClick={() => handleNotify(item)}
                  disabled={loadingId === item.id}
                  className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-black font-bold py-3 rounded-xl transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(var(--accent),0.3)]"
                >
                  <Bell className="w-5 h-5" />
                  {loadingId === item.id ? 'Notificando...' : 'Notificar WhatsApp'}
                </button>
              )}
            </div>
          </div>
        ))}
        
        {demandas.length === 0 && (
          <div className="bg-surface/50 border border-white/5 p-8 rounded-2xl text-center text-gray-400 flex flex-col items-center justify-center">
            <PackageX className="w-12 h-12 mb-3 text-white/20" />
            Não há demanda reprimida pendente.
          </div>
        )}
      </div>

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
