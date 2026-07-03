import { useEffect, useState } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

export default function GoldRates() {
  const [rates, setRates] = useState([]);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    api.get('/gold-rates/').then(res => setRates(res.data));
  }, []);

  const filtered = rates
    .filter(r => {
      if (search) {
        const q = search.toLowerCase();
        if (!String(r.rate_per_gram).includes(q) && !r.date.includes(q)) {
          return false;
        }
      }
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo && r.date > dateTo) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'highest') return b.rate_per_gram - a.rate_per_gram;
      if (sortBy === 'lowest') return a.rate_per_gram - b.rate_per_gram;
      return 0;
    });

  const highestRate = filtered.length
    ? Math.max(...filtered.map(r => r.rate_per_gram))
    : 0;
  const lowestRate = filtered.length
    ? Math.min(...filtered.map(r => r.rate_per_gram))
    : 0;
  const latestRate = filtered.length ? filtered[0]?.rate_per_gram : 0;

  const clearFilters = () => {
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setSortBy('newest');
  };

  const hasFilters = search || dateFrom || dateTo || sortBy !== 'newest';

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-yellow-50">
        <h2 className="text-2xl font-bold text-yellow-800 mb-6">
          Gold Rate History
        </h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-xs text-gray-500">Latest Rate</p>
            <p className="text-xl font-bold text-yellow-700">
              LKR {latestRate.toLocaleString()}/g
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-xs text-gray-500">Highest (Filtered)</p>
            <p className="text-xl font-bold text-green-600">
              LKR {highestRate.toLocaleString()}/g
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-xs text-gray-500">Lowest (Filtered)</p>
            <p className="text-xl font-bold text-red-500">
              LKR {lowestRate.toLocaleString()}/g
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
                placeholder="Search by date or rate..."
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
                <option value="highest">Highest Rate</option>
                <option value="lowest">Lowest Rate</option>
              </select>
            </div>

            {/* Placeholder for grid alignment */}
            <div />

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
            Showing {filtered.length} of {rates.length} rates
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-yellow-100">
              <tr>
                <th className="p-3 text-left text-gray-600">Date</th>
                <th className="p-3 text-left text-gray-600">
                  Rate per Gram (LKR)
                </th>
                <th className="p-3 text-left text-gray-600">Change</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((r, index) => {
                  const prev = filtered[index + 1];
                  const change = prev
                    ? r.rate_per_gram - prev.rate_per_gram
                    : null;
                  return (
                    <tr key={r.id} className="border-t hover:bg-yellow-50">
                      <td className="p-3 text-gray-600">{r.date}</td>
                      <td className="p-3 font-medium text-yellow-700">
                        LKR {r.rate_per_gram.toLocaleString()}
                      </td>
                      <td className="p-3">
                        {change !== null ? (
                          <span className={`text-xs font-medium ${
                            change > 0
                              ? 'text-green-600'
                              : change < 0
                              ? 'text-red-500'
                              : 'text-gray-400'
                          }`}>
                            {change > 0 ? '▲' : change < 0 ? '▼' : '—'}{' '}
                            {Math.abs(change).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-400">
                    <p className="text-3xl mb-2">📭</p>
                    <p>No rates match your filters</p>
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