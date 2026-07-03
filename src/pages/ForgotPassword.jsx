import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { getPhoneError, getPasswordError } from '../utils/validation';
import goldBg from '../assets/gold-bg.jpg';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const phoneError = getPhoneError(phone);
    if (phoneError) {
      setErrors({ phone: phoneError });
      return;
    }
    setLoading(true);
    setServerError('');
    try {
      await api.post('/auth/forgot-password', { phone });
      setStep(2);
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setErrors({ otp: 'Enter the 6-digit OTP' });
      return;
    }
    setLoading(true);
    setServerError('');
    try {
      await api.post(`/auth/verify-otp?phone=${phone}&otp=${otp}`);
      setStep(3);
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const passError = getPasswordError(newPassword);
    if (passError) {
      setErrors({ password: passError });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    setServerError('');
    try {
      await api.post('/auth/reset-password', {
        phone,
        otp,
        new_password: newPassword
      });
      setStep(4);
    } catch (err) {
      setServerError(err.response?.data?.detail || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { phone });
      setServerError('');
      alert('OTP resent!');
    } catch (err) {
      setServerError('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: `url(${goldBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      {/* Card */}
      <div className="relative z-10 bg-white bg-opacity-95 p-8 rounded-xl shadow-2xl w-full max-w-md mx-4">

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-yellow-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-2xl font-bold">G</span>
          </div>
          <h2 className="text-2xl font-bold text-yellow-800">Reset Password</h2>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {['Phone', 'Verify', 'New Password', 'Done'].map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${step > i + 1 ? 'bg-green-500 text-white' :
                  step === i + 1 ? 'bg-yellow-700 text-white' :
                  'bg-gray-200 text-gray-500'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-xs ${step === i + 1 ? 'text-yellow-700 font-bold' : 'text-gray-400'}`}>
                {s}
              </span>
              {i < 3 && <div className="w-3 h-px bg-gray-300" />}
            </div>
          ))}
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-red-600 text-sm">{serverError}</p>
          </div>
        )}

        {/* Step 1 — Enter Phone */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <p className="text-sm text-gray-500 mb-2">
              Enter your registered phone number to receive an OTP
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                className={`w-full border rounded px-3 py-2 text-sm outline-none transition
                  ${errors.phone
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 focus:border-yellow-500'}`}
                placeholder="e.g. 0771234567"
                value={phone}
                onChange={e => {
                  setPhone(e.target.value);
                  setErrors({});
                }}
                required
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">⚠ {errors.phone}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-700 text-white py-2 rounded hover:bg-yellow-600 text-sm font-medium disabled:opacity-50 transition"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <p className="text-sm text-center text-gray-500">
              Remember password?{' '}
              <Link to="/login" className="text-yellow-700 font-medium hover:underline">
                Login
              </Link>
            </p>
          </form>
        )}

        {/* Step 2 — Enter OTP */}
        {step === 2 && (
          <>
            <p className="text-sm text-gray-500 mb-6 text-center">
              We sent a 6-digit code to{' '}
              <strong className="text-gray-700">{phone}</strong>
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  6-Digit OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  className={`w-full border rounded px-3 py-3 text-center text-2xl
                    font-bold tracking-widest outline-none transition
                    ${errors.otp
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-300 focus:border-yellow-500'}`}
                  placeholder="000000"
                  value={otp}
                  onChange={e => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    setErrors({});
                  }}
                  required
                />
                {errors.otp && (
                  <p className="text-red-500 text-xs mt-1">⚠ {errors.otp}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-yellow-700 text-white py-2 rounded hover:bg-yellow-600 text-sm font-medium disabled:opacity-50 transition"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Change Number
              </button>
              <button
                onClick={resendOtp}
                disabled={loading}
                className="text-sm text-yellow-700 font-medium hover:underline"
              >
                Resend OTP
              </button>
            </div>
          </>
        )}

        {/* Step 3 — New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-sm text-gray-500 mb-2">
              Enter your new password below
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                New Password
              </label>
              <input
                type="password"
                className={`w-full border rounded px-3 py-2 text-sm outline-none transition
                  ${errors.password
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 focus:border-yellow-500'}`}
                placeholder="Min 8 characters with a number"
                value={newPassword}
                onChange={e => {
                  setNewPassword(e.target.value);
                  setErrors({});
                }}
                required
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">⚠ {errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                className={`w-full border rounded px-3 py-2 text-sm outline-none transition
                  ${errors.confirmPassword
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 focus:border-yellow-500'}`}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={e => {
                  setConfirmPassword(e.target.value);
                  setErrors({});
                }}
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  ⚠ {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Password strength */}
            {newPassword && (
              <div className="flex gap-1">
                {[
                  newPassword.length >= 8,
                  /[A-Z]/.test(newPassword),
                  /[0-9]/.test(newPassword),
                  /[^A-Za-z0-9]/.test(newPassword),
                ].map((met, i) => (
                  <div key={i}
                    className={`h-1 flex-1 rounded ${met ? 'bg-green-500' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-700 text-white py-2 rounded hover:bg-yellow-600 text-sm font-medium disabled:opacity-50 transition"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        {/* Step 4 — Success */}
        {step === 4 && (
          <div className="text-center py-4">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">
              Password Reset!
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Your password has been successfully updated.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-yellow-700 text-white py-2 rounded hover:bg-yellow-600 text-sm font-medium transition"
            >
              Login with New Password
            </button>
          </div>
        )}
      </div>
    </div>
  );
}