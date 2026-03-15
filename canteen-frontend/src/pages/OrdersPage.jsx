import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';

const STATUS_CFG = {
  pending:   { icon: '⏳', label: 'Pending',   accent: '#f59e0b', bg: '#fef3c7', text: '#92400e' },
  preparing: { icon: '👨‍🍳', label: 'Preparing', accent: '#3b82f6', bg: '#dbeafe', text: '#1e40af' },
  ready:     { icon: '✅', label: 'Ready',     accent: '#22c55e', bg: '#dcfce7', text: '#166534' },
  completed: { icon: '🎉', label: 'Completed', accent: '#8b5cf6', bg: '#ede9fe', text: '#5b21b6' },
  cancelled: { icon: '✕',  label: 'Cancelled', accent: '#ef4444', bg: '#fee2e2', text: '#991b1b' },
};

const PAYMENT_CFG = {
  cash:  { label: 'Cash',  color: '#16a34a', bg: '#dcfce7', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>
  )},
  gcash: { label: 'GCash', color: '#1d4ed8', bg: '#dbeafe', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="3"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>
  )},
  maya:  { label: 'Maya',  color: '#7c3aed', bg: '#ede9fe', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/></svg>
  )},
  card:  { label: 'Card',  color: '#0891b2', bg: '#cffafe', icon: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h2"/><path d="M10 15h2"/></svg>
  )},
};

const STEPS = ['pending','preparing','ready','completed'];


