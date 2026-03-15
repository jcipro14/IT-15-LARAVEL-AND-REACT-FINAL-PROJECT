import { createContext, useContext, useReducer } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.item.id);
      if (existing) {
        return { ...state, items: state.items.map(i => i.id === action.item.id ? { ...i, quantity: i.quantity + 1 } : i) };
      }
      return { ...state, items: [...state.items, { ...action.item, quantity: 1 }] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.id) };
    case 'UPDATE_QTY': {
      if (action.qty <= 0) return { ...state, items: state.items.filter(i => i.id !== action.id) };
      return { ...state, items: state.items.map(i => i.id === action.id ? { ...i, quantity: action.qty } : i) };
    }
    case 'SET_INSTRUCTIONS':
      return { ...state, items: state.items.map(i => i.id === action.id ? { ...i, special_instructions: action.text } : i) };
    case 'SET_DISCOUNT':
      return { ...state, discount: action.discount };
    case 'SET_PAYMENT':
      return { ...state, paymentMethod: action.method, amountPaid: action.amountPaid };
    case 'CLEAR':
      return { items: [], discount: 0, paymentMethod: 'cash', amountPaid: 0 };
    default:
      return state;
  }
};

const initialState = { items: [], discount: 0, paymentMethod: 'cash', amountPaid: 0 };


const cartStores = { admin: { ...initialState }, cashier: { ...initialState }, customer: { ...initialState } };

export function CartProvider({ children }) {
  const { user } = useAuth();
  const role = user?.role || 'customer';

  const [carts, setCarts] = useReducer((state, { role, action }) => {
    const current = state[role] || { ...initialState };
    const next = cartReducer(current, action);
    return { ...state, [role]: next };
  }, cartStores);

  const cart = carts[role] || initialState;
  const dispatch = (action) => setCarts({ role, action });

  const subtotal  = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total     = Math.max(0, subtotal - cart.discount);
  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const change    = Math.max(0, cart.amountPaid - total);

  const addItem         = (item) => dispatch({ type: 'ADD_ITEM', item });
  const removeItem      = (id)   => dispatch({ type: 'REMOVE_ITEM', id });
  const updateQty       = (id, qty) => dispatch({ type: 'UPDATE_QTY', id, qty });
  const setInstructions = (id, text) => dispatch({ type: 'SET_INSTRUCTIONS', id, text });
  const setDiscount     = (discount) => dispatch({ type: 'SET_DISCOUNT', discount });
  const setPayment      = (method, amountPaid) => dispatch({ type: 'SET_PAYMENT', method, amountPaid });
  const clearCart       = () => dispatch({ type: 'CLEAR' });

  return (
    <CartContext.Provider value={{ cart, subtotal, total, itemCount, change, addItem, removeItem, updateQty, setInstructions, setDiscount, setPayment, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
