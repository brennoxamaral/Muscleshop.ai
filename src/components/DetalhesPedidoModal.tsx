import React from 'react';
import { X, Package, MapPin, DollarSign, Calendar, CreditCard, ClipboardList } from 'lucide-react';
import { PedidoComItens } from '../services/PedidosService';

interface DetalhesPedidoModalProps {
  pedido: PedidoComItens;
  onClose: () => void;
}

export function DetalhesPedidoModal({ pedido, onClose }: DetalhesPedidoModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-white/10 rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Detalhes do Pedido</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Cliente Info */}
          <section className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-accent" />
              Info do Cliente
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-gray-400 mb-1">Nome</span>
                <span className="text-white font-medium">{pedido.nome_cliente || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-gray-400 mb-1">Telefone (Lead ID)</span>
                <span className="text-white font-medium">{pedido.lead_id}</span>
              </div>
              <div>
                <span className="block text-gray-400 mb-1">Data do Pedido</span>
                <span className="text-white font-medium">
                  {new Date(pedido.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          </section>

          {/* Entrega e Pagamento */}
          <section className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-3">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-accent" />
              Entrega & Pagamento
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-gray-400 mb-1">Tipo de Entrega</span>
                <span className="text-white font-medium capitalize">{pedido.tipo_entrega}</span>
              </div>
              <div>
                <span className="block text-gray-400 mb-1">Forma de Pagamento</span>
                <span className="text-white font-medium uppercase">{pedido.forma_pagamento}</span>
              </div>
              {pedido.tipo_entrega === 'delivery' && (
                <div className="col-span-2">
                  <span className="block text-gray-400 mb-1">Endereço de Entrega</span>
                  <div className="flex items-start gap-2 text-white">
                    <MapPin className="w-4 h-4 mt-0.5 text-accent shrink-0" />
                    <span>{pedido.endereco_entrega || 'Não informado'}</span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Observações */}
          {pedido.observacoes && (
            <section className="bg-white/5 rounded-xl p-4 border border-white/5 space-y-2">
              <h3 className="text-sm font-medium text-gray-400">Observações</h3>
              <p className="text-sm text-white">{pedido.observacoes}</p>
            </section>
          )}

          {/* Itens */}
          <section className="space-y-4 pt-2">
            <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-accent" />
              Itens do Pedido ({pedido.itens_pedido?.length || 0})
            </h3>
            
            <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-white/5 text-gray-400">
                  <tr>
                    <th className="px-4 py-2 font-medium">Produto</th>
                    <th className="px-4 py-2 font-medium text-center">Qtd</th>
                    <th className="px-4 py-2 font-medium text-right">Preço (Un)</th>
                    <th className="px-4 py-2 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.itens_pedido && pedido.itens_pedido.length > 0 ? (
                    pedido.itens_pedido.map((item) => (
                      <tr key={item.id} className="border-t border-white/5">
                        <td className="px-4 py-3">
                          {item.produto}
                          {item.sabor && <span className="block text-xs text-gray-500">Sabor: {item.sabor}</span>}
                        </td>
                        <td className="px-4 py-3 text-center">{item.quantidade}</td>
                        <td className="px-4 py-3 text-right">R$ {Number(item.preco_unitario).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-medium">R$ {(item.quantidade * item.preco_unitario).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                        Nenhum item encontrado neste pedido.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="p-4 bg-white/5 flex justify-end items-center gap-4 border-t border-white/10">
                <span className="text-gray-400">Total do Pedido:</span>
                <span className="text-xl font-bold text-accent">R$ {Number(pedido.valor_total).toFixed(2)}</span>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end bg-surface/80 rounded-b-2xl">
          <button 
            type="button"
            onClick={onClose}
            className="bg-white/10 text-white px-6 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