function OrderTracker({ order, onClose }) {
  const [current, setCurrent] = useState(order);
  const intervalRef = useRef(null);

  useEffect(() => {
    const poll = () => {
      orderService.getMyOrders()
        .then(r => {
          const orders = r.data.data ?? r.data;
          const updated = orders.find(o => o.id === order.id);
          if (updated) setCurrent(updated);
        })
        .catch(() => {});
    };
    poll();
    intervalRef.current = setInterval(poll, 5000);
    return () => clearInterval(intervalRef.current);
  }, [order.id]);

  const cfg     = STATUS_CFG[current.status] || STATUS_CFG.pending;
  const stepIdx = STEPS.indexOf(current.status);
  const isCancelled = current.status === 'cancelled';
  const isCompleted = current.status === 'completed';

  const elapsed = Math.floor((Date.now() - new Date(current.created_at)) / 60000);
  const etaMsg  = stepIdx === 0 ? 'Waiting to be picked up' :
                  stepIdx === 1 ? 'Being prepared now...' :
                  stepIdx === 2 ? '🎉 Ready for pickup!' : 'Order completed!';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)'}}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        
        <div className="h-1.5 transition-all duration-1000" style={{background: cfg.accent}}/>

        <div className="p-6">
          
          <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-0.5">Live Tracking</p>
              <h2 className="font-black text-xl text-gray-900">Order #{current.order_number?.slice(-8)}</h2>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold transition">×</button>
          </div>

         
          {!isCancelled && (
            <div className="rounded-2xl p-5 text-center mb-5 transition-all duration-500"
              style={{background: cfg.bg}}>
              <div className="text-4xl mb-2">{cfg.icon}</div>
              <div className="font-black text-lg" style={{color: cfg.text}}>{cfg.label}</div>
              <div className="text-xs font-semibold mt-1" style={{color: cfg.text, opacity: 0.7}}>{etaMsg}</div>
              <div className="text-xs mt-2 font-semibold text-gray-400">{elapsed} min ago</div>
            </div>
          )}

          
          {!isCancelled && (
            <div className="mb-5">
              <div className="flex gap-1.5 mb-2">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex-1 h-2 rounded-full transition-all duration-700"
                    style={{background: i <= stepIdx ? cfg.accent : '#e5e7eb'}}/>
                ))}
              </div>
              <div className="flex justify-between">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex-1 text-center">
                    <div className="text-base">{i <= stepIdx ? STATUS_CFG[s]?.icon : '○'}</div>
                    <div className="text-xs capitalize font-bold mt-0.5"
                      style={{color: i <= stepIdx ? cfg.text : '#d1d5db', fontSize: '10px'}}>
                      {s}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

         
          <div className="space-y-2 mb-4">
            {current.order_items?.map(item => (
              <div key={item.id} className="flex justify-between items-center px-3 py-2 rounded-xl"
                style={{background: '#f8f7f5'}}>
                <span className="text-sm font-bold text-gray-700">
                  {item.menu_item?.name}
                  <span className="text-gray-400 font-normal ml-1">×{item.quantity}</span>
                </span>
                <span className="text-sm font-black text-gray-900">₱{parseFloat(item.subtotal).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center font-black text-base pt-3 mb-5"
            style={{borderTop: '1px solid #f0f0f0'}}>
            <span className="text-gray-900">Total</span>
            <span style={{color: cfg.accent}}>₱{parseFloat(current.total_amount).toFixed(2)}</span>
          </div>

          
          {!isCompleted && !isCancelled && (
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-400 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{background: cfg.accent}}/>
                <span className="relative inline-flex rounded-full h-2 w-2" style={{background: cfg.accent}}/>
              </span>
              Auto-refreshing every 5 seconds
            </div>
          )}

          <button onClick={onClose}
            className="w-full py-3 font-black text-white rounded-2xl transition hover:scale-[1.02] active:scale-95"
            style={{background: 'linear-gradient(135deg, #f97316, #ea580c)'}}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


function PlaceOrderModal({ onClose, onSuccess, prefillItems }) {
  const { user } = useAuth();
  const [payment, setPayment]       = useState('cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');
  const [menuItems, setMenuItems]   = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [search, setSearch]         = useState('');
  const [cart, setCart] = useState(() =>
    prefillItems ? prefillItems.map(i => ({
      id: i.menu_item?.id || i.menu_item_id,
      name: i.menu_item?.name || i.name,
      price: parseFloat(i.menu_item?.price || i.unit_price || 0),
      qty: i.quantity,
    })) : []
  );

  useEffect(() => {
    import('../services/api').then(m => {
      m.default.get('/menu', { params: { per_page: 100 } }).then(r => {
        setMenuItems(r.data.data.filter(i => i.is_available && i.stock_quantity > 0));
        setLoadingMenu(false);
      });
    });
  }, []);

  const filtered = menuItems.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id);
      if (ex) return prev.map(i => i.id === item.id ? {...i, qty: i.qty + 1} : i);
      return [...prev, { id: item.id, name: item.name, price: parseFloat(item.price), qty: 1 }];
    });
  };
  const updateQty = (id, qty) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.id !== id));
    else setCart(prev => prev.map(i => i.id === id ? {...i, qty} : i));
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const change   = Math.max(0, parseFloat(amountPaid || 0) - subtotal);

  const handleSubmit = async () => {
    if (cart.length === 0) { setError('Please add at least one item.'); return; }
    if (payment === 'cash' && parseFloat(amountPaid) < subtotal) { setError('Amount paid is less than the total.'); return; }
    setSubmitting(true); setError('');
    try {
      await orderService.createOrder({
        items: cart.map(i => ({ menu_item_id: i.id, quantity: i.qty })),
        payment_method: payment,
        amount_paid: payment === 'cash' ? parseFloat(amountPaid) || subtotal : subtotal,
        user_id: user?.id,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)'}}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{borderBottom: '1px solid #f0f0f0'}}>
          <div>
            <h2 className="font-black text-gray-900 text-lg">
              {prefillItems ? '🔁 Reorder' : 'New Order'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{cart.length} item{cart.length !== 1 ? 's' : ''} · ₱{subtotal.toFixed(2)}</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold transition text-lg">×</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-6 pt-5 pb-4" style={{borderBottom: '1px solid #f0f0f0'}}>
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Menu</div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..."
              className="w-full px-4 py-2.5 rounded-xl text-sm mb-3 focus:outline-none"
              style={{background: '#f8f7f5', border: '2px solid transparent'}}
              onFocus={e => e.target.style.borderColor = '#f97316'}
              onBlur={e => e.target.style.borderColor = 'transparent'}/>
            {loadingMenu ? (
              <div className="text-center py-4 text-gray-400 text-sm">Loading menu...</div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-0.5">
                {filtered.map(item => {
                  const inCart = cart.find(i => i.id === item.id);
                  return (
                    <button key={item.id} onClick={() => addToCart(item)}
                      className="flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-95"
                      style={{border: `2px solid ${inCart ? '#f97316' : '#e5e7eb'}`, background: inCart ? '#fff7ed' : '#fff'}}>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-gray-800 truncate">{item.name}</div>
                        <div className="text-xs font-black mt-0.5" style={{color: '#f97316'}}>₱{parseFloat(item.price).toFixed(0)}</div>
                      </div>
                      {inCart
                        ? <span className="w-6 h-6 rounded-full text-white text-xs font-black flex items-center justify-center flex-shrink-0"
                            style={{background: '#f97316'}}>{inCart.qty}</span>
                        : <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-gray-300 text-lg font-bold flex-shrink-0"
                            style={{borderColor: '#e5e7eb'}}>+</span>
                      }
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="px-6 py-4" style={{borderBottom: '1px solid #f0f0f0'}}>
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Your Order</div>
              <div className="space-y-2">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{background: '#f8f7f5'}}>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-gray-800 truncate">{item.name}</div>
                      <div className="text-xs font-black" style={{color: '#f97316'}}>₱{(item.price * item.qty).toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(item.id, item.qty - 1)}
                        className="w-7 h-7 rounded-xl font-black text-sm flex items-center justify-center transition hover:bg-red-100"
                        style={{background: '#e5e7eb', color: '#374151'}}>−</button>
                      <span className="w-6 text-center text-sm font-black text-gray-900">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-7 h-7 rounded-xl font-black text-sm flex items-center justify-center transition hover:bg-green-100"
                        style={{background: '#e5e7eb', color: '#374151'}}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="px-6 py-4" style={{borderBottom: payment === 'cash' && cart.length > 0 ? '1px solid #f0f0f0' : 'none'}}>
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Payment Method</div>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(PAYMENT_CFG).map(([key, cfg]) => (
                <button key={key} onClick={() => setPayment(key)}
                  className="py-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
                  style={{border: `2px solid ${payment === key ? cfg.color : '#e5e7eb'}`, background: payment === key ? cfg.bg : '#fff', color: payment === key ? cfg.color : '#9ca3af'}}>
                  {cfg.icon}
                  <span className="text-xs font-black">{cfg.label}</span>
                </button>
              ))}
            </div>
          </div>

          {payment === 'cash' && cart.length > 0 && (
            <div className="px-6 py-4">
              <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Amount Paid</div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">₱</span>
                <input type="number" min={subtotal} value={amountPaid} onChange={e => setAmountPaid(e.target.value)}
                  placeholder={subtotal.toFixed(2)}
                  className="w-full pl-8 pr-4 py-3 rounded-2xl text-sm font-bold focus:outline-none"
                  style={{background: '#f8f7f5', border: '2px solid transparent'}}
                  onFocus={e => e.target.style.borderColor = '#22c55e'}
                  onBlur={e => e.target.style.borderColor = 'transparent'}/>
              </div>
              {parseFloat(amountPaid) >= subtotal && (
                <div className="mt-2.5 flex justify-between items-center px-1">
                  <span className="text-sm text-gray-500 font-semibold">Change</span>
                  <span className="font-black text-green-600 text-base">₱{change.toFixed(2)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 flex-shrink-0 bg-white" style={{borderTop: '1px solid #f0f0f0'}}>
          {error && (
            <div className="text-xs font-bold p-3 rounded-xl mb-3" style={{background: '#fee2e2', color: '#b91c1c'}}>⚠ {error}</div>
          )}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-sm text-gray-400 font-semibold">{PAYMENT_CFG[payment]?.label} payment</span>
            <span className="text-2xl font-black" style={{color: '#f97316'}}>₱{subtotal.toFixed(2)}</span>
          </div>
          <button onClick={handleSubmit} disabled={submitting || cart.length === 0}
            className="w-full py-4 text-white font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 text-sm shadow-lg"
            style={{background: 'linear-gradient(135deg, #f97316, #ea580c)'}}>
            {submitting ? '⏳ Placing Order...' : `Place Order · ₱${subtotal.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}


function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);
  const [tracking, setTracking]     = useState(null);
  const [showPlace, setShowPlace]   = useState(false);
  const [reorderItems, setReorderItems] = useState(null);
  const [toast, setToast]           = useState('');

  const fetchOrders = () => {
    orderService.getMyOrders()
      .then(r => { setOrders(r.data.data ?? r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    const t = setInterval(fetchOrders, 15000);
    return () => clearInterval(t);
  }, []); 

  const handleSuccess = () => {
    setShowPlace(false); setReorderItems(null);
    setToast('Order placed! Track it below. 🎉');
    fetchOrders();
    setTimeout(() => setToast(''), 4000);
  };

  const handleReorder = (order) => {
    setSelected(null);
    setReorderItems(order.order_items);
    setShowPlace(true);
  };

  
  const completedOrders  = orders.filter(o => o.status === 'completed');
  const totalSpent       = completedOrders.reduce((s, o) => s + parseFloat(o.total_amount), 0);
  const itemFreq         = {};
  orders.forEach(o => o.order_items?.forEach(i => {
    const name = i.menu_item?.name || 'Unknown';
    itemFreq[name] = (itemFreq[name] || 0) + i.quantity;
  }));
  const favoriteItem     = Object.entries(itemFreq).sort((a, b) => b[1] - a[1])[0]?.[0];

  
  const STAMP_KEY = `canteen_stamps_${user?.id || 'guest'}`;
  const stamps    = completedOrders.length % 10;
  const rewards   = Math.floor(completedOrders.length / 10);

  if (loading) return (
    <div className="h-full flex items-center justify-center" style={{background: '#f8f7f5'}}>
      <div className="text-center">
        <div className="text-5xl mb-3 animate-pulse">🍱</div>
        <div className="text-sm font-semibold text-gray-400">Loading your orders...</div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{background: '#f8f7f5'}}>
      
      <div className="bg-white px-6 py-4 flex-shrink-0 shadow-sm" style={{borderBottom: '1px solid #f0f0f0'}}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900">My Orders</h1>
            <p className="text-xs text-gray-400 mt-0.5">{orders.length} total · live tracking</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchOrders}
              className="px-4 py-2 text-xs font-bold rounded-xl transition hover:bg-gray-100 text-gray-500"
              style={{border: '1px solid #e5e7eb'}}>🔄 Refresh</button>
            <button onClick={() => { setReorderItems(null); setShowPlace(true); }}
              className="px-5 py-2 text-xs font-black text-white rounded-xl shadow transition hover:scale-105 active:scale-95"
              style={{background: 'linear-gradient(135deg, #f97316, #ea580c)'}}>
              + New Order
            </button>
          </div>
        </div>
        {toast && (
          <div className="mt-3 px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2"
            style={{background: '#dcfce7', color: '#15803d', border: '1px solid #86efac'}}>
            {toast}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {orders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl mb-5 shadow-inner"
              style={{background: '#fff7ed'}}>🛒</div>
            <h2 className="text-2xl font-black text-gray-900">No orders yet</h2>
            <p className="text-gray-400 mt-2 text-sm max-w-xs leading-relaxed">Place your first order from the school canteen!</p>
            <button onClick={() => setShowPlace(true)}
              className="mt-6 px-8 py-3.5 text-white font-black rounded-2xl shadow-lg transition hover:scale-105 active:scale-95"
              style={{background: 'linear-gradient(135deg, #f97316, #ea580c)'}}>
              Order Now
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-w-2xl mx-auto">

           
            {completedOrders.length > 0 && (
              <div className="rounded-2xl overflow-hidden"
                style={{background: 'linear-gradient(135deg,#1a0800,#3d1500)', border: '1px solid rgba(249,115,22,0.2)'}}>
                <div className="px-5 py-4">
                  <p className="text-xs font-black uppercase tracking-widest mb-3" style={{color: '#fb923c'}}>📊 Your Stats</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Orders', value: completedOrders.length, icon: '🧾' },
                      { label: 'Total Spent', value: `₱${totalSpent.toFixed(0)}`, icon: '💰' },
                      { label: 'Fave Item', value: favoriteItem || '—', icon: '⭐', small: true },
                    ].map(s => (
                      <div key={s.label} className="rounded-xl p-3 text-center"
                        style={{background: 'rgba(255,255,255,0.06)'}}>
                        <div className="text-xl mb-1">{s.icon}</div>
                        <div className={`font-black text-white ${s.small ? 'text-xs' : 'text-base'} truncate`}>{s.value}</div>
                        <div className="text-xs mt-0.5" style={{color: '#6b7280'}}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                
                <div className="px-5 pb-4">
                  <div className="rounded-xl p-3" style={{background: 'rgba(255,255,255,0.06)'}}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-white">🎟 Loyalty Stamps</span>
                      {rewards > 0 && (
                        <span className="text-xs font-black px-2 py-0.5 rounded-full"
                          style={{background: '#f97316', color: '#fff'}}>
                          🏆 {rewards} reward{rewards > 1 ? 's' : ''} earned!
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {Array.from({length: 10}).map((_, i) => (
                        <div key={i}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all"
                          style={{
                            background: i < stamps ? 'linear-gradient(135deg,#f97316,#ea580c)' : 'rgba(255,255,255,0.1)',
                            border: i < stamps ? 'none' : '1px dashed rgba(255,255,255,0.2)',
                          }}>
                          {i < stamps ? '🍱' : ''}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs mt-2" style={{color: '#6b7280'}}>
                      {stamps === 0 && rewards > 0
                        ? '🎉 New stamp card started!'
                        : `${10 - stamps} more order${10 - stamps !== 1 ? 's' : ''} to earn a reward`}
                    </p>
                  </div>
                </div>
              </div>
            )}

           
            {orders.map(order => {
              const cfg     = STATUS_CFG[order.status] || STATUS_CFG.pending;
              const pcfg    = PAYMENT_CFG[order.payment_method] || PAYMENT_CFG.cash;
              const stepIdx = STEPS.indexOf(order.status);
              const isActive = ['pending','preparing','ready'].includes(order.status);
              return (
                <div key={order.id}
                  className="bg-white rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: `1px solid ${isActive ? cfg.accent + '40' : '#f0f0f0'}`}}
                  onClick={() => setSelected(order)}>
                  <div className="h-1 transition-all duration-500" style={{background: cfg.accent}}/>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-black font-mono text-sm tracking-tight text-gray-900">
                          #{order.order_number?.slice(-8)}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.created_at).toLocaleString('en', {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1"
                          style={{background: pcfg.bg, color: pcfg.color}}>{pcfg.label}</span>
                        <span className="text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1"
                          style={{background: cfg.bg, color: cfg.text}}>{cfg.icon} {cfg.label}</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 mb-3 font-medium truncate">
                      {order.order_items?.slice(0,4).map((item, i) => (
                        <span key={item.id}>{i > 0 ? ' · ' : ''}{item.menu_item?.name} ×{item.quantity}</span>
                      ))}
                      {order.order_items?.length > 4 && <span className="text-gray-400"> +{order.order_items.length - 4} more</span>}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-black" style={{color: cfg.accent}}>
                        ₱{parseFloat(order.total_amount).toFixed(2)}
                      </span>
                      <div className="flex gap-2">
                       
                        {isActive && (
                          <button onClick={e => { e.stopPropagation(); setTracking(order); }}
                            className="text-xs font-black px-3 py-1.5 rounded-xl text-white transition hover:scale-105 active:scale-95"
                            style={{background: `linear-gradient(135deg,${cfg.accent},${cfg.accent}cc)`}}>
                            📡 Track
                          </button>
                        )}
                       
                        {order.status === 'completed' && (
                          <button onClick={e => { e.stopPropagation(); handleReorder(order); }}
                            className="text-xs font-black px-3 py-1.5 rounded-xl transition hover:scale-105 active:scale-95"
                            style={{background: '#fff7ed', color: '#f97316', border: '1.5px solid #fed7aa'}}>
                            🔁 Reorder
                          </button>
                        )}
                      </div>
                    </div>

                    {order.status !== 'cancelled' && (
                      <div className="mt-3.5">
                        <div className="flex gap-1 mb-1">
                          {STEPS.map((s, i) => (
                            <div key={s} className="flex-1 h-1.5 rounded-full transition-all duration-500"
                              style={{background: i <= stepIdx ? cfg.accent : '#e5e7eb'}}/>
                          ))}
                        </div>
                        <div className="flex justify-between">
                          {STEPS.map(s => (
                            <span key={s} className="text-xs capitalize font-semibold"
                              style={{color: STEPS.indexOf(s) <= stepIdx ? cfg.text : '#d1d5db'}}>
                              {s.slice(0,4)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)'}}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="h-1.5" style={{background: STATUS_CFG[selected.status]?.accent || '#f97316'}}/>
            <div className="p-6">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h2 className="font-black text-xl text-gray-900">Order Details</h2>
                  <div className="font-mono text-sm text-gray-400 mt-0.5">#{selected.order_number?.slice(-8)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-3 py-1.5 rounded-full"
                    style={{background: STATUS_CFG[selected.status]?.bg, color: STATUS_CFG[selected.status]?.text}}>
                    {STATUS_CFG[selected.status]?.icon} {STATUS_CFG[selected.status]?.label}
                  </span>
                  <button onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold transition">×</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  ['Payment', <span key="p" className="font-black capitalize flex items-center gap-1.5"
                    style={{color: PAYMENT_CFG[selected.payment_method]?.color}}>
                    {PAYMENT_CFG[selected.payment_method]?.label}
                  </span>],
                  ['Ordered', <span key="t">{new Date(selected.created_at).toLocaleString('en',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</span>],
                ].map(([label, val]) => (
                  <div key={label} className="p-3 rounded-2xl" style={{background: '#f8f7f5'}}>
                    <div className="text-xs text-gray-400 font-semibold mb-1">{label}</div>
                    <div className="text-sm font-bold text-gray-800">{val}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 mb-4">
                {selected.order_items?.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl"
                    style={{background: '#f8f7f5'}}>
                    <span className="text-sm font-bold text-gray-800">
                      {item.menu_item?.name}
                      <span className="text-gray-400 font-normal ml-1">×{item.quantity}</span>
                    </span>
                    <span className="text-sm font-black text-gray-900">₱{parseFloat(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center font-black text-lg pt-3 mb-4"
                style={{borderTop: '1px solid #f0f0f0'}}>
                <span className="text-gray-900">Total</span>
                <span style={{color: STATUS_CFG[selected.status]?.accent}}>
                  ₱{parseFloat(selected.total_amount).toFixed(2)}
                </span>
              </div>

              <div className="flex gap-2">
                {['pending','preparing','ready'].includes(selected.status) && (
                  <button onClick={() => { setTracking(selected); setSelected(null); }}
                    className="flex-1 py-3 text-white font-black rounded-2xl transition hover:scale-[1.02] active:scale-95"
                    style={{background: `linear-gradient(135deg,${STATUS_CFG[selected.status]?.accent},${STATUS_CFG[selected.status]?.accent}cc)`}}>
                    📡 Live Track
                  </button>
                )}
                {selected.status === 'completed' && (
                  <button onClick={() => handleReorder(selected)}
                    className="flex-1 py-3 font-black rounded-2xl transition hover:scale-[1.02] active:scale-95"
                    style={{background: '#fff7ed', color: '#f97316', border: '2px solid #fed7aa'}}>
                    🔁 Reorder
                  </button>
                )}
                <button onClick={() => setSelected(null)}
                  className="flex-1 py-3 font-bold text-sm rounded-2xl transition hover:bg-gray-200"
                  style={{background: '#f3f4f6', color: '#6b7280'}}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tracking && <OrderTracker order={tracking} onClose={() => setTracking(null)}/>}
      {showPlace && (
        <PlaceOrderModal
          onClose={() => { setShowPlace(false); setReorderItems(null); }}
          onSuccess={handleSuccess}
          prefillItems={reorderItems}/>
      )}
    </div>
  );
}


function AllOrders() {
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected]         = useState(null);

  const fetchOrders = () => {
    const params = statusFilter !== 'all' ? { status: statusFilter } : {};
    orderService.getOrders(params).then(r => { setOrders(r.data.data ?? r.data); setLoading(false); });
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]); 

  const handleAdvance = async (order) => {
    const next = { pending: 'preparing', preparing: 'ready', ready: 'completed' }[order.status];
    if (!next) return;
    await orderService.updateStatus(order.id, next);
    fetchOrders(); setSelected(null);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{background: '#f8f7f5'}}>
      <div className="bg-white px-6 py-4 flex-shrink-0 shadow-sm" style={{borderBottom: '1px solid #f0f0f0'}}>
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-black text-gray-900">All Orders</h1>
          <button onClick={fetchOrders} className="px-4 py-2 text-xs font-bold rounded-xl transition hover:bg-gray-100 text-gray-500"
            style={{border: '1px solid #e5e7eb'}}>🔄 Refresh</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {['all','pending','preparing','ready','completed','cancelled'].map(s => {
            const cfg   = STATUS_CFG[s];
            const count = s !== 'all' ? orders.filter(o => o.status === s).length : orders.length;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="px-3 py-1.5 rounded-full text-xs font-bold capitalize transition flex items-center gap-1.5"
                style={statusFilter === s
                  ? {background: s==='all' ? 'linear-gradient(135deg,#f97316,#ea580c)' : cfg.bg, color: s==='all' ? '#fff' : cfg.text, border: `1.5px solid ${s==='all' ? 'transparent' : cfg.accent}`}
                  : {background: '#f3f4f6', color: '#6b7280', border: '1.5px solid transparent'}}>
                {s !== 'all' && cfg.icon} {s === 'all' ? 'All' : cfg.label}
                <span className="font-black opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {loading ? <div className="text-center py-16 text-gray-400">Loading...</div> : (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{border: '1px solid #f0f0f0'}}>
            <table className="w-full text-sm">
              <thead style={{background: '#fafafa', borderBottom: '1px solid #f0f0f0'}}>
                <tr>{['Order #','Time','Items','Total','Payment','Status','Action'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {orders.map((order, i) => {
                  const cfg  = STATUS_CFG[order.status] || STATUS_CFG.pending;
                  const pcfg = PAYMENT_CFG[order.payment_method] || PAYMENT_CFG.cash;
                  return (
                    <tr key={order.id} onClick={() => setSelected(order)}
                      className="cursor-pointer hover:bg-orange-50 transition"
                      style={{borderBottom: '1px solid #f8f8f8', background: i % 2 !== 0 ? '#fafafa' : '#fff'}}>
                      <td className="px-4 py-3 font-mono text-xs font-black" style={{color: '#f97316'}}>#{order.order_number?.slice(-8)}</td>
                      <td className="px-4 py-3 text-xs text-gray-400 font-medium">
                        {new Date(order.created_at).toLocaleString('en',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-gray-600">{order.order_items?.length} item{order.order_items?.length !== 1 ? 's' : ''}</td>
                      <td className="px-4 py-3 font-black text-gray-900">₱{parseFloat(order.total_amount).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg capitalize"
                          style={{background: pcfg.bg, color: pcfg.color}}>{pcfg.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-black px-2.5 py-1 rounded-full"
                          style={{background: cfg.bg, color: cfg.text}}>{cfg.icon} {cfg.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        {['pending','preparing','ready'].includes(order.status) && (
                          <button onClick={e => { e.stopPropagation(); handleAdvance(order); }}
                            className="px-3 py-1.5 text-xs font-black text-white rounded-xl transition hover:scale-105 active:scale-95 shadow-sm"
                            style={{background: 'linear-gradient(135deg,#f97316,#ea580c)'}}>
                            Advance →
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {orders.length === 0 && <div className="text-center py-12 text-gray-400 text-sm font-semibold">No orders found</div>}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)'}}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="h-1.5" style={{background: STATUS_CFG[selected.status]?.accent || '#f97316'}}/>
            <div className="p-6">
              <div className="flex justify-between mb-5">
                <div>
                  <h2 className="font-black text-xl">Order Details</h2>
                  <div className="font-mono text-sm text-gray-400">#{selected.order_number?.slice(-8)}</div>
                </div>
                <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold transition">×</button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[
                  ['Status', <span key="s" className="font-black capitalize" style={{color: STATUS_CFG[selected.status]?.accent}}>{STATUS_CFG[selected.status]?.icon} {selected.status}</span>],
                  ['Payment', <span key="p" className="font-bold capitalize" style={{color: PAYMENT_CFG[selected.payment_method]?.color}}>{PAYMENT_CFG[selected.payment_method]?.label}</span>],
                ].map(([label, val]) => (
                  <div key={label} className="p-3 rounded-2xl" style={{background: '#f8f7f5'}}>
                    <div className="text-xs text-gray-400 font-semibold mb-1">{label}</div>
                    <div className="text-sm font-bold">{val}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2 mb-4">
                {selected.order_items?.map(item => (
                  <div key={item.id} className="flex justify-between p-3 rounded-2xl text-sm" style={{background: '#f8f7f5'}}>
                    <span className="font-bold text-gray-800">{item.menu_item?.name} <span className="text-gray-400 font-normal">×{item.quantity}</span></span>
                    <span className="font-black">₱{parseFloat(item.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center font-black text-lg pt-3" style={{borderTop: '1px solid #f0f0f0'}}>
                <span>Total</span>
                <span style={{color: '#f97316'}}>₱{parseFloat(selected.total_amount).toFixed(2)}</span>
              </div>
              {['pending','preparing','ready'].includes(selected.status) && (
                <button onClick={() => handleAdvance(selected)}
                  className="w-full mt-4 py-3 text-white font-black rounded-2xl transition hover:scale-[1.02]"
                  style={{background: 'linear-gradient(135deg,#f97316,#ea580c)'}}>
                  Advance Order →
                </button>
              )}
              <button onClick={() => setSelected(null)}
                className="w-full mt-2 py-2.5 font-bold text-sm rounded-2xl transition hover:bg-gray-200"
                style={{background: '#f3f4f6', color: '#6b7280'}}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  return (!user || user.role === 'customer') ? <MyOrders /> : <AllOrders />;
}
