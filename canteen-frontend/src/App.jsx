import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Sidebar from './components/common/Sidebar';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminDashboard from './components/dashboard/AdminDashboard';
import POSInterface from './components/orders/POSInterface';
import OrderQueue from './components/orders/OrderQueue';
import MenuList from './components/menu/MenuList';
import InventoryTable from './components/inventory/InventoryTable';
import OrdersPage from './pages/OrdersPage';
import ReportsPage from './pages/ReportsPage';

function Layout({ children }) {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/dashboard" />;
  if (user.role === 'cashier') return <Navigate to="/pos" />;
  return <Navigate to="/menu" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/dashboard" element={
        <ProtectedRoute roles={['admin']}>
          <Layout><AdminDashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/inventory" element={
        <ProtectedRoute roles={['admin']}>
          <Layout><InventoryTable /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute roles={['admin']}>
          <Layout><ReportsPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/pos" element={
        <ProtectedRoute roles={['admin', 'cashier']}>
          <Layout><POSInterface /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/queue" element={
        <ProtectedRoute roles={['admin', 'cashier']}>
          <Layout><OrderQueue /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/menu" element={
        <ProtectedRoute>
          <Layout><MenuList /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute>
          <Layout><OrdersPage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/unauthorized" element={
        <div className="min-h-screen flex items-center justify-center bg-amber-50">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
            <p className="text-gray-500 mt-2">You don't have permission to view this page.</p>
            <a href="/" className="mt-4 inline-block text-amber-600 hover:underline">Go Home</a>
          </div>
        </div>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
