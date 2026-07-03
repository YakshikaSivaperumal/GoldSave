import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminInvestments() {
  const [investments, setInvestments] = useState([]);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchInvestments = () => {
    api.get('/investments/all').then(res => setInvestments(res.data));
  };

  useEffect(() => { fetchInvestments(); }, []);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this investment?')) return;
    await api.patch(`/investments/${id}/approve`);
    fetchInvestments();
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this investment?')) return;
    await api.patch(`/investments/${id}/reject`);
    fetchInvestments();
  };

  const viewReceipt = async (id) => {
    setReceiptLoading(true);
    try {
      const response = await api.get(`/investments/receipt/${id}`, {
        responseType: 'blob'
      });
      const blobUrl = URL.createObjectURL(response.data);
      setReceiptUrl({ url: blobUrl, type: response.data.type });
    } catch (err) {
      alert('Could not load receipt');
    } finally {
      setReceiptLoading(false);
    }
  };

  const closeReceipt = () => {
    if (receiptUrl) URL.revokeObjectURL(receiptUrl.url);
    setReceiptUrl(null);
  };

  // Apply all filters
  const filtered = investments
    .filter(inv => {
      // Status filter
      if (statusFilter !== 'all' && inv.payment_status !== statusFilter) return false;

      // Search filter
      if (search) {
        const q = search.toLowerCase();
        const matchId = String(inv.id).includes(q);
        const matchUser = String(inv.user_id).includes(q);
        const matchRef = inv.bank_reference?.toLowerCase().includes(q);
        if (!matchId && !matchUser && !matchRef) return false;
      }

      // Date from filter
      if (dateFrom) {
        const invDate = new Date(inv.created_at);
        const from = new Date(dateFrom);
        if (invDate < from) return false;
      }

      // Date to filter
      if (dateTo) {
        const invDate = new Date(inv.created_at);
        const to = new Date(dateTo);
        to.setHours(23, 59, 59);
        if (invDate > to) return false;
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

  // Summary stats
  const totalAmount = filtered.reduce((sum, i) => sum + i.amount_lkr, 0);
  const totalGold = filtered.reduce((sum, i) => sum + i.gold_grams, 0);
  const pendingCount = filtered.filter(i => i.payment_status === 'pending').length;

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
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Investment Requests</h2>

        {/* Receipt Modal */}
        {receiptUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-4 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-700">Payment Receipt</h3>
                <button
                  onClick={closeReceipt}
                  className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                >×</button>
              </div>
              {receiptUrl.type === 'application/pdf' ? (
                <iframe
                  src={receiptUrl.url}
                  className="w-full h-96 rounded border"
                  title="Receipt PDF"
                />
              ) : (
                <img
                  src={receiptUrl.url}
                  alt="Payment Receipt"
                  className="w-full rounded border"
                />
              )}
              <button
                onClick={closeReceipt}
                className="mt-4 w-full bg-gray-700 text-white py-2 rounded text-sm hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {receiptLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 text-center">
              <p className="text-gray-700">Loading receipt...</p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-xs text-gray-500">Filtered Results</p>
            <p className="text-xl font-bold text-gray-700">{filtered.length} investments</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="text-xl font-bold text-yellow-700">
              LKR {totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-xs text-gray-500">Pending Approval</p>
            <p className="text-xl font-bold text-orange-500">{pendingCount}</p>
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
                placeholder="Search by ID, User ID or Bank Reference..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 text-gray-400 text-xs">🔍</span>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-2.5 text-gray-400 text-xs"
                >✕</button>
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
                <option value="completed">Completed</option>
                <option value="failed">Failed / Rejected</option>
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
              <label className="block text-xs text-gray-500 mb-1">Date From</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-yellow-500"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date To</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-yellow-500"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Showing {filtered.length} of {investments.length} investments
          </p>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left text-gray-600">ID</th>
                <th className="p-3 text-left text-gray-600">User ID</th>
                <th className="p-3 text-left text-gray-600">Amount</th>
                <th className="p-3 text-left text-gray-600">Gold</th>
                <th className="p-3 text-left text-gray-600">Bank Ref</th>
                <th className="p-3 text-left text-gray-600">Receipt</th>
                <th className="p-3 text-left text-gray-600">Date</th>
                <th className="p-3 text-left text-gray-600">Status</th>
                <th className="p-3 text-left text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(inv => (
                  <tr key={inv.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-gray-500">{inv.id}</td>
                    <td className="p-3">{inv.user_id}</td>
                    <td className="p-3 font-medium">
                      LKR {inv.amount_lkr.toLocaleString()}
                    </td>
                    <td className="p-3">{inv.gold_grams}g</td>
                    <td className="p-3 text-xs text-gray-500">
                      {inv.bank_reference || '—'}
                    </td>
                    <td className="p-3">
                      {inv.receipt_path ? (
                        <button
                          onClick={() => viewReceipt(inv.id)}
                          className="text-blue-600 text-xs underline hover:text-blue-800"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">None</span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-gray-500">
                      {new Date(inv.created_at).toLocaleDateString()}
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
                    <td className="p-3">
                      {inv.payment_status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(inv.id)}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-500"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(inv.id)}
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
                  <td colSpan={9} className="p-8 text-center text-gray-400">
                    <p className="text-3xl mb-2">📭</p>
                    <p>No investments match your filters</p>
                    <button
                      onClick={clearFilters}
                      className="mt-2 text-xs text-yellow-700 underline"
                    >
                      Clear filters
                    </button>
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