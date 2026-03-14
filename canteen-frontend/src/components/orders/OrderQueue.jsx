import { useState, useEffect, useCallback } from 'react';
import { orderService } from '../../services/orderService';

const COLS = {
  pending: {
    label: 'Pending',
    icon: '⏳',
    accent: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
    badge: '#fef3c7',
    badgeText: '#92400e',
    next: 'preparing',
    nextLabel: 'Start Preparing',
    nextColor: '#3b82f6',
  },
  preparing: {
    label: 'Preparing',
    icon: '👨‍🍳',
    accent: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
    badge: '#dbeafe',
    badgeText: '#1e40af',
    next: 'ready',
    nextLabel: 'Mark Ready',
    nextColor: '#22c55e',
  },
  ready: {
    label: 'Ready',
    icon: '✅',
    accent: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.2)',
    badge: '#dcfce7',
    badgeText: '#166534',
    next: 'completed',
    nextLabel: 'Complete',
    nextColor: '#8b5cf6',
  },
};

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function OrderCard({ order, cfg, onAdvance, onCancel, advancing }) {
  const [elapsed, setElapsed] = useState(timeAgo(order.created_at));

  useEffect(() => {
    const t = setInterval(() => setElapsed(timeAgo(order.created_at)), 10000);
    return () => clearInterval(t);
  }, [order.created_at]);

  const mins = Math.floor((Date.now() - new Date(order.created_at)) / 60000);
  const isUrgent = mins >= 10 && order.status !== 'ready';

  return (
    <div className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        background: '#fff',
        border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.3)' : cfg.border}`,
        boxShadow: isUrgent ? '0 0 0 1px rgba(239,68,68,0.15)' : '0 1px 4px rgba(0,0,0,0.06)',
      }}>
      {/* Top accent bar */}
      <div className="h-1 w-full" style={{background: isUrgent ? '#ef4444' : cfg.accent}} />

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="font-black text-gray-900 text-sm font-mono tracking-tight">
              #{order.order_number.slice(-6)}
            </div>
            <div className={`text-xs mt-0.5 font-semibold ${isUrgent ? 'text-red-500' : 'text-gray-400'}`}>
              {isUrgent ? '🔥 ' : ''}{elapsed}
            </div>
          </div>
          <div className="text-right">
            <div className="font-black text-base" style={{color: cfg.accent}}>
              ₱{parseFloat(order.total_amount).toFixed(0)}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="space-y-1.5 mb-3 pb-3 border-b border-gray-100">
          {order.order_items?.map(item => (
            <div key={item.id} className="flex items-center justify-between">
              <span className="text-xs text-gray-700 font-medium truncate pr-2 flex-1">{item.menu_item?.name}</span>
              <span className="text-xs font-black text-gray-500 flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center"
                style={{background: cfg.bg}}>
                {item.quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {cfg.next && (
            <button onClick={() => onAdvance(order)} disabled={advancing}
              className="flex-1 py-2 text-xs font-black text-white rounded-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-sm"
              style={{background: `linear-gradient(135deg, ${cfg.nextColor}, ${cfg.nextColor}dd)`}}>
              {advancing ? '...' : cfg.nextLabel} →
            </button>
          )}
          <button onClick={() => onCancel(order)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xs text-red-400 hover:text-red-600 transition flex-shrink-0"
            style={{background: '#fef2f2', border: '1px solid #fecaca'}}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderQueue() {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [advancing, setAdvancing] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchQueue = useCallback(async () => {
    try {
      const res = await orderService.getQueue();
      setOrders(res.data);
      setLastRefresh(new Date());
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const advance = async (order) => {
    const cfg = COLS[order.status];
    if (!cfg?.next) return;
    setAdvancing(order.id);
    try {
      await orderService.updateStatus(order.id, cfg.next);
      await fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    } finally {
      setAdvancing(null);
    }
  };

  const cancel = async (order) => {
    if (!window.confirm(`Cancel order #${order.order_number.slice(-6)}?`)) return;
    try {
      await orderService.cancelOrder(order.id);
      fetchQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Cannot cancel');
    }
  };

  const totalActive = orders.filter(o => ['pending','preparing','ready'].includes(o.status)).length;

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center" style={{background: '#f8f7f5'}}>
        <div className="text-center">
          <div className="text-5xl mb-3 animate-pulse">🍱</div>
          <div className="text-gray-400 text-sm font-semibold">Loading queue...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{background: '#f8f7f5'}}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-black text-gray-900">Order Queue</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {totalActive} active · refreshes every 10s · last {lastRefresh.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}
              </p>
            </div>
            {/* Summary pills */}
            <div className="hidden md:flex items-center gap-2">
              {Object.entries(COLS).map(([status, cfg]) => {
                const count = orders.filter(o => o.status === status).length;
                return (
                  <div key={status} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{background: cfg.bg, color: cfg.accent, border: `1px solid ${cfg.border}`}}>
                    <span>{cfg.icon}</span>
                    <span>{cfg.label}</span>
                    <span className="w-5 h-5 rounded-full text-white flex items-center justify-center text-xs font-black"
                      style={{background: cfg.accent}}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <button onClick={fetchQueue}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition hover:scale-105 active:scale-95 text-white shadow"
            style={{background: 'linear-gradient(135deg, #f97316, #ea580c)'}}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Columns */}
      <div className="flex-1 overflow-hidden p-5">
        <div className="grid grid-cols-3 gap-5 h-full">
          {Object.entries(COLS).map(([status, cfg]) => {
            const colOrders = orders.filter(o => o.status === status);
            return (
              <div key={status} className="flex flex-col overflow-hidden rounded-2xl"
                style={{background: cfg.bg, border: `1px solid ${cfg.border}`}}>
                {/* Column header */}
                <div className="flex items-center gap-2.5 px-4 py-3 flex-shrink-0"
                  style={{borderBottom: `1px solid ${cfg.border}`}}>
                  <span className="text-lg">{cfg.icon}</span>
                  <span className="font-black text-sm" style={{color: cfg.accent}}>{cfg.label}</span>
                  <div className="ml-auto flex items-center justify-center w-6 h-6 rounded-full text-xs font-black text-white shadow-sm"
                    style={{background: cfg.accent}}>
                    {colOrders.length}
                  </div>
                </div>

                {/* Scrollable cards */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3"
                  style={{scrollbarWidth: 'thin', scrollbarColor: `${cfg.accent}40 transparent`}}>
                  {colOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-3xl mb-2 opacity-20">{cfg.icon}</div>
                      <p className="text-xs font-semibold opacity-30" style={{color: cfg.accent}}>No orders</p>
                    </div>
                  ) : (
                    colOrders.map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        cfg={cfg}
                        onAdvance={advance}
                        onCancel={cancel}
                        advancing={advancing === order.id}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
