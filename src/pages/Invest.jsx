import { useState, useEffect } from 'react';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';

const BANK_DETAILS = {
  bankName: "Commercial Bank of Ceylon",
  accountName: "GoldSave Investments (Pvt) Ltd",
  accountNumber: "1234567890",
  branch: "Colombo Main Branch",
  swiftCode: "CCEYLKLX"
};

export default function Invest() {
  const [step, setStep] = useState(1); // 1=amount, 2=bank details, 3=upload receipt
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState(null);
  const [bankRef, setBankRef] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/gold-rates/latest').then(res => setRate(res.data));
  }, []);

  const goldGrams = rate && amount
    ? (parseFloat(amount) / rate.rate_per_gram).toFixed(4)
    : '0.0000';

  const handleAmountSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) < 100) {
      setError('Minimum investment is LKR 100');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleReceiptSubmit = async (e) => {
    e.preventDefault();
    if (!receipt) {
      setError('Please attach your payment receipt');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('amount_lkr', parseFloat(amount));
      formData.append('bank_reference', bankRef);
      formData.append('receipt', receipt);

      await api.post('/investments/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Investment submitted successfully! Our team will verify your payment and add gold to your portfolio within 24 hours.');
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.detail || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-yellow-50">
        <h2 className="text-2xl font-bold text-yellow-800 mb-2">Invest in Gold</h2>
        <p className="text-sm text-gray-500 mb-6">
          Current Rate:{' '}
          <span className="font-bold text-yellow-700">
            LKR {rate?.rate_per_gram?.toLocaleString()}/g
          </span>
        </p>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {['Amount', 'Bank Transfer', 'Upload Receipt', 'Done'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                ${step > i + 1 ? 'bg-green-500 text-white' :
                  step === i + 1 ? 'bg-yellow-700 text-white' :
                  'bg-gray-200 text-gray-500'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-xs ${step === i + 1 ? 'text-yellow-700 font-bold' : 'text-gray-400'}`}>
                {s}
              </span>
              {i < 3 && <div className="w-6 h-px bg-gray-300" />}
            </div>
          ))}
        </div>

        {/* Step 1 — Enter Amount */}
        {step === 1 && (
          <div className="bg-white rounded-xl p-6 shadow max-w-md">
            <h3 className="font-bold text-gray-700 mb-4">Enter Investment Amount</h3>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <form onSubmit={handleAmountSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Amount (LKR)</label>
                <input
                  type="number"
                  min="100"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 10000"
                  required
                />
              </div>
              {amount && parseFloat(amount) >= 100 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-sm text-yellow-700">
                    You will receive approximately{' '}
                    <strong>{goldGrams}g</strong> of gold
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    At rate: LKR {rate?.rate_per_gram?.toLocaleString()}/g
                  </p>
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-yellow-700 text-white py-2 rounded hover:bg-yellow-600 text-sm"
              >
                Continue to Payment
              </button>
            </form>
          </div>
        )}

        {/* Step 2 — Bank Transfer Details */}
        {step === 2 && (
          <div className="bg-white rounded-xl p-6 shadow max-w-md">
            <h3 className="font-bold text-gray-700 mb-4">Make Bank Transfer</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please transfer <strong className="text-yellow-700">
                LKR {parseFloat(amount).toLocaleString()}
              </strong> to the following account:
            </p>

            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Bank</span>
                <span className="font-medium">{BANK_DETAILS.bankName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Account Name</span>
                <span className="font-medium">{BANK_DETAILS.accountName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Account Number</span>
                <span className="font-bold text-yellow-800 text-base">
                  {BANK_DETAILS.accountNumber}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Branch</span>
                <span className="font-medium">{BANK_DETAILS.branch}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount to Transfer</span>
                <span className="font-bold text-green-700">
                  LKR {parseFloat(amount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-6">
              <p className="text-xs text-blue-700">
                💡 <strong>Important:</strong> Please use your registered name as the transfer reference. Keep your receipt/screenshot for the next step.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded text-sm hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-yellow-700 text-white py-2 rounded text-sm hover:bg-yellow-600"
              >
                I've Made the Transfer
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Upload Receipt */}
        {step === 3 && (
          <div className="bg-white rounded-xl p-6 shadow max-w-md">
            <h3 className="font-bold text-gray-700 mb-4">Upload Payment Receipt</h3>
            <p className="text-sm text-gray-500 mb-4">
              Please attach your bank transfer receipt or screenshot as proof of payment.
            </p>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <form onSubmit={handleReceiptSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Bank Reference / Transaction ID
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={bankRef}
                  onChange={e => setBankRef(e.target.value)}
                  placeholder="e.g. TXN123456789"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Payment Receipt (Image or PDF)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="w-full border rounded px-3 py-2 text-sm"
                  onChange={e => setReceipt(e.target.files[0])}
                  required
                />
                {receipt && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ {receipt.name} selected
                  </p>
                )}
              </div>

              <div className="bg-gray-50 rounded p-3 text-xs text-gray-500">
                <p><strong>Investment Summary:</strong></p>
                <p>Amount: LKR {parseFloat(amount).toLocaleString()}</p>
                <p>Gold: ~{goldGrams}g</p>
                <p>Status: Pending admin verification</p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2 rounded text-sm"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-yellow-700 text-white py-2 rounded text-sm hover:bg-yellow-600 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Investment'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 4 — Success */}
        {step === 4 && (
          <div className="bg-white rounded-xl p-6 shadow max-w-md text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-bold text-green-700 text-lg mb-2">
              Investment Submitted!
            </h3>
            <p className="text-sm text-gray-500 mb-6">{success}</p>
            <div className="bg-yellow-50 rounded p-3 text-sm text-yellow-700 mb-6">
              <p><strong>What happens next?</strong></p>
              <p className="mt-1">Our admin will verify your bank transfer and approve your investment. Gold will be added to your portfolio once confirmed.</p>
            </div>
            <button
              onClick={() => { setStep(1); setAmount(''); setBankRef(''); setReceipt(null); }}
              className="w-full bg-yellow-700 text-white py-2 rounded text-sm hover:bg-yellow-600"
            >
              Make Another Investment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}