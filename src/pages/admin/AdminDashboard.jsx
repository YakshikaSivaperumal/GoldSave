import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then(res => setStats(res.data));
  }, []);

  const cards = stats ? [
    { label: 'Total Customers', value: stats.total_customers },
    { label: 'Total Investments', value: stats.total_investments },
    { label: 'Total Gold (g)', value: stats.total_gold_grams + 'g' },
    { label: 'Pending Redemptions', value: stats.pending_redemptions },
  ] : [];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8 bg-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h2>

        <div className="grid grid-cols-4 gap-6">
          {cards.map(card => (
            <div key={card.label} className="bg-white rounded-xl p-6 shadow">
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}