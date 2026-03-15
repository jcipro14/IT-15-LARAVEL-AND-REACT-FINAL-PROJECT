import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/pos':       'Point of Sale',
  '/orders':    'Orders',
  '/queue':     'Order Queue',
  '/menu':      'Menu',
  '/inventory': 'Inventory',
  '/reports':   'Reports',
  '/my-orders': 'My Orders',
};

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const title = PAGE_TITLES[location.pathname] || 'CanteenPOS';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm shrink-0">
      
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        )}
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>

     
      <div className="flex items-center gap-3">
        <span className={`hidden sm:inline text-xs font-semibold px-3 py-1 rounded-full capitalize ${
          user?.role === 'admin'    ? 'bg-purple-100 text-purple-700' :
          user?.role === 'cashier' ? 'bg-blue-100   text-blue-700'   :
                                     'bg-green-100  text-green-700'
        }`}>
          {user?.role}
        </span>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-bold select-none">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
            {user?.name}
          </span>
        </div>

        <button
          onClick={handleLogout}
          title="Sign out"
          className="ml-1 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition text-sm"
        >
          ⏻
        </button>
      </div>
    </header>
  );
}
