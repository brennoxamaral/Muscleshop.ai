import React, { useState, useEffect } from 'react';
import { LeadsService } from '../services/LeadsService';
import { Lead } from '../types/database';
import { MessageCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type LeadStatus = 'novo' | 'atendimento' | 'fechado';

const columns: { id: LeadStatus; title: string }[] = [
  { id: 'novo', title: 'Novo Contato' },
  { id: 'atendimento', title: 'Em Atendimento' },
  { id: 'fechado', title: 'Venda Fechada' },
];

export function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeads() {
      try {
        const data = await LeadsService.getLeads();
        setLeads(data);
      } catch (error) {
        console.error('Erro ao carregar leads:', error);
      } finally {
        setLoading(false);
      }
    }
    loadLeads();
  }, []);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: LeadStatus) => {
    const leadId = e.dataTransfer.getData('leadId');
    if (!leadId) return;

    // Optimistic update
    setLeads(prev => prev.map(lead => 
      lead.id === leadId ? { ...lead, Status: status } : lead
    ));

    try {
      await LeadsService.updateStatus(leadId, status);
    } catch (error) {
      console.error('Erro ao atualizar status do lead:', error);
      // Ideally revert state on fail
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Gestão de Leads</h1>
        <p className="text-gray-400 mt-1">Acompanhe os contatos vindos do WhatsApp.</p>
      </div>

      {loading ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-full bg-surface/50 rounded-xl border border-white/5 animate-pulse"></div>
          <div className="h-full bg-surface/50 rounded-xl border border-white/5 animate-pulse"></div>
          <div className="h-full bg-surface/50 rounded-xl border border-white/5 animate-pulse"></div>
        </div>
      ) : (
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
                    {leads.filter(l => l.Status === column.id).length}
                  </span>
                </h3>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {leads.filter(l => l.Status === column.id).map(lead => (
                  <div 
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className="glass p-4 rounded-lg cursor-grab active:cursor-grabbing hover:border-accent/30 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-white">{lead.Nome || 'Cliente'}</h4>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lead.created_at ? formatDistanceToNow(new Date(lead.created_at), { locale: ptBR }) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">{lead.id}</p>
                    
                    <a 
                      href={`https://wa.me/${lead.id.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
