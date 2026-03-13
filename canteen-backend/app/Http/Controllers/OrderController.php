<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['orderItems.menuItem', 'user', 'cashier']);

        // Filter by status
        if ($request->has('status')) {
            $statuses = explode(',', $request->status);
            $query->whereIn('status', $statuses);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Filter active (queue) orders
        if ($request->has('queue') && $request->queue) {
            $query->active()->orderBy('created_at', 'asc');
        }

        $perPage = $request->get('per_page', 20);
        return response()->json($query->latest()->paginate($perPage));
    }

    public function store(Request $request)
    {
        $request->validate([
            'items'          => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity'     => 'required|integer|min:1',
            'items.*.special_instructions' => 'nullable|string',
            'payment_method' => 'sometimes|in:cash,card,gcash,maya',
            'amount_paid'    => 'sometimes|numeric|min:0',
            'discount'       => 'sometimes|numeric|min:0',
            'notes'          => 'nullable|string',
            'user_id'        => 'nullable|exists:users,id',
        ]);

        return DB::transaction(function () use ($request) {
            $subtotal = 0;
            $orderItemsData = [];

            // Validate stock and compute totals
            foreach ($request->items as $item) {
                $menuItem = MenuItem::findOrFail($item['menu_item_id']);

                if (!$menuItem->is_available) {
                    return response()->json([
                        'message' => "'{$menuItem->name}' is currently unavailable.",
                    ], 422);
                }

                if ($menuItem->stock_quantity < $item['quantity']) {
                    return response()->json([
                        'message' => "Insufficient stock for '{$menuItem->name}'. Available: {$menuItem->stock_quantity}",
                    ], 422);
                }

                $lineSubtotal = $menuItem->price * $item['quantity'];
                $subtotal += $lineSubtotal;

                $orderItemsData[] = [
                    'menu_item_id'         => $menuItem->id,
                    'quantity'             => $item['quantity'],
                    'unit_price'           => $menuItem->price,
                    'subtotal'             => $lineSubtotal,
                    'special_instructions' => $item['special_instructions'] ?? null,
                ];
            }

            $discount = $request->discount ?? 0;
            $totalAmount = $subtotal - $discount;
            $amountPaid = $request->amount_paid ?? $totalAmount;
            $change = $amountPaid - $totalAmount;

            // Create the order
            $order = Order::create([
                'user_id'        => $request->user_id,
                'cashier_id'     => $request->user()->id,
                'status'         => 'pending',
                'subtotal'       => $subtotal,
                'discount'       => $discount,
                'total_amount'   => $totalAmount,
                'payment_method' => $request->payment_method ?? 'cash',
                'amount_paid'    => $amountPaid,
                'change_amount'  => max(0, $change),
                'notes'          => $request->notes,
            ]);

            // Create order items and deduct inventory
            foreach ($request->items as $index => $item) {
                $menuItem = MenuItem::find($item['menu_item_id']);
                $order->orderItems()->create($orderItemsData[$index]);
                $menuItem->deductStock($item['quantity'], $order->id, $request->user()->id);
            }

            return response()->json($order->load(['orderItems.menuItem', 'cashier']), 201);
        });
    }

    public function show(Order $order)
    {
        return response()->json($order->load(['orderItems.menuItem', 'user', 'cashier']));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,preparing,ready,completed,cancelled',
        ]);

        if (!$order->canTransitionTo($request->status)) {
            return response()->json([
                'message' => "Cannot transition from '{$order->status}' to '{$request->status}'",
            ], 422);
        }

        if ($request->status === 'completed') {
            $order->markCompleted();
        } else {
            $order->update(['status' => $request->status]);
        }

        return response()->json($order->fresh()->load(['orderItems.menuItem', 'cashier']));
    }

    public function cancel(Request $request, Order $order)
    {
        if (!in_array($order->status, ['pending', 'preparing'])) {
            return response()->json(['message' => 'This order cannot be cancelled.'], 422);
        }

        DB::transaction(function () use ($order, $request) {
            // Restore inventory
            foreach ($order->orderItems as $item) {
                $item->menuItem->restock(
                    $item->quantity,
                    'Order cancellation - ' . $order->order_number,
                    $request->user()->id
                );
            }

            $order->update(['status' => 'cancelled']);
        });

        return response()->json(['message' => 'Order cancelled and stock restored.', 'order' => $order->fresh()]);
    }

    public function queue()
    {
        $orders = Order::with(['orderItems.menuItem'])
            ->active()
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($orders);
    }

    public function myOrders(Request $request)
    {
        $orders = Order::with('orderItems.menuItem')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(15);

        return response()->json($orders);
    }
}
