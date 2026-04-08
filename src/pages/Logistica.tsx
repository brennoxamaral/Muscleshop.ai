import { useState, useEffect } from 'react';
import { PedidosService, PedidoComItens } from '../services/PedidosService';
import { MapPin, Navigation, CheckCircle2, Package, ShieldCheck, Truck } from 'lucide-react';
import { cn } from '../lib/utils';

export function Logistica() {
  const [deliveries, setDeliveries] = useState<PedidoComItens[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveries();
  }, []);

  async function loadDeliveries() {
    try {
      setLoading(true);
      const data = await PedidosService.getPedidos(['em_entrega']);
      const filtered = data.filter(p => p.tipo_entrega === 'delivery');
      setDeliveries(filtered);
      if (filtered.length > 0 && !selectedDelivery) {
        setSelectedDelivery(filtered[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar entregas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFinalizar(id: string) {
    try {
      await PedidosService.updateStatus(id, 'finalizado');
      // Atualizar lista localmente para refletir de imediato
      const updated = deliveries.filter(d => d.id !== id);
      setDeliveries(updated);
      setSelectedDelivery(updated.length > 0 ? updated[0].id : null);
    } catch (error) {
      console.error('Erro ao finalizar entrega:', error);
    }
  }

  const selectedData = deliveries.find(d => d.id === selectedDelivery);

  return (
    <div className="flex flex-col space-y-6 h-[calc(100vh-4rem)] md:h-[calc(100vh-6rem)]">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Logística e Entregas</h1>
        <p className="text-gray-400 mt-1">Gestão de rotas e acompanhamento de pacotes em tempo real.</p>
      </div>

      <div className="flex-1 glass rounded-2xl overflow-hidden border border-white/10 flex flex-col lg:flex-row shadow-2xl relative">
        {/* Painel Esquerdo: Lista de Rotas */}
        <div className="w-full lg:w-[400px] border-r border-white/10 flex flex-col bg-surface/50 z-10 relative">
          <div className="p-5 border-b border-white/10 bg-surface/80 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-accent" />
              Rotas Pendentes
            </h2>
            <span className="bg-accent/20 text-accent text-xs font-bold px-2 py-1 rounded-full">
              {deliveries.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 bg-white/5 rounded-xl border border-white/5"></div>
                ))}
              </div>
            ) : deliveries.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3 min-h-[300px]">
                <CheckCircle2 className="w-12 h-12 opacity-50 text-accent" />
                <p>Nenhuma entrega pendente.</p>
              </div>
            ) : (
              deliveries.map(delivery => (
                <div 
                  key={delivery.id}
                  onClick={() => setSelectedDelivery(delivery.id)}
                  className={cn(
                    "p-4 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden group",
                    selectedDelivery === delivery.id 
                      ? "bg-accent/10 border-accent/40 shadow-[0_0_15px_var(--color-accent-glow)] border" 
                      : "bg-surface/40 hover:bg-white/5 border border-transparent hover:border-white/10"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-white group-hover:text-accent transition-colors">
                      {delivery.nome_cliente || 'Cliente'}
                    </h3>
                    <span className="text-xs text-gray-500">#{delivery.id.slice(0,6)}</span>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm text-gray-400">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-500 group-hover:text-white transition-colors" />
                    <span className="line-clamp-2">{delivery.endereco_entrega}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Painel Direito: Endereço & Mapa */}
        <div className="flex-1 flex flex-col relative bg-[#0a0a0a]">
          {selectedData ? (
            <>
              {/* Header flutuante transparente do Mapa */}
              <div className="absolute top-4 left-4 right-4 z-20 glass rounded-xl p-4 flex flex-col sm:flex-row shadow-lg sm:items-center justify-between gap-4 border border-white/10">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 drop-shadow-md">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse shadow-[0_0_10px_var(--color-accent)]"></span>
                    Em Rota de Entrega
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-200 drop-shadow-md">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span className="font-medium line-clamp-1">{selectedData.endereco_entrega}</span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedData.endereco_entrega || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-surface hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all border border-white/10 glow-hover shadow-lg"
                  >
                    <Navigation className="w-4 h-4 text-accent" />
                    Navegar
                  </a>
                  <button 
                    onClick={() => handleFinalizar(selectedData.id)}
                    className="bg-accent hover:bg-accent-hover text-black px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_var(--color-accent-glow)] hover:shadow-accent/40"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Finalizar
                  </button>
                </div>
              </div>

              {/* Mapa Placeholder com Efeitos Visuais Premium */}
              <div className="flex-1 relative w-full h-full min-h-[400px]">
                <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=-23.5505,-46.6333&zoom=13&size=800x800&maptype=roadmap&style=feature:all|element:labels.text.fill|color:0x8ec3b9&style=feature:all|element:labels.text.stroke|color:0x1a3646&style=feature:all|element:labels.icon|visibility:off&style=feature:administrative.country|element:geometry.stroke|color:0x4b6878&style=feature:administrative.land_parcel|element:labels.text.fill|color:0x64779e&style=feature:administrative.province|element:geometry.stroke|color:0x4b6878&style=feature:landscape.man_made|element:geometry.stroke|color:0x334e87&style=feature:landscape.natural|element:geometry|color:0x021019&style=feature:poi|element:geometry|color:0x283d6a&style=feature:poi|element:labels.text.fill|color:0x6f9ba5&style=feature:poi|element:labels.text.stroke|color:0x1d2c4d&style=feature:poi.park|element:geometry.fill|color:0x023e58&style=feature:poi.park|element:labels.text.fill|color:0x3C7680&style=feature:road|element:geometry|color:0x304a7d&style=feature:road|element:labels.text.fill|color:0x98a5be&style=feature:road|element:labels.text.stroke|color:0x1d2c4d&style=feature:road.highway|element:geometry|color:0x2c6675&style=feature:road.highway|element:geometry.stroke|color:0x255763&style=feature:road.highway|element:labels.text.fill|color:0xb0d5ce&style=feature:road.highway|element:labels.text.stroke|color:0x023e58&style=feature:transit|element:labels.text.fill|color:0x98a5be&style=feature:transit|element:labels.text.stroke|color:0x1d2c4d&style=feature:transit.line|element:geometry.fill|color:0x283d6a&style=feature:transit.station|element:geometry|color:0x3a4762&style=feature:water|element:geometry|color:0x0e1626&style=feature:water|element:labels.text.fill|color:0x4e6d70')] bg-cover bg-center opacity-40 mix-blend-luminosity"></div>
                
                {/* Overlays de estilo para integrar o mapa orgânicamente ao dark mode */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/60 via-transparent to-[#0a0a0a]/60 pointer-events-none"></div>
                
                {/* Elemento central do mapa */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                   <div className="relative">
                      <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-30"></div>
                      <div className="bg-surface glass p-3 rounded-full border border-accent/40 shadow-[0_0_30px_var(--color-accent-glow)] text-accent relative">
                        <MapPin className="w-8 h-8" />
                      </div>
                   </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center text-gray-500 gap-4 min-h-[400px]">
              <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-700 flex items-center justify-center text-gray-600">
                <Package className="w-8 h-8" />
              </div>
              <p className="text-lg font-medium">Selecione uma rota para ver detalhes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
