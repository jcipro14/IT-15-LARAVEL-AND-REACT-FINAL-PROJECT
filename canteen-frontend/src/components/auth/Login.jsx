import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || '/';

  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role === 'admin' || user.role === 'cashier') {
        navigate('/pos', { replace: true });
      } else {
        navigate('/menu', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = (role) => {
    const creds = {
      admin:    { email: 'admin@canteen.com',    password: 'cipro123' },
      cashier:  { email: 'cashier1@canteen.com', password: 'madjos123' },
      customer: { email: 'lagang@student.edu',      password: 'password' },
    };
    setForm(creds[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-400 via-orange-400 to-red-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-8 text-center">
          <div className="text-5xl mb-2">🍱</div>
          <h1 className="text-3xl font-bold text-white">CanteenPOS</h1>
          <p className="text-amber-100 mt-1">School Canteen Management System</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition shadow-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo buttons */}
          <div className="mt-6">
            <p className="text-xs text-gray-500 text-center mb-3 font-semibold uppercase tracking-wider">
              Quick Demo Login
            </p>
            <div className="grid grid-cols-3 gap-2">
              {['admin', 'cashier', 'customer'].map((role) => (
                <button
                  key={role}
                  onClick={() => demoLogin(role)}
                  className="py-2 px-3 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-amber-100 hover:text-amber-700 transition capitalize border border-gray-200"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
