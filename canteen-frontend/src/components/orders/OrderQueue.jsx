import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../../services/orderService';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-400', next: 'preparing' },
  preparing: { label: 'Preparing', color: 'bg-blue-100 text-blue-800',    dot: 'bg-blue-500',   next: 'ready' },
  ready:     { label: 'Ready',     color: 'bg-green-100 text-green-800',   dot: 'bg-green-500',  next: 'completed' },
  completed: { label: 'Done',      color: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400',   next: null },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-600',       dot: 'bg-red-400',    next: null },
};

const NEXT_LABEL = { preparing: 'Start Preparing', ready: 'Mark Ready', completed: 'Complete' };

export default function OrderQueue() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = useCallback(async () => {
    try {
      const res = await orderService.getQueue();
      setOrders(res.data);
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const advance = async (order) => {
    const cfg = STATUS_CONFIG[order.status];
    if (!cfg?.next) return;
    try {
      await orderService.updateStatus(order.id, cfg.next);
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    }
  };

  const cancel = async (order) => {
    if (!window.confirm(`Cancel order ${order.order_number}?`)) return;
    try {
      await orderService.cancelOrder(order.id);
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot cancel');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading queue...</div>;

  const cols = ['pending', 'preparing', 'ready'];

  return (
    <div className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Order Queue</h1>
        <button onClick={fetchQueue} className="text-sm text-amber-600 hover:text-amber-700 font-semibold">
          🔄 Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 h-full">
        {cols.map(status => {
          const cfg      = STATUS_CONFIG[status];
          const colOrders = orders.filter(o => o.status === status);
          return (
            <div key={status} className="flex flex-col">
              {/* Column header */}
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl mb-3 ${cfg.color} font-semibold`}>
                <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
                <span className="ml-auto text-xs bg-white bg-opacity-60 px-2 py-0.5 rounded-full">
                  {colOrders.length}
                </span>
              </div>

              {/* Order cards */}
              <div className="flex-1 space-y-3 overflow-y-auto">
                {colOrders.length === 0 && (
                  <div className="text-center text-gray-300 py-8 text-sm">No orders</div>
                )}
                {colOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-amber-600">
                        {order.order_number.slice(-8)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Items */}
                    <div className="space-y-1 mb-3">
                      {order.order_items?.map(item => (
                        <div key={item.id} className="flex justify-between text-xs text-gray-700">
                          <span className="truncate">{item.menu_item?.name}</span>
                          <span className="font-semibold ml-2 shrink-0">×{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                      <span className="text-sm font-bold text-gray-800">
                        ₱{parseFloat(order.total_amount).toFixed(2)}
                      </span>
                      <div className="flex gap-1">
                        {cfg.next && (
                          <button
                            onClick={() => advance(order)}
                            className="px-2 py-1 text-xs bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-semibold"
                          >
                            {NEXT_LABEL[cfg.next]}
                          </button>
                        )}
                        {status !== 'completed' && (
                          <button
                            onClick={() => cancel(order)}
                            className="px-2 py-1 text-xs bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
