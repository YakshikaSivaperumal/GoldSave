import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/customers', label: 'Customers' },
    { path: '/admin/redemptions', label: 'Redemptions' },
    { path: '/admin/rates', label: 'Gold Rates' },
    { path: '/admin/forecast', label: 'AI Forecast' },
     { path: '/admin/investments', label: 'Investments' },
  ];

  return (
    <div className="w-48 min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-yellow-400">GoldSave</h1>
        <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
        <p className="text-xs text-yellow-500">{user?.name}</p>
      </div>

      <nav className="flex-1 p-3">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className="block py-2 px-3 rounded mb-1 text-sm hover:bg-gray-700 transition"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full py-2 px-3 text-sm bg-gray-700 rounded hover:bg-gray-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}