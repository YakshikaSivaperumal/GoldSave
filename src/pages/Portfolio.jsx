import { useEffect, useState } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

export default function Portfolio() {
  const [investments, setInvestments] = useState([]);
  const [rate, setRate] = useState(null);

  useEffect(() => {
    api.get('/investments/').then(res => setInvestments(res.data));
    api.get('/gold-rates/latest').then(res => setRate(res.data));
  }, []);

  const completed = investments.filter(i => i.payment_status === 'completed');
  const totalGold = completed.reduce((sum, i) => sum + i.gold_grams, 0);
  const totalValue = rate ? (totalGold * rate.rate_per_gram).toFixed(2) : 0;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-yellow-50">
        <h2 className="text-2xl font-bold text-yellow-800 mb-6">My Portfolio</h2>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-sm text-gray-500">Total Gold Owned</p>
            <p className="text-2xl font-bold text-yellow-700">{totalGold.toFixed(4)}g</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-sm text-gray-500">Current Value</p>
            <p className="text-2xl font-bold text-yellow-700">LKR {totalValue}</p>
          </div>
        </div>
      </div>
    </div>
  );
}