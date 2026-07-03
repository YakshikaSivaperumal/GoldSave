import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEmailError } from '../utils/validation';
import goldBg from '../assets/gold-bg.jpg';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    const newErrors = {
      email: getEmailError(form.email),
      password: !form.password ? 'Password is required' : '',
    };
    setErrors(newErrors);
    return Object.values(newErrors).every(e => e === '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Invalid email or password');
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

      {/* Login Card */}
      <div className="relative z-10 bg-white bg-opacity-95 p-8 rounded-xl shadow-2xl w-full max-w-md mx-4">

        {/* Logo / Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-yellow-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-2xl font-bold">G</span>
          </div>
          <h2 className="text-2xl font-bold text-yellow-800">
            Welcome to GoldSave
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Login to your account
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              className={`w-full border rounded px-3 py-2 text-sm outline-none transition
                ${errors.email
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-300 focus:border-yellow-500'}`}
              placeholder="e.g. kamal@gmail.com"
              value={form.email}
              onChange={e => {
                setForm({ ...form, email: e.target.value });
                setErrors({ ...errors, email: '' });
              }}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">⚠ {errors.email}</p>
            )}
          </div>

          {/* Password with eye toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`w-full border rounded px-3 py-2 pr-10 text-sm outline-none transition
                  ${errors.password
                    ? 'border-red-400 bg-red-50'
                    : 'border-gray-300 focus:border-yellow-500'}`}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => {
                  setForm({ ...form, password: e.target.value });
                  setErrors({ ...errors, password: '' });
                }}
              />
              {/* Eye Icon Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  // Eye with slash (hide)
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478
                      0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3
                      3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88
                      9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59
                      3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943
                      9.543 7a10.025 10.025 0 01-4.132 5.411m0
                      0L21 21" />
                  </svg>
                ) : (
                  // Eye (show)
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478
                      0 8.268 2.943 9.542 7-1.274 4.057-5.064
                      7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">⚠ {errors.password}</p>
            )}
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-xs text-yellow-700 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-700 text-white py-2 rounded hover:bg-yellow-600 text-sm font-medium disabled:opacity-50 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-500">
          No account?{' '}
          <Link
            to="/register"
            className="text-yellow-700 font-medium hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}