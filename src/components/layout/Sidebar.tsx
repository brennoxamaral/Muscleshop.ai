import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, Truck, RefreshCw, Radar } from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Leads', path: '/leads', icon: Users },
  { name: 'Pedidos', path: '/pedidos', icon: ShoppingBag },
  { name: 'Logística', path: '/logistica', icon: Truck },
  { name: 'LTV & Recompra', path: '/ltv', icon: RefreshCw },
  { name: 'Radar de Estoque', path: '/radar', icon: Radar },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 h-screen bg-surface border-r border-white/5 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold tracking-tighter text-white flex items-center gap-2">
          <span className="text-accent">Muscle</span>shop.ai
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-accent/10 text-accent border border-accent/20 shadow-[0_0_10px_var(--color-accent-glow)]" 
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
            A
          </div>
          <div>
            <p className="text-sm font-medium text-white">Admin</p>
            <p className="text-xs text-gray-500">Gestor</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
