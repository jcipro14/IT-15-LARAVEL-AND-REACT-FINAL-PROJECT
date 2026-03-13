import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function LowStockAlert({ onDismiss }) {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    api.get('/inventory/low-stock')
      .then(r => { setItems(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || items.length === 0 || dismissed) return null;

  const outOfStock = items.filter(i => i.stock_quantity <= 0);
  const lowStock   = items.filter(i => i.stock_quantity > 0);

  return (
    <div className="mb-4 bg-orange-50 border border-orange-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-orange-100 border-b border-orange-200">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <span className="font-bold text-orange-800 text-sm">
            Stock Alert — {items.length} item{items.length !== 1 ? 's' : ''} need attention
          </span>
          {outOfStock.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {outOfStock.length} out of stock
            </span>
          )}
        </div>
        <button
          onClick={() => { setDismissed(true); onDismiss?.(); }}
          className="text-orange-400 hover:text-orange-600 transition text-lg leading-none"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>

      {/* Items */}
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {outOfStock.map(item => (
            <div key={item.id} className="flex items-center gap-1.5 bg-red-100 border border-red-200 rounded-xl px-3 py-1.5">
              <span className="text-red-500 font-bold text-xs">OUT</span>
              <span className="text-sm font-semibold text-red-700">{item.name}</span>
              <span className="text-xs text-red-400">(0 left)</span>
            </div>
          ))}
          {lowStock.map(item => (
            <div key={item.id} className="flex items-center gap-1.5 bg-orange-100 border border-orange-200 rounded-xl px-3 py-1.5">
              <span className="text-orange-500 font-bold text-xs">LOW</span>
              <span className="text-sm font-semibold text-orange-700">{item.name}</span>
              <span className="text-xs text-orange-400">({item.stock_quantity} left)</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-orange-600 mt-3">
          Go to <strong>Inventory</strong> to restock these items.
        </p>
      </div>
    </div>
  );
}
