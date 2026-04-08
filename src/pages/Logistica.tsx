import { useState } from 'react';
import { mockPedidos } from '../data/mock';
import { MapPin, Navigation, CheckCircle2 } from 'lucide-react';

export function Logistica() {
  const deliveries = mockPedidos.filter(p => p.tipo_entrega === 'Delivery' && p.status !== 'finalizado');
  const [selectedDelivery, setSelectedDelivery] = useState(deliveries[0]?.id);

  return (
    <div className="h-[calc(100vh-4rem)] -m-8 flex flex-col md:flex-row">
      {/* Lista de Pedidos */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-surface border-r border-white/5 flex flex-col h-full">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">Rotas de Hoje</h2>
          <p className="text-sm text-gray-400 mt-1">{deliveries.length} entregas pendentes</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {deliveries.map(delivery => (
            <div 
              key={delivery.id}
              onClick={() => setSelectedDelivery(delivery.id)}
              className={`p-4 rounded-xl cursor-pointer transition-all ${
                selectedDelivery === delivery.id 
                  ? 'bg-accent/10 border border-accent/30 shadow-[0_0_15px_var(--color-accent-glow)]' 
                  : 'glass hover:border-white/10'
              }`}
            >
              <h3 className="font-semibold text-white">{delivery.nome_cliente}</h3>
              <div className="flex items-start gap-2 mt-2 text-sm text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="line-clamp-2">{delivery.endereco_entrega}</span>
              </div>
              
              {selectedDelivery === delivery.id && (
                <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                  <button className="flex-1 bg-accent text-black py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-accent-hover transition-colors">
                    <Navigation className="w-4 h-4" />
                    Navegar
                  </button>
                  <button className="flex-1 bg-surface-hover text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/5 transition-colors border border-white/5">
                    <CheckCircle2 className="w-4 h-4" />
                    Entregue
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mapa */}
      <div className="flex-1 bg-[#1a1a1a] relative">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 flex-col gap-4">
          <MapPin className="w-12 h-12 opacity-20" />
          <p>Integração com Google Maps</p>
        </div>
        {/* Aqui entraria o iframe ou componente do Google Maps */}
        <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=-23.5505,-46.6333&zoom=13&size=800x800&maptype=roadmap&style=feature:all|element:labels.text.fill|color:0x8ec3b9&style=feature:all|element:labels.text.stroke|color:0x1a3646&style=feature:all|element:labels.icon|visibility:off&style=feature:administrative.country|element:geometry.stroke|color:0x4b6878&style=feature:administrative.land_parcel|element:labels.text.fill|color:0x64779e&style=feature:administrative.province|element:geometry.stroke|color:0x4b6878&style=feature:landscape.man_made|element:geometry.stroke|color:0x334e87&style=feature:landscape.natural|element:geometry|color:0x021019&style=feature:poi|element:geometry|color:0x283d6a&style=feature:poi|element:labels.text.fill|color:0x6f9ba5&style=feature:poi|element:labels.text.stroke|color:0x1d2c4d&style=feature:poi.park|element:geometry.fill|color:0x023e58&style=feature:poi.park|element:labels.text.fill|color:0x3C7680&style=feature:road|element:geometry|color:0x304a7d&style=feature:road|element:labels.text.fill|color:0x98a5be&style=feature:road|element:labels.text.stroke|color:0x1d2c4d&style=feature:road.highway|element:geometry|color:0x2c6675&style=feature:road.highway|element:geometry.stroke|color:0x255763&style=feature:road.highway|element:labels.text.fill|color:0xb0d5ce&style=feature:road.highway|element:labels.text.stroke|color:0x023e58&style=feature:transit|element:labels.text.fill|color:0x98a5be&style=feature:transit|element:labels.text.stroke|color:0x1d2c4d&style=feature:transit.line|element:geometry.fill|color:0x283d6a&style=feature:transit.station|element:geometry|color:0x3a4762&style=feature:water|element:geometry|color:0x0e1626&style=feature:water|element:labels.text.fill|color:0x4e6d70')] bg-cover bg-center opacity-30 mix-blend-luminosity"></div>
      </div>
    </div>
  );
}
