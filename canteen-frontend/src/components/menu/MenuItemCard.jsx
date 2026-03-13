import React from 'react';

export default function MenuItemCard({ 
  item, 
  onToggle, 
  onEdit, 
  onDelete, 
  isAdmin, 
  canAddToCart, 
  onAdd 
}) {
  // 1. BULLETPROOF CHECKS: Prevent null/empty values from breaking the button
  const hasStockData = item.stock_quantity !== null && item.stock_quantity !== undefined && item.stock_quantity !== '';
  const isOut = hasStockData && Number(item.stock_quantity) <= 0;
  const isLow = hasStockData && Number(item.stock_quantity) <= (item.low_stock_threshold || 10) && Number(item.stock_quantity) > 0;
  
  // Handle Laravel sending 1/0 instead of true/false
  const isAvailable = item.is_available === true || item.is_available === 1 || item.is_available === '1';

  // 2. DEBUG FUNCTION: This will tell us if the click is working!
  const handleAddToCartClick = () => {
   
    console.log("CLICKED ADD TO TRAY! Item data:", item);
    if (onAdd) {
      onAdd(item);
    } else {
      console.error("ERROR: The onAdd function is missing from CartContext!");
    }
  };

  return (
    <div className={`group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 flex flex-col h-full ${
      !isAvailable ? 'opacity-75' : ''
    }`}>
      
      {/* Top Section: Image & Badges */}
      <div className="relative h-48 w-full bg-gray-50 overflow-hidden">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.name} 
            className={`w-full h-full object-cover transition-transform duration-500 ${isAvailable && !isOut ? 'group-hover:scale-110' : 'grayscale'}`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
            <span className="text-6xl drop-shadow-sm">{item.category?.icon || '🍽️'}</span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {item.is_featured && (
            <span className="bg-amber-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-md shadow-md uppercase tracking-wide">
              ⭐ Featured
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`text-xs font-bold px-3 py-1 rounded-md shadow-md uppercase tracking-wider ${
            isOut ? 'bg-red-600 text-white' :
            isLow ? 'bg-orange-500 text-white' :
            isAvailable ? 'bg-green-500 text-white' : 'bg-gray-600 text-white'
          }`}>
            {isOut ? 'Sold Out' : isLow ? 'Low Stock' : isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      {/* Bottom Section: Content & Actions */}
      <div className="p-5 flex flex-col flex-grow">
        
        <div className="flex justify-between items-start gap-3 mb-2">
          <h3 className="font-extrabold text-gray-800 text-lg leading-tight line-clamp-2">
            {item.name}
          </h3>
          <span className="font-black text-amber-600 text-xl shrink-0">
            ₱{parseFloat(item.price).toFixed(2)}
          </span>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-grow">
          {item.description || "A delicious item fresh from our canteen kitchen."}
        </p>

        <div className="flex items-center text-xs font-semibold text-gray-400 mb-4 bg-gray-50 px-2 py-1.5 rounded-lg w-fit">
          <span className="mr-1.5 text-sm">📦</span> 
          Stock Remaining: <span className={`ml-1 ${isOut ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-gray-600'}`}>
            {hasStockData ? item.stock_quantity : '∞'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          {isAdmin ? (
            <div className="flex gap-2">
              <button
                onClick={() => onToggle(item)}
                className={`flex-1 py-2 text-xs rounded-lg font-bold transition-colors border ${
                  isAvailable 
                    ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' 
                    : 'bg-white border-green-200 text-green-600 hover:bg-green-50'
                }`}
              >
                {isAvailable ? 'Disable' : 'Enable'}
              </button>
              <button onClick={() => onEdit(item)} className="flex-1 py-2 text-xs bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition-colors">
                Edit
              </button>
              <button onClick={() => onDelete(item)} className="px-3 py-2 text-xs bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors">
                🗑️
              </button>
            </div>
          ) : canAddToCart && (
            <button
              onClick={handleAddToCartClick}
              disabled={!isAvailable || isOut}
              className={`w-full py-3 text-sm font-black rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 ${
                isAvailable && !isOut 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:shadow-md hover:-translate-y-0.5 cursor-pointer' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isOut ? 'Out of Stock' : !isAvailable ? 'Currently Unavailable' : (
                <><span>🛒</span> Add to Tray</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}