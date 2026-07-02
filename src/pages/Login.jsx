import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getEmailError } from '../utils/validation';

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
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h2 className="text-2xl font-bold text-yellow-800 mb-2">
          Welcome to GoldSave
        </h2>
        <p className="text-sm text-gray-500 mb-6">Login to your account</p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              className={`w-full border rounded px-3 py-2 text-sm outline-none
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

          <div className="relative">
  <label className="block text-sm font-medium text-gray-600 mb-1">
    Password
  </label>

  <input
    type={showPassword ? "text" : "password"}
    className={`w-full border rounded px-3 py-2 pr-10 text-sm outline-none
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

  {/* Eye Button */}
  <button
    type="button"
    onClick={() => setShowPassword(prev => !prev)}
    className="absolute right-2 top-9 text-gray-500 hover:text-gray-700"
  >
    {showPassword ? (
      // eye off
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7
          1.05-2.42 2.9-4.46 5.25-5.9M9.53 9.53A3 3 0 0114.47 14.47M3 3l18 18" />
      </svg>
    ) : (
      // eye open
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M2.458 12C3.732 7.943 7.523 5 12 5
          c4.477 0 8.268 2.943 9.542 7
          -1.274 4.057-5.065 7-9.542 7
          -4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )}
  </button>

  {errors.password && (
    <p className="text-red-500 text-xs mt-1">⚠ {errors.password}</p>
  )}
</div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-700 text-white py-2 rounded hover:bg-yellow-600 text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-500">
          No account?{' '}
          <Link to="/register" className="text-yellow-700 font-medium">Register</Link>
        </p>
      </div>
    </div>
  );
}