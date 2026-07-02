import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import {
  getNameError, getEmailError, getPasswordError,
  getPhoneError, getNICError
} from '../utils/validation';

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=form, 2=otp, 3=done
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    phone: '', nic: ''
  });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const validate = () => {
    const newErrors = {
      name: getNameError(form.name),
      email: getEmailError(form.email),
      password: getPasswordError(form.password),
      phone: getPhoneError(form.phone),
      nic: getNICError(form.nic),
    };
    setErrors(newErrors);
    return Object.values(newErrors).every(e => e === '');
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  // Step 1 — Validate form and send OTP
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      await api.post(`/auth/send-otp?phone=${form.phone}`);
      setOtpSent(true);
      setStep(2);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to send OTP';
      if (detail.toLowerCase().includes('phone')) {
        setErrors(prev => ({ ...prev, phone: detail }));
      } else {
        setServerError(detail);
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Verify OTP then register
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerError('');
    try {
      // Verify OTP first
      await api.post(
        `/auth/verify-otp?phone=${form.phone}&otp=${otp}`
      );

      // Then register
      await api.post('/auth/register', form);
      setStep(3);

    } catch (err) {
      const detail = err.response?.data?.detail || 'Verification failed';
      if (detail.toLowerCase().includes('email')) {
        setErrors(prev => ({ ...prev, email: detail }));
        setStep(1);
      } else if (detail.toLowerCase().includes('nic')) {
        setErrors(prev => ({ ...prev, nic: detail }));
        setStep(1);
      } else {
        setServerError(detail);
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    try {
      await api.post(`/auth/send-otp?phone=${form.phone}`);
      setServerError('');
      alert('OTP resent successfully!');
    } catch (err) {
      setServerError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', placeholder: 'e.g. Kamal Perera' },
    { key: 'email', label: 'Email Address', type: 'email', placeholder: 'e.g. kamal@gmail.com' },
    { key: 'password', label: 'Password', type: 'password', placeholder: 'Min 8 characters with a number' },
    { key: 'phone', label: 'Phone Number', type: 'text', placeholder: 'e.g. 0771234567' },
    { key: 'nic', label: 'NIC Number', type: 'text', placeholder: 'e.g. 123456789V or 200012345678' },
  ];

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center py-8">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-6">
          {['Details', 'Verify Phone', 'Done'].map((s, i) => (
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
              {i < 2 && <div className="w-4 h-px bg-gray-300" />}
            </div>
          ))}
        </div>

        {/* Step 1 — Registration Form */}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold text-yellow-800 mb-2">Create Account</h2>
            <p className="text-sm text-gray-500 mb-6">
              Join GoldSave and start investing in gold
            </p>

            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                <p className="text-red-600 text-sm">{serverError}</p>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {fields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    className={`w-full border rounded px-3 py-2 text-sm outline-none transition
                      ${errors[field.key]
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-300 focus:border-yellow-500'}`}
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={e => handleChange(field.key, e.target.value)}
                  />
                  {errors[field.key] && (
                    <p className="text-red-500 text-xs mt-1">⚠ {errors[field.key]}</p>
                  )}
                </div>
              ))}

              {/* Password strength */}
              {form.password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[
                      form.password.length >= 8,
                      /[A-Z]/.test(form.password),
                      /[0-9]/.test(form.password),
                      /[^A-Za-z0-9]/.test(form.password),
                    ].map((met, i) => (
                      <div key={i}
                        className={`h-1 flex-1 rounded ${met ? 'bg-green-500' : 'bg-gray-200'}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-yellow-700 text-white py-2 rounded hover:bg-yellow-600 text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Continue — Verify Phone'}
              </button>
            </form>

            <p className="text-sm text-center mt-4 text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-yellow-700 font-medium">Login</Link>
            </p>
          </>
        )}

        {/* Step 2 — OTP Verification */}
        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold text-yellow-800 mb-2">Verify Phone</h2>
            <p className="text-sm text-gray-500 mb-6">
              We sent a 6-digit OTP to{' '}
              <strong className="text-gray-700">{form.phone}</strong>
            </p>

            {serverError && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                <p className="text-red-600 text-sm">{serverError}</p>
              </div>
            )}

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  className="w-full border rounded px-3 py-3 text-center text-2xl font-bold tracking-widest outline-none focus:border-yellow-500"
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-yellow-700 text-white py-2 rounded hover:bg-yellow-600 text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
            </form>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Change Details
              </button>
              <button
                onClick={resendOtp}
                disabled={loading}
                className="text-sm text-yellow-700 hover:text-yellow-800 font-medium"
              >
                Resend OTP
              </button>
            </div>
          </>
        )}

        {/* Step 3 — Success */}
        {step === 3 && (
          <div className="text-center py-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">
              Registration Successful!
            </h2>
            <p className="text-sm text-gray-500 mb-2">
              Welcome to GoldSave! Check your email and phone for confirmation.
            </p>
            <p className="text-xs text-gray-400 mb-6">
              A welcome email has been sent to <strong>{form.email}</strong>
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-yellow-700 text-white py-2 rounded hover:bg-yellow-600 text-sm font-medium"
            >
              Login to Your Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}