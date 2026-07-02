import { useEffect, useState } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

export default function Transactions() {
  const [investments, setInvestments] = useState([]);

  useEffect(() => {
    api.get('/investments/').then(res => setInvestments(res.data));
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-yellow-50">
        <h2 className="text-2xl font-bold text-yellow-800 mb-6">Transactions</h2>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-yellow-100">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Amount (LKR)</th>
                <th className="p-3 text-left">Gold (g)</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {investments.map(inv => (
                <tr key={inv.id} className="border-t">
                  <td className="p-3">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="p-3">LKR {inv.amount_lkr.toLocaleString()}</td>
                  <td className="p-3">{inv.gold_grams}g</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      inv.payment_status === 'completed' ? 'bg-green-100 text-green-700' :
                      inv.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {inv.payment_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}