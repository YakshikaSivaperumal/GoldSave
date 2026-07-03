import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/customers').then(res => setCustomers(res.data));
  }, []);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.nic && c.nic.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8 bg-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Customers</h2>

        {/* Search Bar */}
        <div className="bg-white rounded-xl p-4 shadow mb-4">
          <div className="relative">
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 text-sm outline-none focus:border-yellow-500"
              placeholder="Search by name, email, phone or NIC..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Showing {filtered.length} of {customers.length} customers
          </p>
        </div>

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-gray-600">ID</th>
                <th className="p-3 text-left text-gray-600">Name</th>
                <th className="p-3 text-left text-gray-600">Email</th>
                <th className="p-3 text-left text-gray-600">Phone</th>
                <th className="p-3 text-left text-gray-600">NIC</th>
                <th className="p-3 text-left text-gray-600">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(c => (
                  <tr key={c.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-gray-500">{c.id}</td>
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3">{c.email}</td>
                    <td className="p-3">{c.phone || '—'}</td>
                    <td className="p-3">{c.nic || '—'}</td>
                    <td className="p-3 text-gray-500">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    <p className="text-3xl mb-2">🔍</p>
                    <p>No customers found for "{search}"</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}