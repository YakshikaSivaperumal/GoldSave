import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminRates() {
  const [rates, setRates] = useState([]);
  const [form, setForm] = useState({ rate_per_gram: '', date: '' });
  const [message, setMessage] = useState('');

  const fetchRates = () => {
    api.get('/gold-rates/').then(res => setRates(res.data));
  };

  useEffect(() => { fetchRates(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/gold-rates/', {
        rate_per_gram: parseFloat(form.rate_per_gram),
        date: form.date
      });
      setMessage('Rate added successfully!');
      setForm({ rate_per_gram: '', date: '' });
      fetchRates();
    } catch (err) {
      setMessage('Failed to add rate');
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8 bg-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Manage Gold Rates</h2>

        <div className="bg-white rounded-xl p-6 shadow max-w-md mb-8">
          <h3 className="font-bold text-gray-700 mb-4">Add New Rate</h3>
          {message && <p className="text-green-600 text-sm mb-3">{message}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Rate per Gram (LKR)</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.rate_per_gram}
                onChange={e => setForm({ ...form, rate_per_gram: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date</label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2 text-sm"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-700 text-white py-2 rounded hover:bg-yellow-600 text-sm"
            >
              Add Rate
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Rate per Gram (LKR)</th>
              </tr>
            </thead>
            <tbody>
              {rates.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.date}</td>
                  <td className="p-3 font-medium text-yellow-700">
                    LKR {r.rate_per_gram.toLocaleString()}
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