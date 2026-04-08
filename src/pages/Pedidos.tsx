import React, { useState } from 'react';
import { mockPedidos } from '../data/mock';
import { Pedido, PedidoStatus } from '../types';
import { Package, MapPin, DollarSign } from 'lucide-react';
import { cn } from '../lib/utils';

const columns: { id: PedidoStatus; title: string }[] = [
  { id: 'andamento', title: 'Em Andamento' },
  { id: 'entrega', title: 'Em Entrega' },
  { id: 'finalizado', title: 'Finalizado' },
];

export function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>(mockPedidos);

  const handleDragStart = (e: React.DragEvent, pedidoId: string) => {
    e.dataTransfer.setData('pedidoId', pedidoId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: PedidoStatus) => {
    const pedidoId = e.dataTransfer.getData('pedidoId');
    setPedidos(pedidos.map(p => 
      p.id === pedidoId ? { ...p, status } : p
    ));
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gestão de Pedidos</h1>
          <p className="text-gray-400 mt-1">Controle o fluxo de preparação e entrega.</p>
        </div>
        <button className="bg-accent text-black px-4 py-2 rounded-lg font-medium hover:bg-accent-hover transition-colors">
          Novo Pedido
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {columns.map(column => (
          <div 
            key={column.id}
            className="flex flex-col bg-surface/50 rounded-xl border border-white/5 overflow-hidden"
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
                  className="glass p-4 rounded-lg cursor-grab active:cursor-grabbing hover:border-accent/30 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-white">{pedido.nome_cliente}</h4>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-md font-medium",
                      pedido.tipo_entrega === 'Delivery' ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                    )}>
                      {pedido.tipo_entrega}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Package className="w-4 h-4" />
                      <span>{pedido.itens.length} itens</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <DollarSign className="w-4 h-4" />
                      <span>R$ {pedido.valor_total.toFixed(2)}</span>
                    </div>
                    {pedido.tipo_entrega === 'Delivery' && (
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
  );
}
