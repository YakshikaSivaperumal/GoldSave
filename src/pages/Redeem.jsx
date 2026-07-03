import { useState, useEffect } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

export default function Redeem() {
  const [grams, setGrams] = useState('');
  const [redemptions, setRedemptions] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchRedemptions = () => {
    api.get('/redemptions/').then(res => setRedemptions(res.data));
  };

  useEffect(() => { fetchRedemptions(); }, []);

  const handleRedeem = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/redemptions/', {
        grams_requested: parseFloat(grams)
      });
      setMessage('Redemption request submitted successfully!');
      setGrams('');
      fetchRedemptions();
    } catch (err) {
      setError(err.response?.data?.detail || 'Redemption failed');
    }
  };

  const filtered = redemptions
    .filter(r => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (dateFrom) {
        if (new Date(r.created_at) < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59);
        if (new Date(r.created_at) > to) return false;
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

  const totalGrams = filtered
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.grams_requested, 0);

  const clearFilters = () => {
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setSortBy('newest');
  };

  const hasFilters = statusFilter !== 'all' || dateFrom || dateTo || sortBy !== 'newest';

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-yellow-50">
        <h2 className="text-2xl font-bold text-yellow-800 mb-6">Redeem Gold</h2>

        {/* Redeem Form */}
        <div className="bg-white rounded-xl p-6 shadow max-w-md mb-8">
          <h3 className="font-bold text-gray-700 mb-4">New Redemption Request</h3>
          {message && (
            <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
              <p className="text-green-600 text-sm">{message}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleRedeem} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Grams to Redeem
              </label>
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                className="w-full border rounded px-3 py-2 text-sm outline-none focus:border-yellow-500 border-gray-300"
                placeholder="e.g. 0.5"
                value={grams}
                onChange={e => setGrams(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-700 text-white py-2 rounded hover:bg-yellow-600 text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Request Redemption'}
            </button>
          </form>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-xs text-gray-500">Total Requests</p>
            <p className="text-xl font-bold text-gray-700">{filtered.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-xs text-gray-500">Approved Grams</p>
            <p className="text-xl font-bold text-green-700">
              {totalGrams.toFixed(4)}g
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-xl font-bold text-orange-500">
              {filtered.filter(r => r.status === 'pending').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-700">
              Filter Redemptions
            </h3>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 hover:text-red-700"
              >
                ✕ Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Status */}
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

          <p className="text-xs text-gray-400 mt-3">
            Showing {filtered.length} of {redemptions.length} redemptions
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-yellow-100">
              <tr>
                <th className="p-3 text-left text-gray-600">ID</th>
                <th className="p-3 text-left text-gray-600">Date</th>
                <th className="p-3 text-left text-gray-600">Grams</th>
                <th className="p-3 text-left text-gray-600">Value (LKR)</th>
                <th className="p-3 text-left text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(r => (
                  <tr key={r.id} className="border-t hover:bg-yellow-50">
                    <td className="p-3 text-gray-500">#{r.id}</td>
                    <td className="p-3">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-medium">{r.grams_requested}g</td>
                    <td className="p-3">
                      LKR {r.amount_value.toLocaleString()}
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
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
      </div>
    </div>
  );
}