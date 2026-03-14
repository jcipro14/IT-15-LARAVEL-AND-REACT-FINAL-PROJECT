import { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function InventoryTable() {
  const { user } = useAuth();
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filter, setFilter]         = useState('all');
  const [adjustItem, setAdjustItem] = useState(null);

  const fetchItems = () => {
    const params = { per_page: 100 };
    if (filter === 'low') params.low_stock = 1;
    if (filter === 'out') params.out_of_stock = 1;
    api.get('/inventory', { params }).then(r => {
      setItems(r.data.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchItems(); }, [filter]);

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const getStockBadge = (item) => {
    if (item.stock_quantity <= 0)
      return { label: 'Out of Stock', bg: '#fee2e2', color: '#b91c1c' };
    if (item.stock_quantity <= item.low_stock_threshold)
      return { label: 'Low Stock', bg: '#ffedd5', color: '#c2410c' };
    return { label: 'In Stock', bg: '#dcfce7', color: '#15803d' };
  };

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{background: '#f8f7f5'}}>
      {/* Header */}
      <div className="bg-white px-6 py-4 flex-shrink-0 shadow-sm" style={{borderBottom: '1px solid #f0f0f0'}}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black text-gray-900">Inventory</h1>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} items</p>
          </div>
          <button onClick={() => setAdjustItem({ bulk: true })}
            className="px-4 py-2 text-white text-xs font-black rounded-xl shadow transition hover:scale-105 active:scale-95"
            style={{background: 'linear-gradient(135deg, #f97316, #ea580c)'}}>
            📦 Bulk Restock
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <input type="text" placeholder="Search items..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 rounded-xl text-sm focus:outline-none transition flex-1 min-w-40"
            style={{background: '#f8f7f5', border: '2px solid transparent'}}
            onFocus={e => e.target.style.borderColor = '#f97316'}
            onBlur={e => e.target.style.borderColor = 'transparent'}/>
          {['all','low','out'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-xs font-bold capitalize transition"
              style={filter === f
                ? {background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff'}
                : {background: '#f3f4f6', color: '#6b7280'}}>
              {f === 'all' ? 'All' : f === 'low' ? '⚠ Low Stock' : '✕ Out of Stock'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto p-5">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{border: '1px solid #f0f0f0'}}>
          <table className="w-full text-sm">
            <thead style={{background: '#fafafa', borderBottom: '1px solid #f0f0f0'}}>
              <tr>
                {['Item','Category','Price','Stock','Threshold','Status','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-black text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => {
                const badge = getStockBadge(item);
                return (
                  <tr key={item.id} className="hover:bg-orange-50 transition"
                    style={{borderBottom: '1px solid #f8f8f8', background: i % 2 !== 0 ? '#fafafa' : '#fff'}}>
                    <td className="px-4 py-3 font-bold text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{item.category?.icon} {item.category?.name}</td>
                    <td className="px-4 py-3 font-black text-sm" style={{color: '#f97316'}}>₱{parseFloat(item.price).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className="font-black text-lg" style={{
                        color: item.stock_quantity <= 0 ? '#dc2626'
                          : item.stock_quantity <= item.low_stock_threshold ? '#ea580c'
                          : '#374151'
                      }}>{item.stock_quantity}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{item.low_stock_threshold}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-black"
                        style={{background: badge.bg, color: badge.color}}>{badge.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setAdjustItem(item)}
                        className="px-3 py-1.5 text-xs font-black text-white rounded-xl transition hover:scale-105 active:scale-95 shadow-sm"
                        style={{background: 'linear-gradient(135deg, #3b82f6, #2563eb)'}}>
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center text-gray-400 py-12 text-sm font-semibold">No items found</div>
          )}
        </div>
      </div>

      {adjustItem && (
        <AdjustModal
          item={adjustItem}
          onClose={() => setAdjustItem(null)}
          onSaved={() => { setAdjustItem(null); fetchItems(); }}
          allItems={items}
        />
      )}
    </div>
  );
}

function AdjustModal({ item, onClose, onSaved, allItems }) {
  const isBulk = item?.bulk === true;

  // Single item state
  const [form, setForm]   = useState({ type: 'restock', quantity: '', reason: '' });
  // Bulk state
  const [bulkQty, setBulkQty]       = useState('');
  const [bulkReason, setBulkReason] = useState('');
  const [selected, setSelected]     = useState([]);

  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const toggleSelect = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBulk) {
      if (selected.length === 0) { setError('Select at least one item.'); return; }
      if (!bulkQty || parseInt(bulkQty) <= 0) { setError('Enter a valid quantity.'); return; }
      if (!bulkReason.trim()) { setError('Reason is required.'); return; }
    }
    setSaving(true); setError('');
    try {
      if (isBulk) {
        // Sequential individual adjusts for each selected item
        await Promise.all(selected.map(id =>
          api.patch(`/inventory/${id}/adjust`, {
            type: 'restock',
            quantity: parseInt(bulkQty),
            reason: bulkReason,
          })
        ));
      } else {
        await api.patch(`/inventory/${item.id}/adjust`, form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to adjust stock.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)'}}>
      <div className="bg-white rounded-3xl shadow-2xl w-full overflow-hidden"
        style={{maxWidth: isBulk ? '560px' : '420px', maxHeight: '90vh', display: 'flex', flexDirection: 'column'}}>
        {/* Header */}
        <div className="px-6 py-4 flex-shrink-0" style={{borderBottom: '1px solid #f0f0f0'}}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-black text-lg text-gray-900">
                {isBulk ? '📦 Bulk Restock' : `Adjust Stock`}
              </h2>
              {!isBulk && <p className="text-xs text-gray-400 mt-0.5">{item.name} · Current: <span className="font-bold text-gray-700">{item.stock_quantity}</span></p>}
              {isBulk && <p className="text-xs text-gray-400 mt-0.5">Select items and set restock quantity</p>}
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold transition">×</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {error && (
              <div className="text-xs font-bold p-3 rounded-xl"
                style={{background: '#fee2e2', color: '#b91c1c'}}>⚠ {error}</div>
            )}

            {isBulk ? (
              <>
                {/* Item selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Items</span>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setSelected(allItems.map(i => i.id))}
                        className="text-xs font-bold text-orange-500 hover:text-orange-600">All</button>
                      <span className="text-gray-300">·</span>
                      <button type="button" onClick={() => setSelected([])}
                        className="text-xs font-bold text-gray-400 hover:text-gray-600">None</button>
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden max-h-48 overflow-y-auto"
                    style={{border: '1px solid #f0f0f0'}}>
                    {allItems.map((i, idx) => (
                      <label key={i.id}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-orange-50 transition"
                        style={{background: selected.includes(i.id) ? '#fff7ed' : idx % 2 !== 0 ? '#fafafa' : '#fff', borderBottom: '1px solid #f8f8f8'}}>
                        <input type="checkbox" checked={selected.includes(i.id)}
                          onChange={() => toggleSelect(i.id)}
                          className="rounded accent-orange-500"/>
                        <span className="flex-1 text-sm font-semibold text-gray-800">{i.name}</span>
                        <span className="text-xs font-black" style={{color: i.stock_quantity <= 0 ? '#dc2626' : i.stock_quantity <= i.low_stock_threshold ? '#ea580c' : '#9ca3af'}}>
                          {i.stock_quantity} in stock
                        </span>
                      </label>
                    ))}
                  </div>
                  {selected.length > 0 && (
                    <p className="text-xs text-orange-500 font-bold mt-1.5">{selected.length} item{selected.length !== 1 ? 's' : ''} selected</p>
                  )}
                </div>

                {/* Bulk quantity */}
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Quantity to add to each</label>
                  <input required type="number" min="1" value={bulkQty}
                    onChange={e => setBulkQty(e.target.value)} placeholder="e.g. 50"
                    className="w-full px-4 py-3 rounded-2xl text-sm font-bold focus:outline-none transition"
                    style={{background: '#f8f7f5', border: '2px solid transparent'}}
                    onFocus={e => e.target.style.borderColor = '#f97316'}
                    onBlur={e => e.target.style.borderColor = 'transparent'}/>
                </div>

                {/* Bulk reason */}
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Reason</label>
                  <input required value={bulkReason}
                    onChange={e => setBulkReason(e.target.value)} placeholder="e.g. Weekly delivery"
                    className="w-full px-4 py-3 rounded-2xl text-sm font-bold focus:outline-none transition"
                    style={{background: '#f8f7f5', border: '2px solid transparent'}}
                    onFocus={e => e.target.style.borderColor = '#f97316'}
                    onBlur={e => e.target.style.borderColor = 'transparent'}/>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Type</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl text-sm font-bold focus:outline-none transition"
                    style={{background: '#f8f7f5', border: '2px solid transparent'}}>
                    <option value="restock">Restock (+)</option>
                    <option value="adjustment">Adjustment (±)</option>
                    <option value="waste">Waste (−)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Quantity</label>
                  <input required type="number" value={form.quantity}
                    onChange={e => setForm({...form, quantity: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl text-sm font-bold focus:outline-none transition"
                    style={{background: '#f8f7f5', border: '2px solid transparent'}}
                    onFocus={e => e.target.style.borderColor = '#f97316'}
                    onBlur={e => e.target.style.borderColor = 'transparent'}/>
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">Reason</label>
                  <input required value={form.reason}
                    onChange={e => setForm({...form, reason: e.target.value})}
                    placeholder="e.g. Weekly delivery"
                    className="w-full px-4 py-3 rounded-2xl text-sm font-bold focus:outline-none transition"
                    style={{background: '#f8f7f5', border: '2px solid transparent'}}
                    onFocus={e => e.target.style.borderColor = '#f97316'}
                    onBlur={e => e.target.style.borderColor = 'transparent'}/>
                </div>
              </>
            )}
          </div>

          {/* Footer buttons */}
          <div className="px-6 py-4 flex-shrink-0 flex gap-3" style={{borderTop: '1px solid #f0f0f0'}}>
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-sm font-bold text-gray-600 transition hover:bg-gray-200"
              style={{background: '#f3f4f6'}}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 rounded-2xl text-sm font-black text-white transition hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-lg"
              style={{background: 'linear-gradient(135deg, #f97316, #ea580c)'}}>
              {saving ? 'Saving...' : isBulk ? `Restock ${selected.length} Item${selected.length !== 1 ? 's' : ''}` : 'Apply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
