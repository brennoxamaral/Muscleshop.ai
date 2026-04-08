import React, { useState } from 'react';
import { X } from 'lucide-react';
import { RadarService } from '../services/RadarService';

interface NovoRadarModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function NovoRadarModal({ onClose, onSuccess }: NovoRadarModalProps) {
  const [loading, setLoading] = useState(false);
  const [nomeCliente, setNomeCliente] = useState('');
  const [telefone, setTelefone] = useState('');
  const [produto, setProduto] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeCliente.trim() || !telefone.trim() || !produto.trim()) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      await RadarService.createDemandaReprimida(nomeCliente, telefone, produto);
      onSuccess();
    } catch (error) {
      console.error('Error creating demanda:', error);
      alert('Erro ao registrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-white/10 rounded-2xl shadow-xl w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Adicionar Registro</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form id="novo-radar-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Nome do Cliente</label>
              <input 
                type="text" 
                required
                value={nomeCliente}
                onChange={(e) => setNomeCliente(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Telefone (WhatsApp)</label>
              <input 
                type="text" 
                required
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="Ex: 5511999999999"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Produto Desejado</label>
              <input 
                type="text" 
                required
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
                placeholder="Ex: Whey Prime Morango"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
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
            form="novo-radar-form"
            disabled={loading}
            className="bg-accent text-black px-6 py-2 rounded-lg font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Registro'}
          </button>
        </div>
      </div>
    </div>
  );
}
