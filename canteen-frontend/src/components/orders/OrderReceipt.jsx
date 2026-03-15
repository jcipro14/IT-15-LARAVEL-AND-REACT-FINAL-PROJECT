export default function OrderReceipt({ order, onClose }) {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-center text-white">
          <div className="text-4xl mb-2">✅</div>
          <h2 className="text-xl font-bold">Order Placed!</h2>
          <p className="text-amber-100 text-sm mt-1 font-mono">{order.order_number}</p>
        </div>

        
        <div className="p-6">
          
          <div className="space-y-2 mb-4">
            {order.order_items?.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.menu_item?.name}
                  <span className="text-gray-400"> ×{item.quantity}</span>
                </span>
                <span className="font-semibold text-gray-800">
                  ₱{parseFloat(item.subtotal).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

         
          <div className="border-t border-dashed border-gray-200 pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₱{parseFloat(order.subtotal).toFixed(2)}</span>
            </div>
            {parseFloat(order.discount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>−₱{parseFloat(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base text-gray-900 border-t border-gray-200 pt-1">
              <span>Total</span>
              <span className="text-amber-600">₱{parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
            {order.payment_method === 'cash' && parseFloat(order.change_amount) >= 0 && (
              <>
                <div className="flex justify-between text-gray-600">
                  <span>Amount Paid</span>
                  <span>₱{parseFloat(order.amount_paid).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-blue-600 font-semibold">
                  <span>Change</span>
                  <span>₱{parseFloat(order.change_amount).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <div className="mt-4 bg-gray-50 rounded-xl p-3 text-center text-xs text-gray-500 space-y-1">
            <div>Payment: <span className="font-semibold capitalize">{order.payment_method}</span></div>
            <div>Status: <span className="font-semibold capitalize text-amber-600">{order.status}</span></div>
            <div>{new Date(order.created_at).toLocaleString()}</div>
          </div>

          
          <div className="flex gap-3 mt-5">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 border-2 border-amber-400 text-amber-600 font-semibold rounded-xl hover:bg-amber-50 transition text-sm"
            >
              🖨️ Print
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:opacity-90 transition text-sm"
            >
              New Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
