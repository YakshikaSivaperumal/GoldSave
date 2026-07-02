import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminRedemptions() {
  const [redemptions, setRedemptions] = useState([]);

  const fetchRedemptions = () => {
    api.get('/redemptions/all').then(res => setRedemptions(res.data));
  };

  useEffect(() => { fetchRedemptions(); }, []);

  const handleApprove = async (id) => {
    await api.patch(`/redemptions/${id}/approve`);
    fetchRedemptions();
  };

  const handleReject = async (id) => {
    await api.patch(`/redemptions/${id}/reject`);
    fetchRedemptions();
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8 bg-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Redemption Requests</h2>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">User ID</th>
                <th className="p-3 text-left">Grams</th>
                <th className="p-3 text-left">Value (LKR)</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.id}</td>
                  <td className="p-3">{r.user_id}</td>
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
                  <td className="p-3">
                    {r.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(r.id)}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-500"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(r.id)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-500"
                        >
                          Reject
                        </button>
                      </div>
                    )}
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