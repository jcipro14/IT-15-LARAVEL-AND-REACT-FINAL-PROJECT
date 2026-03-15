<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $cashiers  = User::where('role', 'cashier')->pluck('id')->toArray();
        $customers = User::where('role', 'customer')->pluck('id')->toArray();
        $menuItems = MenuItem::all();
        $statuses  = ['completed', 'completed', 'completed', 'completed', 'cancelled']; 
        $payments  = ['cash', 'cash', 'cash', 'gcash', 'maya'];

        for ($i = 0; $i < 220; $i++) {
            
            $createdAt = Carbon::now()->subDays(rand(0, 90))->subHours(rand(0, 23))->subMinutes(rand(0, 59));
            $status    = $statuses[array_rand($statuses)];

            
            $selectedItems = $menuItems->random(rand(1, 4));
            $subtotal = 0;
            $orderItemsData = [];

            foreach ($selectedItems as $item) {
                $qty     = rand(1, 3);
                $lineTotal = $item->price * $qty;
                $subtotal += $lineTotal;

                $orderItemsData[] = [
                    'menu_item_id' => $item->id,
                    'quantity'     => $qty,
                    'unit_price'   => $item->price,
                    'subtotal'     => $lineTotal,
                ];
            }

            $discount    = rand(0, 1) ? rand(5, 20) : 0;
            $total       = max(0, $subtotal - $discount);
            $amountPaid  = $total + rand(0, 50); 
            $change      = $amountPaid - $total;

            $order = Order::create([
                'user_id'        => $customers[array_rand($customers)],
                'cashier_id'     => $cashiers[array_rand($cashiers)],
                'status'         => $status,
                'subtotal'       => $subtotal,
                'discount'       => $discount,
                'total_amount'   => $total,
                'payment_method' => $payments[array_rand($payments)],
                'amount_paid'    => $amountPaid,
                'change_amount'  => $change,
                'completed_at'   => $status === 'completed' ? $createdAt->copy()->addMinutes(rand(5, 20)) : null,
                'created_at'     => $createdAt,
                'updated_at'     => $createdAt,
            ]);

            foreach ($orderItemsData as $itemData) {
                OrderItem::create(array_merge($itemData, [
                    'order_id'   => $order->id,
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]));
            }
        }
    }
}
