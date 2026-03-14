import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import { orderService } from '../../services/orderService';

const FOOD_IMAGES = {
  'adobo':      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80',
  'sinigang':   'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80',
  'tinola':     'https://images.unsplash.com/photo-1585325701165-f3b8d9c4424c?w=400&q=80',
  'kaldereta':  'https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&q=80',
  'tilapia':    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80',
  'chicken':    'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=400&q=80',
  'pork':       'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
  'rice':       'https://images.unsplash.com/photo-1536304993881-ff86e0c9b4c9?w=400&q=80',
  'lumpia':     'https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80',
  'banana':     'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80',
  'fries':      'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80',
  'hotdog':     'https://images.unsplash.com/photo-1527345931282-806d3b11967f?w=400&q=80',
  'fishball':   'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80',
  'water':      'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&q=80',
  'softdrink':  'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
  'juice':      'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80',
  'coffee':     'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80',
  'chocolate':  'https://images.unsplash.com/photo-1542990253-a781e57e4a52?w=400&q=80',
  'halo':       'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80',
  'leche':      'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
  'cassava':    'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&q=80',
  'buko':       'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
  'champorado': 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400&q=80',
  'silog':      'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80',
  'cheese':     'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400&q=80',
  'sandwich':   'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=400&q=80',
  'combo':      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80',
};
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80';

function getFoodImage(name) {
  const lower = name.toLowerCase();
  for (const [key, url] of Object.entries(FOOD_IMAGES)) {
    if (lower.includes(key)) return url;
  }
  return DEFAULT_IMG;
}

