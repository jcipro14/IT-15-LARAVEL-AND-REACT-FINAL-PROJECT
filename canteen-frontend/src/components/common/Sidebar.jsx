import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const adminNav = [
  { to: '/dashboard', icon: '▦',  label: 'Dashboard' },
  { to: '/pos',       icon: '⊞',  label: 'POS Terminal' },
  { to: '/orders',    icon: '≡',  label: 'Orders' },
  { to: '/menu',      icon: '◈',  label: 'Menu' },
  { to: '/inventory', icon: '⬡',  label: 'Inventory' },
  { to: '/reports',   icon: '↗',  label: 'Reports' },
];

const cashierNav = [
  { to: '/pos',    icon: '⊞', label: 'POS Terminal' },
  { to: '/orders', icon: '≡', label: 'Orders' },
  { to: '/queue',  icon: '◷', label: 'Queue' },
];

const customerNav = [
  { to: '/menu',   icon: '◈', label: 'Menu' },
  { to: '/orders', icon: '≡', label: 'My Orders' },
];

const ROLE_COLORS = {
  admin:    { dot: '#f97316', label: 'Admin' },
  cashier:  { dot: '#3b82f6', label: 'Cashier' },
  customer: { dot: '#22c55e', label: 'Customer' },
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role || 'customer';
  const navItems = role === 'admin' ? adminNav : role === 'cashier' ? cashierNav : customerNav;
  const roleColor = ROLE_COLORS[role] || ROLE_COLORS.customer;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{background: '#0f0f0f', borderRight: '1px solid #1f1f1f'}}>
      {/* Logo */}
      <div className="px-6 py-5" style={{borderBottom: '1px solid #1f1f1f'}}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 200 200">
              <rect x="10" y="10" width="180" height="180" rx="40" ry="40" fill="#f97316"/>
              <ellipse cx="100" cy="118" rx="60" ry="14" fill="#fff" opacity="0.15"/>
              <path d="M44 103 Q44 158 100 158 Q156 158 156 103 Z" fill="white"/>
              <path d="M76 86 Q79 75 76 64" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.9"/>
              <path d="M100 82 Q103 70 100 58" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.9"/>
              <path d="M124 86 Q127 75 124 64" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.9"/>
              <line x1="78" y1="100" x2="66" y2="148" stroke="#f97316" strokeWidth="5.5" strokeLinecap="round"/>
              <line x1="91" y1="100" x2="74" y2="151" stroke="#f97316" strokeWidth="4" strokeLinecap="round" opacity="0.65"/>
            </svg>
          </div>
          <div>
            <div className="font-black text-white text-base tracking-tight leading-none">CanteenPOS</div>
            <div className="text-xs mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{background: roleColor.dot}} />
              <span style={{color: roleColor.dot}} className="font-semibold capitalize">{roleColor.label} Panel</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => (
          <NavLink key={item.to + item.label} to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium group ${
                isActive ? 'text-white' : 'text-gray-500 hover:text-gray-200'
              }`
            }
            style={({ isActive }) => isActive ? {
              background: 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(234,88,12,0.1))',
              borderLeft: '2px solid #f97316',
            } : {}}
          >
            <span className="text-base w-5 text-center flex-shrink-0" style={{fontFamily: 'monospace'}}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-4 py-4" style={{borderTop: '1px solid #1f1f1f'}}>
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
            style={{background: `linear-gradient(135deg, ${roleColor.dot}, ${roleColor.dot}88)`}}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white truncate leading-none">{user?.name}</div>
            <div className="text-xs text-gray-500 mt-0.5 truncate">{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full py-2.5 text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          style={{background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)'}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
