<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\InventoryLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = MenuItem::with('category');

        if ($request->has('low_stock')) {
            $query->whereRaw('stock_quantity <= low_stock_threshold');
        }

        if ($request->has('out_of_stock')) {
            $query->where('stock_quantity', '<=', 0);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        return response()->json($query->orderBy('stock_quantity', 'asc')->paginate(20));
    }

    public function adjust(Request $request, MenuItem $menuItem)
    {
        $request->validate([
            'type'     => 'required|in:restock,adjustment,waste',
            'quantity' => 'required|integer',
            'reason'   => 'required|string|max:255',
        ]);

        $before = $menuItem->stock_quantity;
        $quantity = $request->type === 'waste' ? -abs($request->quantity) : $request->quantity;
        $after = max(0, $before + $quantity);

        $menuItem->update(['stock_quantity' => $after]);

        InventoryLog::create([
            'menu_item_id'    => $menuItem->id,
            'user_id'         => $request->user()->id,
            'type'            => $request->type,
            'quantity_before' => $before,
            'quantity_change' => $quantity,
            'quantity_after'  => $after,
            'reason'          => $request->reason,
        ]);

        return response()->json([
            'message'  => 'Stock adjusted successfully',
            'item'     => $menuItem->fresh(),
            'before'   => $before,
            'after'    => $after,
        ]);
    }

    public function bulkRestock(Request $request)
    {
        $request->validate([
            'items'            => 'required|array',
            'items.*.id'       => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'reason'           => 'sometimes|string',
        ]);

        DB::transaction(function () use ($request) {
            foreach ($request->items as $item) {
                $menuItem = MenuItem::find($item['id']);
                $menuItem->restock(
                    $item['quantity'],
                    $request->reason ?? 'Bulk restock',
                    $request->user()->id
                );
            }
        });

        return response()->json(['message' => 'Bulk restock completed']);
    }

    public function logs(Request $request)
    {
        $query = InventoryLog::with(['menuItem', 'user'])
            ->when($request->menu_item_id, fn($q) => $q->where('menu_item_id', $request->menu_item_id))
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->when($request->date_from, fn($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to, fn($q) => $q->whereDate('created_at', '<=', $request->date_to));

        return response()->json($query->latest()->paginate(30));
    }

    public function lowStock()
    {
        $items = MenuItem::with('category')
            ->whereRaw('stock_quantity <= low_stock_threshold')
            ->orderBy('stock_quantity', 'asc')
            ->get();

        return response()->json($items);
    }
}
