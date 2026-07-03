import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Invest from './pages/Invest';
import Portfolio from './pages/Portfolio';
import Transactions from './pages/Transactions';
import Redeem from './pages/Redeem';
import GoldRates from './pages/GoldRates';
import Forecast from './pages/Forecast';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminRedemptions from './pages/admin/AdminRedemptions';
import AdminRates from './pages/admin/AdminRates';
import AdminForecast from './pages/admin/AdminForecast';
import AdminInvestments from './pages/admin/AdminInvestments';
import ForgotPassword from './pages/ForgotPassword';


// inside Routes:
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Customer */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/invest" element={<PrivateRoute><Invest /></PrivateRoute>} />
          <Route path="/portfolio" element={<PrivateRoute><Portfolio /></PrivateRoute>} />
          <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
          <Route path="/redeem" element={<PrivateRoute><Redeem /></PrivateRoute>} />
          <Route path="/gold-rates" element={<PrivateRoute><GoldRates /></PrivateRoute>} />
          <Route path="/forecast" element={<PrivateRoute><Forecast /></PrivateRoute>} />
          <Route path="/admin/investments" element={<AdminRoute><AdminInvestments /></AdminRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/customers" element={<AdminRoute><AdminCustomers /></AdminRoute>} />
          <Route path="/admin/redemptions" element={<AdminRoute><AdminRedemptions /></AdminRoute>} />
          <Route path="/admin/rates" element={<AdminRoute><AdminRates /></AdminRoute>} />
          <Route path="/admin/forecast" element={<AdminRoute><AdminForecast /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;