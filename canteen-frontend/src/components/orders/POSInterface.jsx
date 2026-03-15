import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import api from '../../services/api';
import OrderReceipt from './OrderReceipt';

const FOOD_IMAGES = {
  'adobo':'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=300&q=70',
  'sinigang':'https://images.unsplash.com/photo-1547592180-85f173990554?w=300&q=70',
  'tinola':'https://images.unsplash.com/photo-1585325701165-f3b8d9c4424c?w=300&q=70',
  'kaldereta':'https://images.unsplash.com/photo-1574484284002-952d92456975?w=300&q=70',
  'tilapia':'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=300&q=70',
  'chicken':'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=300&q=70',
  'pork':'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&q=70',
  'rice':'https://images.unsplash.com/photo-1536304993881-ff86e0c9b4c9?w=300&q=70',
  'lumpia':'https://images.unsplash.com/photo-1562802378-063ec186a863?w=300&q=70',
  'banana':'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&q=70',
  'fries':'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&q=70',
  'hotdog':'https://images.unsplash.com/photo-1527345931282-806d3b11967f?w=300&q=70',
  'fishball':'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&q=70',
  'water':'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=300&q=70',
  'softdrink':'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&q=70',
  'juice':'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&q=70',
  'coffee':'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=70',
  'chocolate':'https://images.unsplash.com/photo-1542990253-a781e57e4a52?w=300&q=70',
  'halo':'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&q=70',
  'leche':'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=300&q=70',
  'cassava':'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=300&q=70',
  'buko':'https://images.unsplash.com/photo-1544025162-d76694265947?w=300&q=70',
  'champorado':'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=300&q=70',
  'silog':'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=300&q=70',
  'longsilog':'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=300&q=70',
  'tocilog':'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=300&q=70',
  'cheese':'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=300&q=70',
  'sandwich':'https://images.unsplash.com/photo-1528736235302-52922df5c122?w=300&q=70',
  'combo':'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=70',
};
const DEFAULT_IMG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&q=70';
function getFoodImage(name) {
  const lower = name.toLowerCase();
  for (const [k, v] of Object.entries(FOOD_IMAGES)) { if (lower.includes(k)) return v; }
  return DEFAULT_IMG;
}

