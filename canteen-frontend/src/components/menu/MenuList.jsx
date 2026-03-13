import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import { orderService } from '../../services/orderService';

function MenuItemCard({ item, onToggle, onEdit, onDelete, isAdmin, onAdd }) {
  const isLow = item.stock_quantity <= item.low_stock_threshold && item.stock_quantity > 0;
  const isOut = item.stock_quantity <= 0;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition hover:shadow-md ${
      !item.is_available ? 'opacity-60' : ''
    }`}>
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-center relative">
        {item.is_featured && (
          <span className="absolute top-2 left-2 text-xs bg-amber-400 text-white px-2 py-0.5 rounded-full font-semibold">⭐ Featured</span>
        )}
        <span className="text-4xl">{item.category?.icon || '🍽️'}</span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-800 text-sm leading-tight">{item.name}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 font-semibold ${
            isOut ? 'bg-red-100 text-red-600' :
            isLow ? 'bg-orange-100 text-orange-600' :
            item.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {isOut ? 'Out' : isLow ? 'Low' : item.is_available ? 'Available' : 'Unavailable'}
          </span>
        </div>
        {item.description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-amber-600">₱{parseFloat(item.price).toFixed(2)}</span>
          <span className="text-xs text-gray-400">Stock: {item.stock_quantity}</span>
        </div>
        {isAdmin ? (
          <div className="flex gap-2 mt-3">
            <button onClick={() => onToggle(item)}
              className={`flex-1 py-1.5 text-xs rounded-lg font-semibold transition ${
                item.is_available ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
              }`}>
              {item.is_available ? 'Disable' : 'Enable'}
            </button>
            <button onClick={() => onEdit(item)} className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">Edit</button>
            <button onClick={() => onDelete(item)} className="px-3 py-1.5 text-xs bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition">✕</button>
          </div>
        ) : (
          <button
            onClick={() => onAdd(item)}
            disabled={!item.is_available || isOut}
            className="w-full mt-3 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {isOut ? 'Out of Stock' : '+ Add to Tray'}
          </button>
        )}
      </div>
    </div>
  );
}

function CustomerCart({ cart, onRemove, onUpdateQty, onClear, onPlaceOrder, submitting, error }) {
  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col shadow-xl">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Your Tray</h2>
          {cart.items.length > 0 && (
            <button onClick={onClear} className="text-xs text-red-400 hover:text-red-600">Clear</button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.items.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-2">🛒</div>
            <div className="text-sm">Your tray is empty</div>
          </div>
        ) : (
          cart.items.map(item => (
            <div key={item.id} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate">{item.name}</div>
                  <div className="text-xs text-amber-600">₱{(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-full bg-gray-200 hover:bg-red-100 text-sm flex items-center justify-center">−</button>
                  <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                    className="w-6 h-6 rounded-full bg-gray-200 hover:bg-green-100 text-sm flex items-center justify-center">+</button>
                  <button onClick={() => onRemove(item.id)}
                    className="w-6 h-6 rounded-full bg-red-50 text-red-400 hover:bg-red-100 text-sm flex items-center justify-center ml-1">✕</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {cart.items.length > 0 && (
        <div className="p-4 border-t border-gray-100">
          {error && <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg mb-3">{error}</div>}
          <div className="flex justify-between font-bold text-gray-900 mb-4">
            <span>Total</span>
            <span className="text-amber-600">₱{subtotal.toFixed(2)}</span>
          </div>
          <button
            onClick={onPlaceOrder}
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl disabled:opacity-50 hover:opacity-90 transition shadow-lg text-sm"
          >
            {submitting ? 'Placing Order...' : `Place Order • ₱${subtotal.toFixed(2)}`}
          </button>
        </div>
      )}
    </div>
  );
}

export default function MenuList() {
  const { isAdmin, isCashier, isCustomer, user } = useAuth();
  const { cart, addItem, removeItem, updateQty, clearCart } = useCart();
  const [categories, setCategories] = useState([]);
  const [items, setItems]           = useState([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  const fetchItems = () => {
    api.get('/menu', { params: { per_page: 100 } }).then(r => {
      setItems(r.data.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data));
    fetchItems();
  }, []);

  const filtered = items.filter(item => {
    const matchCat    = selectedCat === 'all' || item.category_id === Number(selectedCat);
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleToggle = async (item) => {
    await api.patch(`/menu/${item.id}/toggle-availability`);
    fetchItems();
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    await api.delete(`/menu/${item.id}`);
    fetchItems();
  };

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) return;
    setSubmitting(true);
    setOrderError('');
    try {
      await orderService.createOrder({
        items: cart.items.map(i => ({
          menu_item_id: i.id,
          quantity: i.quantity,
        })),
        payment_method: 'cash',
        user_id: user?.id,
      });
      clearCart();
      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 4000);
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Menu</h1>
              <p className="text-sm text-gray-400">{items.length} items across {categories.length} categories</p>
            </div>
            {isAdmin && (
              <button onClick={() => { setEditItem(null); setShowForm(true); }}
                className="px-4 py-2 bg-amber-500 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition shadow">
                + Add Item
              </button>
            )}
          </div>
          {orderSuccess && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-semibold">
              ✅ Order placed successfully! Track it in My Orders.
            </div>
          )}
          <input type="text" placeholder="Search menu..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 mb-3" />
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setSelectedCat('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                selectedCat === 'all' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-amber-100'
              }`}>All</button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCat(String(cat.id))}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                  selectedCat === String(cat.id) ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-amber-100'
                }`}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading menu...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map(item => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  isAdmin={isAdmin}
                  onToggle={handleToggle}
                  onEdit={(i) => { setEditItem(i); setShowForm(true); }}
                  onDelete={handleDelete}
                  onAdd={addItem}
                />
              ))}
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center text-gray-400 py-16 text-sm">No items found</div>
          )}
        </div>
      </div>

      {(isCustomer || isCashier) && (
        <CustomerCart
          cart={cart}
          onRemove={removeItem}
          onUpdateQty={updateQty}
          onClear={clearCart}
          onPlaceOrder={handlePlaceOrder}
          submitting={submitting}
          error={orderError}
        />
      )}

      {showForm && (
        <MenuForm
          item={editItem}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchItems(); }}
        />
      )}
    </div>
  );
}

function MenuForm({ item, categories, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: item?.name || '',
    category_id: item?.category_id || '',
    description: item?.description || '',
    price: item?.price || '',
    stock_quantity: item?.stock_quantity || 0,
    low_stock_threshold: item?.low_stock_threshold || 10,
    is_available: item?.is_available ?? true,
    is_featured: item?.is_featured ?? false,
    preparation_time: item?.preparation_time || 5,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (item) {
        await api.put(`/menu/${item.id}`, form);
      } else {
        await api.post('/menu', form);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{item ? 'Edit Item' : 'Add Menu Item'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        {error && <div className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600">Name *</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Category *</label>
              <select required value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option value="">Select...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Price (₱) *</label>
              <input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600">Stock Qty</label>
              <input type="number" min="0" value={form.stock_quantity} onChange={e => setForm({...form, stock_quantity: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={form.is_available} onChange={e => setForm({...form, is_available: e.target.checked})} className="rounded text-amber-500" />
              Available
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} className="rounded text-amber-500" />
              Featured
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 disabled:opacity-50 transition">
              {saving ? 'Saving...' : item ? 'Update' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
