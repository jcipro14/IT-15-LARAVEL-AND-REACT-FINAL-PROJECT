<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'image',
        'stock_quantity',
        'low_stock_threshold',
        'is_available',
        'is_featured',
        'preparation_time',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_available' => 'boolean',
        'is_featured' => 'boolean',
    ];

  
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class);
    }

   
    public function isLowStock(): bool
    {
        return $this->stock_quantity <= $this->low_stock_threshold;
    }

    public function isOutOfStock(): bool
    {
        return $this->stock_quantity <= 0;
    }

    
    public function deductStock(int $quantity, ?int $orderId = null, ?int $userId = null): void
    {
        $before = $this->stock_quantity;
        $this->decrement('stock_quantity', $quantity);
        $after = $this->fresh()->stock_quantity;

        InventoryLog::create([
            'menu_item_id' => $this->id,
            'user_id' => $userId,
            'type' => 'deduction',
            'quantity_before' => $before,
            'quantity_change' => -$quantity,
            'quantity_after' => $after,
            'reason' => 'Order deduction',
            'order_id' => $orderId,
        ]);

       
        if ($after <= 0) {
            $this->update(['is_available' => false]);
        }
    }

   
    public function restock(int $quantity, string $reason = 'Manual restock', ?int $userId = null): void
    {
        $before = $this->stock_quantity;
        $this->increment('stock_quantity', $quantity);
        $after = $this->fresh()->stock_quantity;

        InventoryLog::create([
            'menu_item_id' => $this->id,
            'user_id' => $userId,
            'type' => 'restock',
            'quantity_before' => $before,
            'quantity_change' => $quantity,
            'quantity_after' => $after,
            'reason' => $reason,
        ]);

        if ($after > 0) {
            $this->update(['is_available' => true]);
        }
    }
}
