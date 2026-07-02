import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminSidebar from '../../components/AdminSidebar';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function AdminForecast() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/predictions/forecast').then(res => {
      const historical = res.data.historical.map(h => ({
        date: h.date,
        actual: h.rate,
        predicted: null
      }));
      const forecast = res.data.forecast.map(f => ({
        date: f.date,
        actual: null,
        predicted: f.predicted_price
      }));
      setData([...historical, ...forecast]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8 bg-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Gold Price Forecast</h2>
        <p className="text-sm text-gray-500 mb-6">
          Linear regression model trained on last 30 days — 7 day forecast
        </p>

        {loading ? (
          <p>Loading forecast...</p>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  interval={4}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#B88A10"
                  name="Actual Price"
                  dot={false}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#3B82F6"
                  name="Predicted Price"
                  dot={true}
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-6 bg-white rounded-xl p-6 shadow">
          <h3 className="font-bold text-gray-700 mb-4">7-Day Forecast Table</h3>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Predicted Price (LKR/g)</th>
              </tr>
            </thead>
            <tbody>
              {data.filter(d => d.predicted).map((d, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">{d.date}</td>
                  <td className="p-3 font-medium text-blue-600">
                    LKR {d.predicted?.toLocaleString()}
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