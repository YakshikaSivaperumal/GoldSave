import { useEffect, useState } from 'react';
import api from '../../api/axios';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminInvestments() {
  const [investments, setInvestments] = useState([]);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  const fetchInvestments = () => {
    api.get('/investments/all').then(res => setInvestments(res.data));
  };

  useEffect(() => { fetchInvestments(); }, []);

  const handleApprove = async (id) => {
    await api.patch(`/investments/${id}/approve`);
    fetchInvestments();
  };

  const handleReject = async (id) => {
    await api.patch(`/investments/${id}/reject`);
    fetchInvestments();
  };

  const viewReceipt = async (id) => {
    setReceiptLoading(true);
    try {
      // Fetch with auth token as a blob
      const response = await api.get(`/investments/receipt/${id}`, {
        responseType: 'blob'
      });

      // Create a local URL from the blob
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
                >
                  ×
                </button>
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

        {/* Loading indicator */}
        {receiptLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 text-center">
              <p className="text-gray-700">Loading receipt...</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">User ID</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Gold</th>
                <th className="p-3 text-left">Bank Ref</th>
                <th className="p-3 text-left">Receipt</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {investments.map(inv => (
                <tr key={inv.id} className="border-t">
                  <td className="p-3">{inv.id}</td>
                  <td className="p-3">{inv.user_id}</td>
                  <td className="p-3">LKR {inv.amount_lkr.toLocaleString()}</td>
                  <td className="p-3">{inv.gold_grams}g</td>
                  <td className="p-3 text-xs text-gray-500">
                    {inv.bank_reference || '-'}
                  </td>
                  <td className="p-3">
                    {inv.receipt_path ? (
                      <button
                        onClick={() => viewReceipt(inv.id)}
                        className="text-blue-600 text-xs underline hover:text-blue-800"
                      >
                        View Receipt
                      </button>
                    ) : (
                      <span className="text-gray-400 text-xs">No receipt</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}