import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminNav = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/pos',       icon: '🛒', label: 'POS' },
  { to: '/orders',    icon: '📋', label: 'Orders' },
  { to: '/menu',      icon: '🍽️', label: 'Menu' },
  { to: '/inventory', icon: '📦', label: 'Inventory' },
  { to: '/reports',   icon: '📈', label: 'Reports' },
];

const cashierNav = [
  { to: '/pos',     icon: '🛒', label: 'POS' },
  { to: '/orders',  icon: '📋', label: 'Orders' },
  { to: '/queue',   icon: '⏳', label: 'Queue' },
];

const customerNav = [
  { to: '/menu',       icon: '🍽️', label: 'Menu' },
  { to: '/orders',  icon: '📋', label: 'My Orders' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = user?.role === 'admin' ? adminNav
                 : user?.role === 'cashier' ? cashierNav
                 : customerNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white flex flex-col shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🍱</span>
          <div>
            <div className="font-bold text-lg leading-none">CanteenPOS</div>
            <div className="text-xs text-gray-400 capitalize">{user?.role} panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm font-medium ${
                isActive
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">{user?.name}</div>
            <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition"
        >
          Sign out →
        </button>
      </div>
    </aside>
  );
}
