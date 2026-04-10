import React, { useState, useEffect } from 'react';
import { Package, MapPin, DollarSign, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { PedidosService, PedidoComItens } from '../services/PedidosService';
import { DetalhesPedidoModal } from '../components/DetalhesPedidoModal';
import { NovoPedidoModal } from '../components/NovoPedidoModal';

const columns = [
  { id: 'pendente', title: 'Pendente' },
  { id: 'andamento', title: 'Em Andamento' },
  { id: 'em_entrega', title: 'Em Entrega' },
  { id: 'finalizado', title: 'Finalizado' },
];

export function Pedidos() {
  const [pedidos, setPedidos] = useState<PedidoComItens[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<PedidoComItens | null>(null);

  const fetchPedidos = async () => {
    try {
      const data = await PedidosService.getPedidos();
      setPedidos(data);
    } catch (error) {
      console.error('Error fetching pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const handleDragStart = (e: React.DragEvent, pedidoId: string) => {
    e.dataTransfer.setData('pedidoId', pedidoId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    const pedidoId = e.dataTransfer.getData('pedidoId');
    // Optimistic update
    setPedidos(pedidos.map(p => 
      p.id === pedidoId ? { ...p, status } : p
    ));
    
    try {
      await PedidosService.updateStatus(pedidoId, status);
    } catch (error) {
      console.error('Error updating status:', error);
      // Revert on error
      fetchPedidos();
    }
  };

  if (loading) {
    return <div className="p-8 text-white">Carregando pedidos...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gestão de Pedidos</h1>
          <p className="text-gray-400 mt-1">Controle o fluxo de preparação e entrega.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-accent text-black px-4 py-2 rounded-lg font-medium hover:bg-accent-hover transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Pedido
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max">
          {columns.map(column => (
            <div 
              key={column.id}
              className="flex flex-col bg-surface/50 rounded-xl border border-white/5 overflow-hidden w-80 shrink-0"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="p-4 border-b border-white/5 bg-surface/80">
                <h3 className="font-semibold text-white flex items-center justify-between">
                  {column.title}
                  <span className="bg-white/10 text-xs py-1 px-2 rounded-full">
                    {pedidos.filter(p => p.status === column.id).length}
                  </span>
                </h3>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {pedidos.filter(p => p.status === column.id).map(pedido => (
                  <div 
                    key={pedido.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, pedido.id)}
                    onClick={() => setSelectedPedido(pedido)}
                    className="glass p-4 rounded-lg cursor-pointer hover:border-accent/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white">{pedido.nome_cliente || 'Cliente'}</h4>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-md font-medium",
                        pedido.tipo_entrega === 'delivery' ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                      )}>
                        {pedido.tipo_entrega === 'delivery' ? 'Delivery' : 'Retirada'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Package className="w-4 h-4" />
                        <span>{pedido.itens_pedido?.length || 0} itens</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <DollarSign className="w-4 h-4" />
                        <span>R$ {Number(pedido.valor_total).toFixed(2)}</span>
                      </div>
                      {pedido.tipo_entrega === 'delivery' && pedido.endereco_entrega && (
                        <div className="flex items-start gap-2 text-sm text-gray-400">
                          <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                          <span className="line-clamp-2">{pedido.endereco_entrega}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {isModalOpen && (
        <NovoPedidoModal 
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchPedidos();
          }}
        />
      )}

      {selectedPedido && (
        <DetalhesPedidoModal
          pedido={selectedPedido}
          onClose={() => setSelectedPedido(null)}
        />
      )}
    </div>
  );
}
