import { useState, useEffect } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

export default function Redeem() {
  const [grams, setGrams] = useState('');
  const [redemptions, setRedemptions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchRedemptions = () => {
    api.get('/redemptions/').then(res => setRedemptions(res.data));
  };

  useEffect(() => { fetchRedemptions(); }, []);

  const handleRedeem = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await api.post('/redemptions/', { grams_requested: parseFloat(grams) });
      setMessage('Redemption request submitted!');
      setGrams('');
      fetchRedemptions();
    } catch (err) {
      setError(err.response?.data?.detail || 'Redemption failed');
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-yellow-50">
        <h2 className="text-2xl font-bold text-yellow-800 mb-6">Redeem Gold</h2>
        <div className="bg-white rounded-xl p-6 shadow max-w-md mb-8">
          {message && <p className="text-green-600 text-sm mb-4">{message}</p>}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={handleRedeem} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Grams to Redeem</label>
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                className="w-full border rounded px-3 py-2 text-sm"
                value={grams}
                onChange={e => setGrams(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-700 text-white py-2 rounded hover:bg-yellow-600 text-sm"
            >
              Request Redemption
            </button>
          </form>
        </div>

        <h3 className="text-lg font-bold text-yellow-800 mb-3">My Redemptions</h3>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-yellow-100">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Grams</th>
                <th className="p-3 text-left">Value (LKR)</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="p-3">{r.grams_requested}g</td>
                  <td className="p-3">LKR {r.amount_value.toLocaleString()}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      r.status === 'approved' ? 'bg-green-100 text-green-700' :
                      r.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {r.status}
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