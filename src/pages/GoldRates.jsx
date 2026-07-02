import { useEffect, useState } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

export default function GoldRates() {
  const [rates, setRates] = useState([]);

  useEffect(() => {
    api.get('/gold-rates/').then(res => setRates(res.data));
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-yellow-50">
        <h2 className="text-2xl font-bold text-yellow-800 mb-6">Gold Rate History</h2>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-yellow-100">
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