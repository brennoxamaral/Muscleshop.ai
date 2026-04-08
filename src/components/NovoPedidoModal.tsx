import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { PedidosService } from '../services/PedidosService';
import { ProductsService } from '../services/ProductsService';
import { LeadsService } from '../services/LeadsService';
import { Product } from '../types/database';

interface NovoPedidoModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface ItemForm {
  produto: string;
  preco_unitario: number;
  quantidade: number;
  prazo_recompra_dias: number;
}

export function NovoPedidoModal({ onClose, onSuccess }: NovoPedidoModalProps) {
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState<Product[]>([]);
  
  const [telefone, setTelefone] = useState('');
  const [nomeCliente, setNomeCliente] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState<'delivery' | 'retirada'>('delivery');
  const [endereco, setEndereco] = useState('');
  const [formaPagamento, setFormaPagamento] = useState<'pix' | 'debito' | 'credito' | 'dinheiro'>('pix');
  const [observacoes, setObservacoes] = useState('');
  
  const [itens, setItens] = useState<ItemForm[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');

  useEffect(() => {
    ProductsService.getProducts().then(setProdutos);
  }, []);

  const handleAddItem = () => {
    if (!produtoSelecionado) return;
    const prod = produtos.find(p => p.id === produtoSelecionado);
    if (prod) {
      setItens([...itens, {
        produto: prod.name,
        preco_unitario: prod.sale_price || prod.price,
        quantidade: 1,
        prazo_recompra_dias: prod.prazo_produto_dias || 30
      }]);
      setProdutoSelecionado(''); // reset after add
    }
  };

  const handleRemoveItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleItemQuantidadeChange = (index: number, qty: number) => {
    const newItens = [...itens];
    newItens[index].quantidade = qty;
    setItens(newItens);
  };

  const calcularTotal = () => {
    return itens.reduce((acc, item) => acc + (item.preco_unitario * item.quantidade), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telefone.trim() || !nomeCliente.trim() || itens.length === 0) {
      alert('Preencha os dados do cliente e adicione pelo menos um item.');
      return;
    }

    setLoading(true);
    try {
      // 1. Check or create Lead. Telefone usually has some formatting, but let's keep it simple.
      const telefoneClean = telefone.replace(/\D/g, ''); // just numbers, assuming ID is clean digits? 
      // Actually Lead ID could be string with spaces, let's keep it as typed, but the DB expects string id: phone.
      
      const leads = await LeadsService.getLeads();
      const existingLead = leads.find(l => l.id === telefone || l.id === telefoneClean);
      const leadIdToUse = existingLead ? existingLead.id : (telefoneClean || telefone);

      if (!existingLead) {
        try {
          await LeadsService.createLead(leadIdToUse, nomeCliente);
        } catch (err) {
          console.log('Lead could already exist or error:', err);
          // Proceed anyway
        }
      }

      // 2. Create Pedido
      const valorTotal = calcularTotal();
      
      await PedidosService.createPedido({
        lead_id: leadIdToUse,
        nome_cliente: nomeCliente,
        tipo_entrega: tipoEntrega,
        endereco_entrega: tipoEntrega === 'delivery' ? endereco : null,
        forma_pagamento: formaPagamento,
        valor_total: valorTotal,
        status: 'pendente',
        observacoes: observacoes || null
      }, itens.map(item => ({
        produto: item.produto,
        sabor: null,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        prazo_recompra_dias: item.prazo_recompra_dias
      })));

      onSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Erro ao criar pedido. Veja o console para detalhes.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-white/10 rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Criar Novo Pedido</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="novo-pedido-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Cliente */}
            <section className="space-y-4">
              <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Telefone (WhatsApp)</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: 5511999999999"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nome do Cliente</label>
                  <input 
                    type="text" 
                    required
                    value={nomeCliente}
                    onChange={(e) => setNomeCliente(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>
            </section>

            {/* Configuração de Entrega & Pagamento */}
            <section className="space-y-4 pt-4">
              <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">Entrega & Pagamento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tipo de Entrega</label>
                  <select 
                    value={tipoEntrega}
                    onChange={(e) => setTipoEntrega(e.target.value as 'delivery' | 'retirada')}
                    className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="delivery">Delivery</option>
                    <option value="retirada">Retirada na Loja</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Forma de Pagamento</label>
                  <select 
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value as 'pix' | 'debito' | 'credito' | 'dinheiro')}
                    className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="pix">PIX</option>
                    <option value="debito">Cartão de Débito</option>
                    <option value="credito">Cartão de Crédito</option>
                    <option value="dinheiro">Dinheiro</option>
                  </select>
                </div>
              </div>
              {tipoEntrega === 'delivery' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Endereço de Entrega</label>
                  <input 
                    type="text" 
                    required={tipoEntrega === 'delivery'}
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              )}
            </section>

            {/* Itens */}
            <section className="space-y-4 pt-4">
              <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">Itens do Pedido</h3>
              
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Buscar Produto</label>
                  <select 
                    value={produtoSelecionado}
                    onChange={(e) => setProdutoSelecionado(e.target.value)}
                    className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Selecione um produto...</option>
                    {produtos.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - R$ {(p.sale_price || p.price).toFixed(2)}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!produtoSelecionado}
                  className="bg-accent/10 text-accent hover:bg-accent/20 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" /> Adicionar
                </button>
              </div>

              {/* Lista de itens */}
              {itens.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden mt-4">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-white/5 text-gray-400">
                      <tr>
                        <th className="px-4 py-2 font-medium">Produto</th>
                        <th className="px-4 py-2 font-medium">Qtd</th>
                        <th className="px-4 py-2 font-medium">Preço (Un)</th>
                        <th className="px-4 py-2 font-medium">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itens.map((item, index) => (
                        <tr key={index} className="border-t border-white/5">
                          <td className="px-4 py-3">{item.produto}</td>
                          <td className="px-4 py-3">
                            <input 
                              type="number" 
                              min="1"
                              value={item.quantidade}
                              onChange={(e) => handleItemQuantidadeChange(index, parseInt(e.target.value) || 1)}
                              className="w-16 bg-surface border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-accent"
                            />
                          </td>
                          <td className="px-4 py-3">R$ {item.preco_unitario.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <button 
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-400 hover:text-red-300 transition-colors p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-4 bg-white/5 flex justify-end items-center gap-4 border-t border-white/10">
                    <span className="text-gray-400">Total do Pedido:</span>
                    <span className="text-xl font-bold text-accent">R$ {calcularTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}
            </section>

            {/* Observacoes */}
            <section className="space-y-4 pt-4">
              <h3 className="text-lg font-medium text-white border-b border-white/10 pb-2">Observações</h3>
              <div>
                <textarea 
                  rows={3}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Instruções para entrega, observações sobre o cliente, etc."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
              </div>
            </section>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-surface/80 rounded-b-2xl">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium text-white hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            form="novo-pedido-form"
            disabled={loading}
            className="bg-accent text-black px-6 py-2 rounded-lg font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Criar Pedido'}
          </button>
        </div>

      </div>
    </div>
  );
}
