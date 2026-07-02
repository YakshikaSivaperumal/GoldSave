import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/invest', label: 'Invest' },
    { path: '/portfolio', label: 'Portfolio' },
    { path: '/transactions', label: 'Transactions' },
    { path: '/redeem', label: 'Redeem' },
    { path: '/gold-rates', label: 'Gold Rates' },
    { path: '/forecast', label: 'AI Forecast' }, 
  ];

  return (
    <div className="w-48 min-h-screen bg-yellow-900 text-yellow-100 flex flex-col">
      <div className="p-4 border-b border-yellow-700">
        <h1 className="text-xl font-bold text-yellow-300">GoldSave</h1>
        <p className="text-xs text-yellow-500 mt-1">{user?.name}</p>
      </div>

      <nav className="flex-1 p-3">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className="block py-2 px-3 rounded mb-1 text-sm hover:bg-yellow-700 transition"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-yellow-700">
        <button
          onClick={handleLogout}
          className="w-full py-2 px-3 text-sm bg-yellow-700 rounded hover:bg-yellow-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}