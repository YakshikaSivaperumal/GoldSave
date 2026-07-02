import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    api.get('/admin/customers').then(res => setCustomers(res.data));
  }, []);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8 bg-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Customers</h2>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Joined</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.id}</td>
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.phone}</td>
                  <td className="p-3">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}