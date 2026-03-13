import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function InventoryTable() {
  const { user } = useAuth();
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('all'); // all | low | out
  const [adjustItem, setAdjustItem] = useState(null);

  const fetchItems = () => {
    const params = { per_page: 100 };
    if (filter === 'low') params.low_stock = 1;
    if (filter === 'out')  params.out_of_stock = 1;
    api.get('/inventory', { params }).then(r => {
      setItems(r.data.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchItems(); }, [filter]);

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const getStockBadge = (item) => {
    if (item.stock_quantity <= 0) return { label: 'Out of Stock', cls: 'bg-red-100 text-red-700' };
    if (item.stock_quantity <= item.low_stock_threshold) return { label: 'Low Stock', cls: 'bg-orange-100 text-orange-700' };
    return { label: 'In Stock', cls: 'bg-green-100 text-green-700' };
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
        <button
          onClick={() => setAdjustItem({ bulk: true })}
          className="px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition shadow"
        >
          📦 Bulk Restock
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text" placeholder="Search items..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        {['all','low','out'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition ${
              filter === f ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-amber-100'
            }`}>
            {f === 'all' ? 'All' : f === 'low' ? '⚠️ Low Stock' : '❌ Out of Stock'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Item', 'Category', 'Price', 'Stock', 'Threshold', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(item => {
              const badge = getStockBadge(item);
              return (
                <tr key={item.id} className="hover:bg-amber-50 transition">
                  <td className="px-4 py-3 font-semibold text-gray-800">{item.name}</td>
                  <td className="px-4 py-3 text-gray-500">{item.category?.icon} {item.category?.name}</td>
                  <td className="px-4 py-3 text-amber-600 font-semibold">₱{parseFloat(item.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold text-lg ${
                      item.stock_quantity <= 0 ? 'text-red-600' :
                      item.stock_quantity <= item.low_stock_threshold ? 'text-orange-500' : 'text-gray-800'
                    }`}>{item.stock_quantity}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{item.low_stock_threshold}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setAdjustItem(item)}
                      className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition font-semibold"
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center text-gray-400 py-12 text-sm">No items found</div>
        )}
      </div>

      {/* Adjust modal */}
      {adjustItem && (
        <AdjustModal
          item={adjustItem}
          onClose={() => setAdjustItem(null)}
          onSaved={() => { setAdjustItem(null); fetchItems(); }}
          userId={user?.id}
        />
      )}
    </div>
  );
}

function AdjustModal({ item, onClose, onSaved, userId }) {
  const [form, setForm] = useState({ type: 'restock', quantity: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.patch(`/inventory/${item.id}/adjust`, form);
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to adjust');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Adjust Stock — {item.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        {error && <div className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded-lg">{error}</div>}
        <p className="text-sm text-gray-500 mb-4">Current stock: <span className="font-bold text-gray-800">{item.stock_quantity}</span></p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600">Type</label>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="restock">Restock (+)</option>
              <option value="adjustment">Adjustment (±)</option>
              <option value="waste">Waste (−)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Quantity</label>
            <input required type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Reason *</label>
            <input required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})}
              placeholder="e.g. Weekly delivery"
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-50 transition">
              {saving ? 'Saving...' : 'Apply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
