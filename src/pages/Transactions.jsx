import { useEffect, useState } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

export default function Transactions() {
  const [investments, setInvestments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/investments/').then(res => setInvestments(res.data));
  }, []);

  const filtered = investments
    .filter(inv => {
      if (statusFilter !== 'all' && inv.payment_status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchId = String(inv.id).includes(q);
        const matchRef = inv.bank_reference?.toLowerCase().includes(q);
        if (!matchId && !matchRef) return false;
      }
      if (dateFrom) {
        if (new Date(inv.created_at) < new Date(dateFrom)) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59);
        if (new Date(inv.created_at) > to) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'highest') return b.amount_lkr - a.amount_lkr;
      if (sortBy === 'lowest') return a.amount_lkr - b.amount_lkr;
      return 0;
    });

  const totalInvested = filtered
    .filter(i => i.payment_status === 'completed')
    .reduce((sum, i) => sum + i.amount_lkr, 0);

  const totalGold = filtered
    .filter(i => i.payment_status === 'completed')
    .reduce((sum, i) => sum + i.gold_grams, 0);

  const clearFilters = () => {
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
    setSortBy('newest');
    setSearch('');
  };

  const hasFilters = search || statusFilter !== 'all' || dateFrom || dateTo || sortBy !== 'newest';

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-yellow-50">
        <h2 className="text-2xl font-bold text-yellow-800 mb-6">
          My Transactions
        </h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-xs text-gray-500">Total Transactions</p>
            <p className="text-xl font-bold text-gray-700">
              {filtered.length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-xs text-gray-500">Total Invested</p>
            <p className="text-xl font-bold text-yellow-700">
              LKR {totalInvested.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-xs text-gray-500">Total Gold</p>
            <p className="text-xl font-bold text-yellow-700">
              {totalGold.toFixed(4)}g
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-700">Filters</h3>
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
            {/* Search */}
            <div className="relative col-span-2">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-8 text-sm outline-none focus:border-yellow-500"
                placeholder="Search by transaction ID or bank reference..."
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
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
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
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
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
            Showing {filtered.length} of {investments.length} transactions
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-yellow-100">
              <tr>
                <th className="p-3 text-left text-gray-600">ID</th>
                <th className="p-3 text-left text-gray-600">Date</th>
                <th className="p-3 text-left text-gray-600">Amount (LKR)</th>
                <th className="p-3 text-left text-gray-600">Gold (g)</th>
                <th className="p-3 text-left text-gray-600">Bank Ref</th>
                <th className="p-3 text-left text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(inv => (
                  <tr key={inv.id} className="border-t hover:bg-yellow-50">
                    <td className="p-3 text-gray-500">#{inv.id}</td>
                    <td className="p-3">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 font-medium">
                      LKR {inv.amount_lkr.toLocaleString()}
                    </td>
                    <td className="p-3">{inv.gold_grams}g</td>
                    <td className="p-3 text-xs text-gray-500">
                      {inv.bank_reference || '—'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        inv.payment_status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : inv.payment_status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {inv.payment_status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    <p className="text-3xl mb-2">📭</p>
                    <p>No transactions match your filters</p>
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