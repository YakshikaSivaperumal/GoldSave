import { useEffect, useState } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function Forecast() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/predictions/forecast').then(res => {
      const historical = res.data.historical.map(h => ({
        date: h.date, actual: h.rate, predicted: null
      }));
      const forecast = res.data.forecast.map(f => ({
        date: f.date, actual: null, predicted: f.predicted_price
      }));
      setData([...historical, ...forecast]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-yellow-50">
        <h2 className="text-2xl font-bold text-yellow-800 mb-2">AI Gold Price Forecast</h2>
        <p className="text-sm text-gray-500 mb-6">7-day prediction based on historical trends</p>

        {loading ? <p>Loading...</p> : (
          <div className="bg-white rounded-xl p-6 shadow">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#B88A10"
                  name="Actual" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="predicted" stroke="#3B82F6"
                  name="Forecast" strokeDasharray="5 5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}