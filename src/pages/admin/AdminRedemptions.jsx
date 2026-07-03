import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminRedemptions() {
  const [redemptions, setRedemptions] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchRedemptions = () => {
    api.get('/redemptions/all').then(res => setRedemptions(res.data));
  };

  useEffect(() => { fetchRedemptions(); }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this redemption?')) return;
    await api.patch(`/redemptions/${id}/approve`);
    fetchRedemptions();
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this redemption?')) return;
    await api.patch(`/redemptions/${id}/reject`);
    fetchRedemptions();
  };

  // Apply all filters
  const filtered = redemptions
    .filter(r => {
      // Status filter
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;

      // Search by user ID or redemption ID
      if (search) {
        const q = search.toLowerCase();
        const matchId = String(r.id).includes(q);
        const matchUser = String(r.user_id).includes(q);
        if (!matchId && !matchUser) return false;
      }

      // Date from
      if (dateFrom) {
        const rDate = new Date(r.created_at);
        const from = new Date(dateFrom);
        if (rDate < from) return false;
      }

      // Date to
      if (dateTo) {
        const rDate = new Date(r.created_at);
        const to = new Date(dateTo);
        to.setHours(23, 59, 59);
        if (rDate > to) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'highest') return b.grams_requested - a.grams_requested;
      if (sortBy === 'lowest') return a.grams_requested - b.grams_requested;
      return 0;
    });

  // Summary stats
  const totalGrams = filtered.reduce((sum, r) => sum + r.grams_requested, 0);
  const totalValue = filtered.reduce((sum, r) => sum + r.amount_value, 0);
  const pendingCount = filtered.filter(r => r.status === 'pending').length;

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setSortBy('newest');
  };

  const hasFilters = search || statusFilter !== 'all' || dateFrom || dateTo || sortBy !== 'newest';

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8 bg-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Redemption Requests
        </h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-xs text-gray-500">Filtered Results</p>
            <p className="text-xl font-bold text-gray-700">
              {filtered.length} requests
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-xs text-gray-500">Total Gold</p>
            <p className="text-xl font-bold text-yellow-700">
              {totalGrams.toFixed(4)}g
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-xs text-gray-500">Pending Approval</p>
            <p className="text-xl font-bold text-orange-500">
              {pendingCount}
            </p>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="bg-white rounded-xl p-4 shadow mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-700">Filters</h3>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 hover:text-red-700"
              >
                ✕ Clear All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Search */}
            <div className="relative col-span-2">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-8 text-sm outline-none focus:border-yellow-500"
                placeholder="Search by Redemption ID or User ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 text-gray-400 text-xs">
                🔍
              </span>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 text-gray-400 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-yellow-500"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Sort By</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-yellow-500"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Grams</option>
                <option value="lowest">Lowest Grams</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Date From
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-yellow-500"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Date To
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-yellow-500"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Showing {filtered.length} of {redemptions.length} redemptions
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-gray-600">ID</th>
                <th className="p-3 text-left text-gray-600">User ID</th>
                <th className="p-3 text-left text-gray-600">Grams</th>
                <th className="p-3 text-left text-gray-600">Value (LKR)</th>
                <th className="p-3 text-left text-gray-600">Date</th>
                <th className="p-3 text-left text-gray-600">Status</th>
                <th className="p-3 text-left text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(r => (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-gray-500">{r.id}</td>
                    <td className="p-3">{r.user_id}</td>
                    <td className="p-3 font-medium">{r.grams_requested}g</td>
                    <td className="p-3">
                      LKR {r.amount_value.toLocaleString()}
                    </td>
                    <td className="p-3 text-xs text-gray-500">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        r.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : r.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {r.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(r.id)}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-500"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(r.id)}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-500"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    <p className="text-3xl mb-2">📭</p>
                    <p>No redemptions match your filters</p>
                    {hasFilters && (
                      <button
                        onClick={clearFilters}
                        className="mt-2 text-xs text-yellow-700 underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total value summary at bottom */}
        {filtered.length > 0 && (
          <div className="mt-4 bg-white rounded-xl p-4 shadow flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Total value of filtered redemptions
            </p>
            <p className="font-bold text-yellow-700">
              LKR {totalValue.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}