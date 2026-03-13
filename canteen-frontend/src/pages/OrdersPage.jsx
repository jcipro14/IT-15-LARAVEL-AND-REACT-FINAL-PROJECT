import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';

const STATUS_COLORS = {
  pending:   'bg-yellow-100 text-yellow-800',
  preparing: 'bg-blue-100 text-blue-800',
  ready:     'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

const STATUS_ICONS = {
  pending:   '⏳',
  preparing: '👨‍🍳',
  ready:     '✅',
  completed: '🎉',
  cancelled: '❌',
};

// ── Customer view ─────────────────────────────────────────────
function MyOrders() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchOrders = () => {
    orderService.getMyOrders()
      .then(r => { setOrders(r.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="p-8 text-center text-gray-400">Loading your orders...</div>;

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
          <p className="text-sm text-gray-400">Track your order status here</p>
        </div>
        <button onClick={fetchOrders} className="text-sm text-amber-600 font-semibold">🔄 Refresh</button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-bold text-gray-700">No orders yet</h2>
          <p className="text-gray-400 mt-2 text-sm">Go to the menu and place your first order!</p>
          <a href="/menu" className="mt-4 inline-block px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition">
            Browse Menu
          </a>
        </div>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {orders.map(order => (
            <div key={order.id} onClick={() => setSelected(order)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-amber-200 transition">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-mono text-sm font-bold text-amber-600">{order.order_number}</span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.created_at).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[order.status]}`}>
                  {STATUS_ICONS[order.status]} {order.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {order.order_items?.slice(0, 3).map(item => (
                  <span key={item.id} className="mr-2">{item.menu_item?.name} ×{item.quantity}</span>
                ))}
                {order.order_items?.length > 3 && <span className="text-gray-400">+{order.order_items.length - 3} more</span>}
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-600 text-lg">₱{parseFloat(order.total_amount).toFixed(2)}</span>
                <span className="text-xs text-gray-400 capitalize">{order.payment_method}</span>
              </div>
              {order.status !== 'cancelled' && (
                <div className="mt-3 flex gap-1">
                  {['pending','preparing','ready','completed'].map(s => (
                    <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${
                      ['pending','preparing','ready','completed'].indexOf(s) <=
                      ['pending','preparing','ready','completed'].indexOf(order.status)
                        ? 'bg-amber-400' : 'bg-gray-100'
                    }`} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-lg">Order Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-sm font-bold text-amber-600">{selected.order_number}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[selected.status]}`}>
                {STATUS_ICONS[selected.status]} {selected.status}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              {selected.order_items?.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.menu_item?.name} <span className="text-gray-400">×{item.quantity}</span></span>
                  <span className="font-semibold">₱{parseFloat(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 text-sm font-bold flex justify-between">
              <span>Total</span>
              <span className="text-amber-600">₱{parseFloat(selected.total_amount).toFixed(2)}</span>
            </div>
            <button onClick={() => setSelected(null)}
              className="w-full mt-5 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Admin / Cashier view ──────────────────────────────────────
function AllOrders() {
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected]       = useState(null);

  const fetchOrders = () => {
    const params = statusFilter !== 'all' ? { status: statusFilter } : {};
    orderService.getOrders(params).then(r => {
      setOrders(r.data.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdvance = async (order) => {
    const next = { pending: 'preparing', preparing: 'ready', ready: 'completed' }[order.status];
    if (!next) return;
    await orderService.updateStatus(order.id, next);
    fetchOrders();
    setSelected(null);
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <button onClick={fetchOrders} className="text-sm text-amber-600 font-semibold">🔄 Refresh</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {['all','pending','preparing','ready','completed','cancelled'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition ${
              statusFilter === s ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-amber-100'
            }`}>
            {s === 'all' ? 'All Orders' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Order #','Time','Items','Total','Payment','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-amber-50 transition cursor-pointer" onClick={() => setSelected(order)}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-amber-600">{order.order_number}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(order.created_at).toLocaleString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{order.order_items?.length} item(s)</td>
                  <td className="px-4 py-3 font-bold text-gray-800">₱{parseFloat(order.total_amount).toFixed(2)}</td>
                  <td className="px-4 py-3 capitalize text-gray-500">{order.payment_method}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {['pending','preparing','ready'].includes(order.status) && (
                      <button onClick={(e) => { e.stopPropagation(); handleAdvance(order); }}
                        className="px-3 py-1 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-semibold">
                        Advance →
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No orders found</div>
          )}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-lg">Order Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-1 text-sm text-gray-600 mb-4">
              <p><strong>Order #:</strong> <span className="font-mono text-amber-600">{selected.order_number}</span></p>
              <p><strong>Status:</strong> <span className="capitalize">{selected.status}</span></p>
              <p><strong>Payment:</strong> <span className="capitalize">{selected.payment_method}</span></p>
            </div>
            <div className="border-t border-gray-100 py-3 space-y-2">
              {selected.order_items?.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.menu_item?.name} ×{item.quantity}</span>
                  <span className="font-semibold">₱{parseFloat(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 text-sm font-bold flex justify-between">
              <span>Total</span>
              <span className="text-amber-600">₱{parseFloat(selected.total_amount).toFixed(2)}</span>
            </div>
            <button onClick={() => setSelected(null)}
              className="w-full mt-5 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────
export default function OrdersPage() {
  const { user } = useAuth();
  const isCustomer = !user || user.role === "customer";
  return isCustomer ? <MyOrders /> : <AllOrders />;
}