const PAYMENT_OPTIONS = [
  { key: 'cash',  label: 'Cash',  color: '#16a34a', bg: '#dcfce7',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/></svg> },
  { key: 'gcash', label: 'GCash', color: '#1d4ed8', bg: '#dbeafe',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="3"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg> },
  { key: 'maya',  label: 'Maya',  color: '#7c3aed', bg: '#ede9fe',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/></svg> },
  { key: 'card',  label: 'Card',  color: '#0891b2', bg: '#cffafe',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h2"/><path d="M10 15h2"/></svg> },
];

// ── Floating Cart Drawer ─────────────────────────────────────
function FloatingCart({ cart, onRemove, onUpdateQty, onClear, onPlaceOrder, submitting, error }) {
  const [open, setOpen]             = useState(false);
  const [payment, setPayment]       = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [bump, setBump]             = useState(false);
  const prevCount                   = useRef(0);
  const drawerRef                   = useRef(null);
  const buttonRef                   = useRef(null);

  const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);
  const subtotal   = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const change     = Math.max(0, parseFloat(amountPaid || 0) - subtotal);

  useEffect(() => {
    if (totalItems > prevCount.current && totalItems > 0) {
      setBump(true); setTimeout(() => setBump(false), 400);
    }
    prevCount.current = totalItems;
  }, [totalItems]);

  useEffect(() => {
    const handler = (e) => {
      if (open
        && drawerRef.current && !drawerRef.current.contains(e.target)
        && buttonRef.current && !buttonRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleOrder = async () => {
    await onPlaceOrder(payment, parseFloat(amountPaid) || subtotal);
    setOpen(false); setAmountPaid('');
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 transition-opacity"
          style={{background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)'}}
          onClick={() => setOpen(false)}/>
      )}
      <button ref={buttonRef} onClick={() => setOpen(o => !o)}
        className="fixed bottom-7 right-7 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl transition-all"
        style={{
          background: totalItems > 0 ? 'linear-gradient(135deg, #f97316, #ea580c)' : 'linear-gradient(135deg, #1f1f1f, #2a2a2a)',
          transform: bump ? 'scale(1.15)' : open ? 'scale(0.97)' : 'scale(1)',
          border: totalItems > 0 ? '1.5px solid rgba(251,146,60,0.4)' : '1.5px solid #333',
          boxShadow: totalItems > 0 ? '0 8px 32px rgba(249,115,22,0.45)' : '0 4px 20px rgba(0,0,0,0.5)',
          transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
        <div className="relative">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          {totalItems > 0 && (
            <span className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full text-xs font-black flex items-center justify-center"
              style={{background: '#fff', color: '#ea580c', boxShadow: '0 2px 6px rgba(0,0,0,0.3)'}}>
              {totalItems}
            </span>
          )}
        </div>
        {totalItems > 0 ? (
          <div className="text-left">
            <div className="text-xs text-white font-black leading-none">Your Tray</div>
            <div className="text-sm font-black text-white leading-tight mt-0.5">₱{subtotal.toFixed(2)}</div>
          </div>
        ) : (
          <span className="text-sm font-black text-gray-400">Your Tray</span>
        )}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"
          style={{opacity: 0.7, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s'}}>
          <polyline points="18,15 12,9 6,15"/>
        </svg>
      </button>

      <div ref={drawerRef} className="fixed right-7 z-50 w-80 rounded-3xl overflow-hidden flex flex-col"
        style={{
          bottom: '88px', maxHeight: '72vh', background: '#111',
          border: '1px solid #2a2a2a', boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
          transform: open ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
          opacity: open ? 1 : 0, pointerEvents: open ? 'all' : 'none',
          transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)', transformOrigin: 'bottom right',
        }}>
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0"
          style={{borderBottom: '1px solid #1f1f1f', background: '#0f0f0f'}}>
          <div>
            <h3 className="font-black text-white text-sm">Your Tray</h3>
            <p className="text-xs mt-0.5" style={{color: '#6b7280'}}>
              {cart.items.length === 0 ? 'Empty' : `${totalItems} item${totalItems !== 1 ? 's' : ''} · ₱${subtotal.toFixed(2)}`}
            </p>
          </div>
          {cart.items.length > 0 && (
            <button onClick={onClear} className="text-xs font-bold px-3 py-1 rounded-lg transition"
              style={{color: '#ef4444', background: 'rgba(239,68,68,0.1)'}}>Clear</button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{minHeight: 0}}>
          {cart.items.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-2 opacity-20">🛒</div>
              <p className="text-xs font-semibold" style={{color: '#4b5563'}}>Add items to get started</p>
            </div>
          ) : (
            cart.items.map(item => (
              <div key={item.id} className="flex items-center gap-2.5 p-2.5 rounded-2xl transition"
                style={{background: '#1a1a1a', border: '1px solid #252525'}}>
                <img src={getFoodImage(item.name)} alt={item.name}
                  className="w-11 h-11 rounded-xl object-cover flex-shrink-0"
                  onError={e => e.target.src = DEFAULT_IMG}/>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-white truncate">{item.name}</div>
                  <div className="text-xs font-bold mt-0.5" style={{color: '#f97316'}}>
                    ₱{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center transition hover:bg-red-900"
                    style={{background: '#2a2a2a', color: '#9ca3af'}}>−</button>
                  <span className="w-5 text-center text-xs font-black text-white">{item.quantity}</span>
                  <button onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                    className="w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center transition hover:bg-green-900"
                    style={{background: '#2a2a2a', color: '#9ca3af'}}>+</button>
                  <button onClick={() => onRemove(item.id)}
                    className="w-6 h-6 rounded-lg text-xs flex items-center justify-center ml-0.5 transition hover:bg-red-950"
                    style={{background: '#2a2a2a', color: '#ef4444'}}>✕</button>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.items.length > 0 && (
          <div className="p-4 flex-shrink-0 space-y-3" style={{borderTop: '1px solid #1f1f1f', background: '#0f0f0f'}}>
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-2" style={{color: '#4b5563'}}>Payment</p>
              <div className="grid grid-cols-4 gap-1.5">
                {PAYMENT_OPTIONS.map(opt => (
                  <button key={opt.key} onClick={() => setPayment(opt.key)}
                    className="py-2 rounded-xl flex flex-col items-center gap-1 transition-all hover:scale-105 active:scale-95"
                    style={{
                      border: `2px solid ${payment === opt.key ? opt.color : '#2a2a2a'}`,
                      background: payment === opt.key ? `${opt.color}25` : '#1a1a1a',
                      color: payment === opt.key ? opt.color : '#4b5563',
                    }}>
                    {opt.icon}
                    <span style={{fontSize: '9px', fontWeight: 800}}>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            {payment === 'cash' && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-1.5" style={{color: '#4b5563'}}>Amount Paid</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black" style={{color: '#6b7280'}}>₱</span>
                  <input type="number" min={subtotal} value={amountPaid}
                    onChange={e => setAmountPaid(e.target.value)} placeholder={subtotal.toFixed(2)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl text-xs font-bold focus:outline-none"
                    style={{background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#fff'}}
                    onFocus={e => e.target.style.borderColor = '#f97316'}
                    onBlur={e => e.target.style.borderColor = '#2a2a2a'}/>
                </div>
                {parseFloat(amountPaid) >= subtotal && (
                  <div className="flex justify-between mt-1.5 text-xs">
                    <span style={{color: '#4b5563'}}>Change</span>
                    <span className="font-black" style={{color: '#22c55e'}}>₱{change.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
            {error && (
              <div className="text-xs p-2.5 rounded-xl font-bold"
                style={{background: 'rgba(239,68,68,0.15)', color: '#f87171'}}>⚠ {error}</div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white">Total</span>
              <span className="text-lg font-black" style={{color: '#f97316'}}>₱{subtotal.toFixed(2)}</span>
            </div>
            <button onClick={handleOrder} disabled={submitting}
              className="w-full py-3.5 text-white font-black text-sm rounded-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-xl"
              style={{background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 4px 20px rgba(249,115,22,0.4)'}}>
              {submitting ? '⏳ Placing...' : `Place Order · ₱${subtotal.toFixed(2)}`}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── Featured Card ────────────────────────────────────────────
function FeaturedCard({ item, onAdd, isFav, onToggleFav }) {
  const [imgErr, setImgErr] = useState(false);
  const [added, setAdded]   = useState(false);
  const handleAdd = () => { onAdd(item); setAdded(true); setTimeout(() => setAdded(false), 700); };
  return (
    <div className="flex-shrink-0 rounded-2xl overflow-hidden relative group transition-all hover:scale-[1.02] hover:shadow-xl"
      style={{width: '200px', background: '#1a1a1a', border: '1px solid #2a2a2a'}}>
      <div className="relative h-28 overflow-hidden">
        <img src={imgErr ? DEFAULT_IMG : getFoodImage(item.name)} alt={item.name}
          onError={() => setImgErr(true)}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
        <div className="absolute inset-0" style={{background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)'}}/>
        <div className="absolute bottom-2 left-3">
          <span className="font-black text-white text-base drop-shadow">₱{parseFloat(item.price).toFixed(0)}</span>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <button onClick={e => { e.stopPropagation(); onToggleFav(item.id); }}
            className="w-6 h-6 rounded-full flex items-center justify-center text-sm transition hover:scale-110"
            style={{background: isFav ? 'rgba(239,68,68,0.9)' : 'rgba(0,0,0,0.5)'}}>
            {isFav ? '❤️' : '🤍'}
          </button>
          <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-black shadow">⭐</span>
        </div>
      </div>
      <div className="p-3">
        <div className="font-black text-white text-xs truncate">{item.name}</div>
        <div className="text-xs mt-0.5 truncate" style={{color: '#6b7280'}}>{item.description || item.category?.name}</div>
        <button onClick={handleAdd}
          className="w-full mt-2.5 py-1.5 rounded-xl text-xs font-black text-white transition-all hover:scale-[1.02] active:scale-95"
          style={{background: added ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#f97316,#ea580c)'}}>
          {added ? '✓ Added!' : '+ Add to Tray'}
        </button>
      </div>
    </div>
  );
}

// ── Menu Card ────────────────────────────────────────────────
function MenuCard({ item, isAdmin, onToggle, onEdit, onDelete, onAdd, isFav, onToggleFav }) {
  const isOut = item.stock_quantity <= 0;
  const isLow = item.stock_quantity <= item.low_stock_threshold && !isOut;
  const [imgErr, setImgErr] = useState(false);
  const [added, setAdded]   = useState(false);
  const handleAdd = () => { onAdd(item); setAdded(true); setTimeout(() => setAdded(false), 700); };

  return (
    <div className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-300 border border-gray-100
      ${!item.is_available ? 'opacity-60' : 'hover:-translate-y-1 hover:shadow-xl'}`}>
      <div className="relative h-36 overflow-hidden bg-gray-100">
        <img src={imgErr ? DEFAULT_IMG : getFoodImage(item.name)} alt={item.name}
          onError={() => setImgErr(true)}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"/>
        <div className="absolute top-2 left-2 flex gap-1">
          {item.is_featured && (
            <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-black shadow">⭐</span>
          )}
        </div>
        <div className="absolute top-2 right-2 flex gap-1 items-center">
          {!isAdmin && (
            <button onClick={e => { e.stopPropagation(); onToggleFav(item.id); }}
              className="w-6 h-6 rounded-full flex items-center justify-center text-sm transition hover:scale-125"
              style={{background: isFav ? 'rgba(239,68,68,0.85)' : 'rgba(0,0,0,0.45)'}}>
              {isFav ? '❤️' : '🤍'}
            </button>
          )}
          <span className={`text-xs text-white px-2 py-0.5 rounded-full font-bold shadow ${isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}>
            {isOut ? 'Out' : isLow ? 'Low' : 'Available'}
          </span>
        </div>
        <div className="absolute bottom-2 left-2">
          <span className="text-lg font-black text-white drop-shadow-lg">₱{parseFloat(item.price).toFixed(0)}</span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-black text-gray-900 text-sm leading-tight truncate">{item.name}</h3>
        {item.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>}
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-400">Stock: {item.stock_quantity}</span>
          <span className="text-xs text-gray-400">{item.category?.name}</span>
        </div>
        {isAdmin ? (
          <div className="flex gap-1.5 mt-2">
            <button onClick={() => onToggle(item)}
              className={`flex-1 py-1.5 text-xs rounded-lg font-bold transition ${item.is_available ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
              {item.is_available ? 'Disable' : 'Enable'}
            </button>
            <button onClick={() => onEdit(item)} className="px-2.5 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-bold">Edit</button>
            <button onClick={() => onDelete(item)} className="px-2.5 py-1.5 text-xs bg-red-50 text-red-400 rounded-lg hover:bg-red-100 font-bold">✕</button>
          </div>
        ) : (
          <button onClick={handleAdd} disabled={!item.is_available || isOut}
            className="w-full mt-2 py-2 text-xs font-black rounded-xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow"
            style={{
              background: added ? 'linear-gradient(135deg, #22c55e, #16a34a)' : isOut ? '#9ca3af' : 'linear-gradient(135deg, #f97316, #ea580c)',
              transform: added ? 'scale(0.97)' : 'scale(1)',
            }}>
            {added ? '✓ Added!' : isOut ? 'Out of Stock' : '+ Add to Tray'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────────
export default function MenuList() {
  const { isAdmin, isCustomer, isCashier, user } = useAuth();
  const { cart, addItem, removeItem, updateQty, clearCart } = useCart();

  const [categories, setCategories]     = useState([]);
  const [items, setItems]               = useState([]);
  const [selectedCat, setSelectedCat]   = useState('all');
  const [search, setSearch]             = useState('');
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editItem, setEditItem]         = useState(null);
  const [submitting, setSubmitting]     = useState(false);
  const [orderError, setOrderError]     = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [showFavOnly, setShowFavOnly]   = useState(false);

  // ── Favorites (localStorage) ──────────────────────────────
  const FAV_KEY = `canteen_favs_${user?.id || 'guest'}`;
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); } catch { return []; }
  });
  const toggleFav = (id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  };

  // ── Order history → "Recommended for you" ────────────────
  const ORD_KEY = `canteen_ordered_${user?.id || 'guest'}`;
  const [orderedIds, setOrderedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ORD_KEY) || '[]'); } catch { return []; }
  });
  const recordOrder = (cartItems) => {
    setOrderedIds(prev => {
      const next = [...new Set([...prev, ...cartItems.map(i => i.id)])];
      localStorage.setItem(ORD_KEY, JSON.stringify(next));
      return next;
    });
  };

  const fetchItems = () => {
    api.get('/menu', { params: { per_page: 100 } }).then(r => { setItems(r.data.data); setLoading(false); });
  };

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data));
    fetchItems();
  }, []);

  // ── Derived lists ─────────────────────────────────────────
  const featuredItems = items.filter(i => i.is_featured && i.is_available && i.stock_quantity > 0);

  // Recommended: same categories as previously ordered items, excluding already-ordered
  const recommendedItems = (() => {
    if (orderedIds.length === 0) return [];
    const orderedCatIds = [...new Set(
      items.filter(i => orderedIds.includes(i.id)).map(i => i.category_id)
    )];
    return items.filter(i =>
      !orderedIds.includes(i.id) &&
      orderedCatIds.includes(i.category_id) &&
      i.is_available && i.stock_quantity > 0
    ).slice(0, 6);
  })();

  const favoriteItems = items.filter(i => favorites.includes(i.id) && i.is_available);

  const filtered = items.filter(item => {
    const matchCat    = selectedCat === 'all' || item.category_id === Number(selectedCat);
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchFav    = !showFavOnly || favorites.includes(item.id);
    return matchCat && matchSearch && matchFav;
  });

  const handleToggle = async (item) => { await api.patch(`/menu/${item.id}/toggle-availability`); fetchItems(); };
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    await api.delete(`/menu/${item.id}`); fetchItems();
  };

  const handlePlaceOrder = async (payment, amountPaid) => {
    if (cart.items.length === 0) return;
    setSubmitting(true); setOrderError('');
    try {
      await orderService.createOrder({
        items: cart.items.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
        payment_method: payment,
        amount_paid: payment === 'cash' ? amountPaid : undefined,
        user_id: user?.id,
      });
      if (isCustomer) recordOrder(cart.items);
      clearCart();
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 5000);
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const mealHint = hour < 10 ? 'Start your day right 🌅' : hour < 14 ? 'Lunch time! 🍱' : hour < 18 ? 'Afternoon snack time ☕' : 'Dinner is served 🌙';

  return (
    <div className="flex h-full overflow-hidden" style={{background: '#f8f7f5'}}>
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Sticky top bar ── */}
        <div className="bg-white px-6 py-3 flex-shrink-0 shadow-sm" style={{borderBottom: '1px solid #f0f0f0'}}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button onClick={() => { setEditItem(null); setShowForm(true); }}
                  className="px-4 py-2 text-white text-xs font-black rounded-xl shadow transition hover:scale-105 active:scale-95"
                  style={{background: 'linear-gradient(135deg, #f97316, #ea580c)'}}>
                  + Add Item
                </button>
              )}
              {isCustomer && (
                <button onClick={() => { setShowFavOnly(f => !f); setSelectedCat('all'); setSearch(''); }}
                  className="px-4 py-2 text-xs font-black rounded-xl transition hover:scale-105 active:scale-95"
                  style={{
                    background: showFavOnly ? 'linear-gradient(135deg,#ef4444,#dc2626)' : '#fff0f0',
                    color: showFavOnly ? '#fff' : '#ef4444',
                    border: '1.5px solid #fca5a5',
                  }}>
                  {showFavOnly ? '❤️ Favorites' : '🤍 Favorites'}
                  {favorites.length > 0 && (
                    <span className="ml-1.5 text-xs font-black px-1.5 py-0.5 rounded-full"
                      style={{background: showFavOnly ? 'rgba(255,255,255,0.3)' : '#fee2e2', color: showFavOnly ? '#fff' : '#ef4444'}}>
                      {favorites.length}
                    </span>
                  )}
                </button>
              )}
            </div>
            <div className="relative flex-1 max-w-xs ml-auto">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input type="text" placeholder="Search menu..." value={search}
                onChange={e => { setSearch(e.target.value); setShowFavOnly(false); }}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none transition"
                style={{background: '#f8f7f5', border: '2px solid transparent'}}
                onFocus={e => e.target.style.borderColor = '#f97316'}
                onBlur={e => e.target.style.borderColor = 'transparent'}/>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-0.5" style={{scrollbarWidth: 'none'}}>
            <button onClick={() => { setSelectedCat('all'); setShowFavOnly(false); }}
              className="px-4 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition flex-shrink-0"
              style={selectedCat === 'all' && !showFavOnly
                ? {background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff'}
                : {background: '#f3f4f6', color: '#6b7280'}}>
              🍽 All
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => { setSelectedCat(String(cat.id)); setShowFavOnly(false); }}
                className="px-4 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition flex-shrink-0"
                style={selectedCat === String(cat.id) && !showFavOnly
                  ? {background: 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff'}
                  : {background: '#f3f4f6', color: '#6b7280'}}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto pb-28">

          {/* Success toast */}
          {orderSuccess && (
            <div className="mx-5 mt-4 p-4 rounded-2xl text-sm font-black flex items-center gap-3"
              style={{background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)', color: '#15803d', border: '1px solid #86efac', boxShadow: '0 4px 16px rgba(34,197,94,0.2)'}}>
              <span className="text-2xl">🎉</span>
              <div>
                <div>Order placed successfully!</div>
                <div className="text-xs font-semibold opacity-70 mt-0.5">Track it in My Orders →</div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-4xl mb-2 animate-pulse">🍱</div>
              Loading menu...
            </div>
          ) : (
            <>
              {/* ── FAVORITES VIEW ── */}
              {isCustomer && showFavOnly ? (
                <div className="px-5 mt-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
                      ❤️ Your Favorites
                      <span className="text-xs font-semibold text-gray-400">({favoriteItems.length})</span>
                    </h3>
                  </div>
                  {favoriteItems.length === 0 ? (
                    <div className="text-center py-20">
                      <div className="text-5xl mb-3 opacity-30">🤍</div>
                      <p className="text-gray-500 font-black text-base">No favorites yet</p>
                      <p className="text-gray-400 text-xs mt-1">Tap the heart icon on any item to save it here</p>
                    </div>
                  ) : (
                    <div className="grid gap-4" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))'}}>
                      {favoriteItems.map(item => (
                        <MenuCard key={item.id} item={item} isAdmin={false}
                          onAdd={addItem} isFav={true} onToggleFav={toggleFav}
                          onToggle={handleToggle} onEdit={() => {}} onDelete={() => {}}/>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* ── Hero greeting (customers, no search) ── */}
                  {isCustomer && !search && selectedCat === 'all' && (
                    <div className="mx-5 mt-5 rounded-3xl overflow-hidden relative"
                      style={{background: 'linear-gradient(135deg, #1a0800 0%, #3d1500 50%, #1a0800 100%)', minHeight: '140px'}}>
                      <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
                        style={{background: 'radial-gradient(circle, #f97316, transparent)', transform: 'translate(30%,-30%)'}}/>
                      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
                        style={{background: 'radial-gradient(circle, #fb923c, transparent)', transform: 'translate(-20%,30%)'}}/>
                      <div className="relative px-6 py-5 flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{color: '#fb923c'}}>{mealHint}</p>
                          <h2 className="text-xl font-black text-white leading-tight">
                            {greeting},<br/>
                            <span style={{color: '#fdba74'}}>{user?.name?.split(' ')[0] || 'there'}! 👋</span>
                          </h2>
                          <p className="text-xs mt-2 font-semibold" style={{color: '#9ca3af'}}>
                            {items.filter(i => i.is_available).length} items available today
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-6xl opacity-80 ml-4 select-none">
                          {hour < 10 ? '🌅' : hour < 14 ? '🍱' : hour < 18 ? '☕' : '🌙'}
                        </div>
                      </div>
                      <div className="flex" style={{borderTop: '1px solid rgba(255,255,255,0.07)'}}>
                        {[
                          { label: 'Categories', value: categories.length },
                          { label: 'Featured',   value: featuredItems.length },
                          { label: 'Saved',      value: favorites.length },
                        ].map((s, i) => (
                          <div key={s.label} className="flex-1 py-3 text-center"
                            style={{borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none'}}>
                            <div className="text-lg font-black" style={{color: '#f97316'}}>{s.value}</div>
                            <div className="text-xs font-semibold" style={{color: '#6b7280'}}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Recommended For You ── */}
                  {isCustomer && !search && selectedCat === 'all' && recommendedItems.length > 0 && (
                    <div className="mt-5">
                      <div className="flex items-center justify-between px-5 mb-3">
                        <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
                          <span className="text-base">✨</span> Recommended For You
                        </h3>
                        <span className="text-xs font-semibold text-gray-400">Based on your orders</span>
                      </div>
                      <div className="flex gap-3 px-5 overflow-x-auto pb-1" style={{scrollbarWidth: 'none'}}>
                        {recommendedItems.map(item => (
                          <FeaturedCard key={item.id} item={item} onAdd={addItem}
                            isFav={favorites.includes(item.id)} onToggleFav={toggleFav}/>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Featured spotlight ── */}
                  {isCustomer && !search && selectedCat === 'all' && featuredItems.length > 0 && (
                    <div className="mt-5">
                      <div className="flex items-center justify-between px-5 mb-3">
                        <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
                          <span className="text-lg">⭐</span> Today's Picks
                        </h3>
                        <span className="text-xs font-semibold text-gray-400">{featuredItems.length} featured</span>
                      </div>
                      <div className="flex gap-3 px-5 overflow-x-auto pb-1" style={{scrollbarWidth: 'none'}}>
                        {featuredItems.map(item => (
                          <FeaturedCard key={item.id} item={item} onAdd={addItem}
                            isFav={favorites.includes(item.id)} onToggleFav={toggleFav}/>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Section label ── */}
                  <div className="flex items-center justify-between px-5 mt-5 mb-3">
                    <h3 className="font-black text-gray-900 text-sm">
                      {search
                        ? `Results for "${search}"`
                        : selectedCat === 'all'
                          ? '🍽 All Menu Items'
                          : `${categories.find(c => String(c.id) === selectedCat)?.icon || ''} ${categories.find(c => String(c.id) === selectedCat)?.name || ''}`
                      }
                    </h3>
                    <span className="text-xs font-semibold text-gray-400">{filtered.length} items</span>
                  </div>

                  {/* ── Main grid ── */}
                  <div className="px-5">
                    <div className="grid gap-4" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))'}}>
                      {filtered.map(item => (
                        <MenuCard key={item.id} item={item} isAdmin={isAdmin}
                          onToggle={handleToggle}
                          onEdit={i => { setEditItem(i); setShowForm(true); }}
                          onDelete={handleDelete}
                          onAdd={addItem}
                          isFav={favorites.includes(item.id)}
                          onToggleFav={toggleFav}/>
                      ))}
                    </div>
                    {filtered.length === 0 && (
                      <div className="text-center py-20">
                        <div className="text-5xl mb-3 opacity-30">🔍</div>
                        <p className="text-gray-400 text-sm font-semibold">No items found</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {(isCustomer || isCashier) && (
        <FloatingCart
          cart={cart} onRemove={removeItem} onUpdateQty={updateQty}
          onClear={clearCart} onPlaceOrder={handlePlaceOrder}
          submitting={submitting} error={orderError}/>
      )}

      {showForm && (
        <MenuForm item={editItem} categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchItems(); }}/>
      )}
    </div>
  );
}

function MenuForm({ item, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: item?.name || '', category_id: item?.category_id || '',
    description: item?.description || '', price: item?.price || '',
    stock_quantity: item?.stock_quantity || 0, low_stock_threshold: item?.low_stock_threshold || 10,
    is_available: item?.is_available ?? true, is_featured: item?.is_featured ?? false,
    preparation_time: item?.preparation_time || 5,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      if (item) { await api.put(`/menu/${item.id}`, form); }
      else { await api.post('/menu', form); }
      onSaved();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black">{item ? 'Edit Item' : 'Add Menu Item'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        {error && <div className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-xl">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Name *</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category *</label>
              <select required value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                <option value="">Select...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Price (₱) *</label>
              <input required type="number" step="0.01" min="0" value={form.price}
                onChange={e => setForm({...form, price: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</label>
              <input type="number" min="0" value={form.stock_quantity}
                onChange={e => setForm({...form, stock_quantity: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"/>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"/>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={form.is_available} onChange={e => setForm({...form, is_available: e.target.checked})} className="rounded"/>
              Available
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} className="rounded"/>
              Featured
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 text-white rounded-xl text-sm font-black disabled:opacity-50 transition"
              style={{background: 'linear-gradient(135deg, #f97316, #ea580c)'}}>
              {saving ? 'Saving...' : item ? 'Update' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
