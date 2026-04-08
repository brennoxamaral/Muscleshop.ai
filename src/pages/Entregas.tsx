import React, { useState, useEffect } from 'react';
import { PedidosService, PedidoComItens } from '../services/PedidosService';
import { Package, MapPin, DollarSign, CheckCircle2, Navigation } from 'lucide-react';

export function Entregas() {
  const [pedidos, setPedidos] = useState<PedidoComItens[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPedidos = async () => {
    try {
      // O motoboy só deve ver pedidos que estão "Em Entrega" (status: em_entrega)
      // Ou talvez "andamento" caso esteja roteirizando, mas "em_entrega" é o padrão.
      const data = await PedidosService.getPedidos(['em_entrega']);
      setPedidos(data);
    } catch (error) {
      console.error('Error fetching pedidos para entrega:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const handleFinalizar = async (pedidoId: string) => {
    if (!window.confirm('Tem certeza que deseja finalizar esta entrega?')) return;
    
    // Otimista
    setPedidos(pedidos.filter(p => p.id !== pedidoId));
    
    try {
      await PedidosService.updateStatus(pedidoId, 'finalizado');
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      alert('Erro ao finalizar pedido. Tente novamente.');
      fetchPedidos(); // reverte alteração otimista
    }
  };

  const openMapa = (endereco: string) => {
    const query = encodeURIComponent(endereco);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Carregando Entregas...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 max-w-md mx-auto relative pb-20">
      <header className="mb-6 pt-4">
        <h1 className="text-2xl font-bold tracking-tight text-accent flex items-center gap-2">
          <Navigation className="w-6 h-6" />
          Logística motoboy
        </h1>
        <p className="text-gray-400 mt-1">
          {pedidos.length === 0 ? 'Nenhuma entrega pendente.' : `${pedidos.length} rotas de entrega hoje.`}
        </p>
      </header>

      <div className="space-y-4">
        {pedidos.map(pedido => (
          <div key={pedido.id} className="bg-surface border border-white/10 p-5 rounded-2xl shadow-lg">
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{pedido.nome_cliente || 'Cliente'}</h3>
                <span className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                  <Package className="w-4 h-4" /> 
                  {pedido.itens_pedido?.length || 0} itens
                </span>
              </div>
              <div className="bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                <span className="text-accent font-bold text-sm">
                  R$ {Number(pedido.valor_total).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-xl mb-4 border border-white/5">
              <div className="text-sm text-gray-300 font-medium mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                Endereço
              </div>
              <p className="text-gray-400 text-sm line-clamp-3 ml-6">
                {pedido.endereco_entrega || 'Endereço não informado'}
              </p>
            </div>

            {pedido.observacoes && (
              <div className="mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1 block">Obs:</span>
                <p className="text-sm text-gray-300 italic">"{pedido.observacoes}"</p>
              </div>
            )}

            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => openMapa(pedido.endereco_entrega || '')}
                disabled={!pedido.endereco_entrega}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                Mapa
              </button>
              <button 
                onClick={() => handleFinalizar(pedido.id)}
                className="flex-[2] bg-accent hover:bg-accent-hover text-black font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Finalizar
              </button>
            </div>
          </div>
        ))}
        
        {pedidos.length === 0 && (
          <div className="bg-surface/50 border border-white/5 p-8 rounded-2xl text-center text-gray-400 flex flex-col items-center justify-center">
            <CheckCircle2 className="w-12 h-12 mb-3 text-white/20" />
            Que bom! Todas as entregas já foram finalizadas.
          </div>
        )}
      </div>
    </div>
  );
}
