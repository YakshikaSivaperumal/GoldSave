import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

export default function Dashboard() {
  const { user } = useAuth();
  const [rate, setRate] = useState(null);
  const [investments, setInvestments] = useState([]);

  useEffect(() => {
    api.get('/gold-rates/latest').then(res => setRate(res.data));
    api.get('/investments/').then(res => setInvestments(res.data));
  }, []);

  const totalGold = investments
    .filter(i => i.payment_status === 'completed')
    .reduce((sum, i) => sum + i.gold_grams, 0);

  const portfolioValue = rate ? (totalGold * rate.rate_per_gram).toFixed(2) : 0;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-yellow-50">
        <h2 className="text-2xl font-bold text-yellow-800 mb-6">
          Welcome, {user?.name}
        </h2>

        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-sm text-gray-500">Total Gold</p>
            <p className="text-2xl font-bold text-yellow-700">{totalGold.toFixed(4)}g</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-sm text-gray-500">Portfolio Value</p>
            <p className="text-2xl font-bold text-yellow-700">LKR {portfolioValue}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-sm text-gray-500">Current Rate</p>
            <p className="text-2xl font-bold text-yellow-700">
              LKR {rate?.rate_per_gram?.toLocaleString()}/g
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}