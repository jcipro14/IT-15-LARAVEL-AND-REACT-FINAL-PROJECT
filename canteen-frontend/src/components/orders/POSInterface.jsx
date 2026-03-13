import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import api from '../../services/api';
import OrderReceipt from './OrderReceipt';

export default function POSInterface() {
  const { user } = useAuth();
  const { cart, subtotal, total, change, addItem, removeItem, updateQty, setDiscount, setPayment, clearCart } = useCart();

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems]   = useState([]);
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(false);
  const [amountPaid, setAmountPaid] = useState('');
  const [discountInput, setDiscountInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [lastOrder, setLastOrder]   = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data));
    api.get('/menu', { params: { available: true, per_page: 100 } }).then(r => setMenuItems(r.data.data));
  }, []);

  const filtered = menuItems.filter(item => {
    const matchCat    = selectedCat === 'all' || item.category_id === Number(selectedCat);
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const discount      = parseFloat(discountInput) || 0;
  const amountPaidNum = parseFloat(amountPaid) || 0;
  const changeAmount  = Math.max(0, amountPaidNum - (total - discount + discount));

  const handleSubmitOrder = async () => {
    if (cart.items.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      setDiscount(discount);
      setPayment(paymentMethod, amountPaidNum);
      const res = await orderService.createOrder({
        items: cart.items.map(i => ({
          menu_item_id: i.id,
          quantity: i.quantity,
          special_instructions: i.special_instructions || '',
        })),
        discount,
        payment_method: paymentMethod,
        amount_paid: amountPaidNum || (subtotal - discount),
      });
      setLastOrder(res.data);
      setShowReceipt(true);
      clearCart();
      setAmountPaid('');
      setDiscountInput('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit order.');
    } finally {
      setSubmitting(false);
    }
  };

  const finalTotal = Math.max(0, subtotal - discount);
  const finalChange = Math.max(0, amountPaidNum - finalTotal);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Left: Menu Items */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm"
            />
            <div className="text-sm text-gray-500 whitespace-nowrap">
              {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCat('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                selectedCat === 'all' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-amber-100'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(String(cat.id))}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition ${
                  selectedCat === String(cat.id) ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-amber-100'
                }`}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(item => {
              const inCart = cart.items.find(i => i.id === item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => addItem(item)}
                  disabled={!item.is_available || item.stock_quantity <= 0}
                  className={`relative bg-white rounded-2xl p-3 text-left shadow-sm border-2 transition hover:shadow-md active:scale-95 ${
                    inCart ? 'border-amber-400 bg-amber-50' : 'border-transparent hover:border-amber-200'
                  } ${!item.is_available || item.stock_quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {/* Stock badge */}
                  {item.stock_quantity <= item.low_stock_threshold && item.stock_quantity > 0 && (
                    <span className="absolute top-2 right-2 text-xs bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-semibold">
                      Low
                    </span>
                  )}
                  {item.stock_quantity <= 0 && (
                    <span className="absolute top-2 right-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">
                      Out
                    </span>
                  )}
                  {inCart && (
                    <span className="absolute top-2 left-2 w-6 h-6 bg-amber-500 text-white rounded-full text-xs flex items-center justify-center font-bold">
                      {inCart.quantity}
                    </span>
                  )}

                  <div className="text-2xl mb-2 text-center">
                    {item.category?.icon || '🍽️'}
                  </div>
                  <div className="font-semibold text-sm text-gray-800 leading-tight line-clamp-2">{item.name}</div>
                  <div className="text-amber-600 font-bold mt-1 text-sm">₱{parseFloat(item.price).toFixed(2)}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Stock: {item.stock_quantity}</div>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="text-center text-gray-400 py-16 text-sm">No items found</div>
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-xl">
        {/* Cart header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-lg">Current Order</h2>
            {cart.items.length > 0 && (
              <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600 transition">
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.items.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <div className="text-4xl mb-2">🛒</div>
              <div className="text-sm">Add items to start an order</div>
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
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-red-100 text-gray-600 text-sm flex items-center justify-center transition"
                    >−</button>
                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 hover:bg-green-100 text-gray-600 text-sm flex items-center justify-center transition"
                    >+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Payment section */}
        {cart.items.length > 0 && (
          <div className="p-4 border-t border-gray-100 space-y-3">
            {error && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</div>
            )}

            {/* Discount */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 w-20 shrink-0">Discount (₱)</label>
              <input
                type="number"
                min="0"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400"
                placeholder="0"
              />
            </div>

            {/* Payment method */}
            <div className="grid grid-cols-4 gap-1">
              {['cash', 'card', 'gcash', 'maya'].map(m => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition capitalize ${
                    paymentMethod === m ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-amber-100'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Amount paid (cash only) */}
            {paymentMethod === 'cash' && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 w-20 shrink-0">Amount (₱)</label>
                <input
                  type="number"
                  min={finalTotal}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-400"
                  placeholder={finalTotal.toFixed(2)}
                />
              </div>
            )}

            {/* Totals */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>−₱{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-200 pt-1 mt-1">
                <span>Total</span>
                <span className="text-amber-600">₱{finalTotal.toFixed(2)}</span>
              </div>
              {paymentMethod === 'cash' && amountPaidNum > 0 && (
                <div className="flex justify-between text-blue-600 font-semibold">
                  <span>Change</span>
                  <span>₱{finalChange.toFixed(2)}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleSubmitOrder}
              disabled={submitting || cart.items.length === 0}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl disabled:opacity-50 hover:opacity-90 transition shadow-lg text-sm"
            >
              {submitting ? 'Processing...' : `Place Order • ₱${finalTotal.toFixed(2)}`}
            </button>
          </div>
        )}
      </div>

      {/* Receipt modal */}
      {showReceipt && lastOrder && (
        <OrderReceipt
          order={lastOrder}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
}