export default function POSInterface() {
  const { user } = useAuth();
  const { cart, subtotal, addItem, updateQty, setDiscount, setPayment, clearCart } = useCart();

  const [categories, setCategories]     = useState([]);
  const [menuItems, setMenuItems]       = useState([]);
  const [selectedCat, setSelectedCat]   = useState('all');
  const [search, setSearch]             = useState('');
  const [amountPaid, setAmountPaid]     = useState('');
  const [discountInput, setDiscountInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [lastOrder, setLastOrder]       = useState(null);
  const [showReceipt, setShowReceipt]   = useState(false);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState('');
  const [time, setTime]                 = useState(new Date());

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data));
    api.get('/menu', { params: { available: true, per_page: 100 } }).then(r => setMenuItems(r.data.data));
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const filtered = menuItems.filter(item => {
    const matchCat    = selectedCat === 'all' || item.category_id === Number(selectedCat);
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const discount      = parseFloat(discountInput) || 0;
  const amountPaidNum = parseFloat(amountPaid) || 0;
  const finalTotal    = Math.max(0, subtotal - discount);
  const finalChange   = Math.max(0, amountPaidNum - finalTotal);

  const handleSubmitOrder = async () => {
    if (cart.items.length === 0) return;
    setSubmitting(true); setError('');
    try {
      setDiscount(discount);
      setPayment(paymentMethod, amountPaidNum);
      const res = await orderService.createOrder({
        items: cart.items.map(i => ({ menu_item_id: i.id, quantity: i.quantity, special_instructions: i.special_instructions || '' })),
        discount, payment_method: paymentMethod,
        amount_paid: amountPaidNum || finalTotal,
      });
      setLastOrder(res.data);
      setShowReceipt(true);
      clearCart(); setAmountPaid(''); setDiscountInput('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit order.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{background: '#f8f7f5'}}>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        
        <div className="bg-white px-5 py-3 shadow-sm border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input type="text" placeholder="Search menu items..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50" />
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-black text-gray-900 tabular-nums">{time.toLocaleTimeString()}</div>
              <div className="text-xs text-gray-400">{time.toLocaleDateString('en', {weekday:'short', month:'short', day:'numeric'})}</div>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setSelectedCat('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${selectedCat === 'all' ? 'text-white shadow' : 'bg-gray-100 text-gray-500'}`}
              style={selectedCat === 'all' ? {background: 'linear-gradient(135deg,#f97316,#ea580c)'} : {}}>
              All
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCat(String(cat.id))}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${selectedCat === String(cat.id) ? 'text-white shadow' : 'bg-gray-100 text-gray-500'}`}
                style={selectedCat === String(cat.id) ? {background: 'linear-gradient(135deg,#f97316,#ea580c)'} : {}}>
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-3" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(145px, 1fr))'}}>
            {filtered.map(item => {
              const inCart = cart.items.find(i => i.id === item.id);
              const isOut  = item.stock_quantity <= 0;
              const [imgErr, setImgErr] = [false, () => {}];
              return (
                <button key={item.id} onClick={() => !isOut && item.is_available && addItem(item)}
                  disabled={!item.is_available || isOut}
                  className={`relative bg-white rounded-2xl overflow-hidden text-left shadow-sm border-2 transition-all hover:shadow-md active:scale-95 ${
                    inCart ? 'border-orange-400' : 'border-transparent hover:border-orange-200'
                  } ${!item.is_available || isOut ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <div className="relative h-24 overflow-hidden">
                    <img src={getFoodImage(item.name)} alt={item.name}
                      className="w-full h-full object-cover transition-transform hover:scale-110 duration-300"
                      onError={e => e.target.src = DEFAULT_IMG} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {inCart && (
                      <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full text-white text-xs font-black flex items-center justify-center shadow"
                        style={{background: '#f97316'}}>{inCart.quantity}</div>
                    )}
                    {isOut && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-black bg-red-500 px-2 py-0.5 rounded-full">Out</span>
                      </div>
                    )}
                    <div className="absolute bottom-1.5 left-2">
                      <span className="text-white text-sm font-black drop-shadow">₱{parseFloat(item.price).toFixed(0)}</span>
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="text-xs font-bold text-gray-900 leading-tight line-clamp-2">{item.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Stk: {item.stock_quantity}</div>
                  </div>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-400 text-sm">No items found</div>
          )}
        </div>
      </div>

      
      <div className="w-76 flex flex-col border-l border-gray-200 bg-white shadow-xl" style={{width: '300px'}}>
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-black text-gray-900 text-sm">Current Order</h2>
            <p className="text-xs text-gray-400">{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</p>
          </div>
          {cart.items.length > 0 && (
            <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-600 font-semibold">Clear</button>
          )}
        </div>

        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-2 opacity-30">🛒</div>
              <p className="text-xs">Add items to start an order</p>
            </div>
          ) : (
            cart.items.map(item => (
              <div key={item.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <img src={getFoodImage(item.name)} alt={item.name}
                  className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                  onError={e => e.target.src = DEFAULT_IMG} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-gray-800 truncate">{item.name}</div>
                  <div className="text-xs text-orange-500 font-bold">₱{(item.price * item.quantity).toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(item.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-lg bg-gray-200 hover:bg-red-100 text-xs font-black flex items-center justify-center transition">−</button>
                  <span className="w-5 text-center text-xs font-black text-gray-800">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, item.quantity + 1)}
                    className="w-6 h-6 rounded-lg bg-gray-200 hover:bg-green-100 text-xs font-black flex items-center justify-center transition">+</button>
                </div>
              </div>
            ))
          )}
        </div>

        
        {cart.items.length > 0 && (
          <div className="p-4 border-t border-gray-100 space-y-3">
            {error && <div className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl">{error}</div>}

            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 font-semibold w-20 flex-shrink-0">Discount ₱</label>
              <input type="number" min="0" value={discountInput} onChange={e => setDiscountInput(e.target.value)} placeholder="0"
                className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400" />
            </div>

            <div className="grid grid-cols-4 gap-1">
              {['cash','card','gcash','maya'].map(m => (
                <button key={m} onClick={() => setPaymentMethod(m)}
                  className={`py-1.5 text-xs font-bold rounded-lg capitalize transition ${paymentMethod === m ? 'text-white shadow' : 'bg-gray-100 text-gray-500 hover:bg-orange-50'}`}
                  style={paymentMethod === m ? {background: 'linear-gradient(135deg,#f97316,#ea580c)'} : {}}>
                  {m}
                </button>
              ))}
            </div>

            {paymentMethod === 'cash' && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500 font-semibold w-20 flex-shrink-0">Amount ₱</label>
                <input type="number" min={finalTotal} value={amountPaid} onChange={e => setAmountPaid(e.target.value)}
                  placeholder={finalTotal.toFixed(2)}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-400" />
              </div>
            )}

            <div className="rounded-xl p-3 space-y-1.5 text-xs" style={{background: '#fafafa', border: '1px solid #f0f0f0'}}>
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span><span className="font-semibold">₱{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span><span className="font-semibold">−₱{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-gray-900 text-sm border-t border-gray-200 pt-1.5">
                <span>Total</span><span className="text-orange-500">₱{finalTotal.toFixed(2)}</span>
              </div>
              {paymentMethod === 'cash' && amountPaidNum > 0 && (
                <div className="flex justify-between text-blue-600 font-bold">
                  <span>Change</span><span>₱{finalChange.toFixed(2)}</span>
                </div>
              )}
            </div>

            <button onClick={handleSubmitOrder} disabled={submitting}
              className="w-full py-3.5 text-white font-black text-sm rounded-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-lg"
              style={{background: 'linear-gradient(135deg, #f97316, #ea580c)'}}>
              {submitting ? '⏳ Processing...' : `Place Order · ₱${finalTotal.toFixed(2)}`}
            </button>
          </div>
        )}
      </div>

      {showReceipt && lastOrder && (
        <OrderReceipt order={lastOrder} onClose={() => setShowReceipt(false)} />
      )}
    </div>
  );
}
