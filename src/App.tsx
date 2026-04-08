import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { Pedidos } from './pages/Pedidos';
import { Logistica } from './pages/Logistica';
import { LTV } from './pages/LTV';
import { Radar } from './pages/Radar';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="logistica" element={<Logistica />} />
          <Route path="ltv" element={<LTV />} />
          <Route path="radar" element={<Radar />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
