<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function salesSummary(Request $request)
    {
        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to   = $request->get('to', now()->toDateString());

        $completed = Order::completed()
            ->whereBetween(DB::raw('DATE(created_at)'), [$from, $to]);

        $totalRevenue  = (clone $completed)->sum('total_amount');
        $totalOrders   = (clone $completed)->count();
        $avgOrderValue = $totalOrders > 0 ? $totalRevenue / $totalOrders : 0;

        $todayRevenue = Order::completed()->today()->sum('total_amount');
        $todayOrders  = Order::completed()->today()->count();

        return response()->json([
            'period'          => compact('from', 'to'),
            'total_revenue'   => round($totalRevenue, 2),
            'total_orders'    => $totalOrders,
            'avg_order_value' => round($avgOrderValue, 2),
            'today_revenue'   => round($todayRevenue, 2),
            'today_orders'    => $todayOrders,
        ]);
    }

    public function dailySales(Request $request)
    {
        $days = $request->get('days', 30);

        $sales = Order::completed()
            ->where('created_at', '>=', now()->subDays($days))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as order_count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($sales);
    }

    public function weeklySales()
    {
        $sales = Order::completed()
            ->where('created_at', '>=', now()->subWeeks(12))
            ->select(
                DB::raw('YEARWEEK(created_at, 1) as week'),
                DB::raw('MIN(DATE(created_at)) as week_start'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('COUNT(*) as order_count')
            )
            ->groupBy('week')
            ->orderBy('week')
            ->get();

        return response()->json($sales);
    }

    public function topItems(Request $request)
    {
        $from  = $request->get('from', now()->startOfMonth()->toDateString());
        $to    = $request->get('to', now()->toDateString());
        $limit = $request->get('limit', 10);

        $items = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->where('orders.status', 'completed')
            ->whereBetween(DB::raw('DATE(orders.created_at)'), [$from, $to])
            ->select(
                'menu_items.id',
                'menu_items.name',
                DB::raw('SUM(order_items.quantity) as total_qty'),
                DB::raw('SUM(order_items.subtotal) as total_revenue')
            )
            ->groupBy('menu_items.id', 'menu_items.name')
            ->orderByDesc('total_revenue')
            ->limit($limit)
            ->get();

        return response()->json($items);
    }

    public function categoryBreakdown(Request $request)
    {
        $from = $request->get('from', now()->startOfMonth()->toDateString());
        $to   = $request->get('to', now()->toDateString());

        $breakdown = OrderItem::join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('menu_items', 'order_items.menu_item_id', '=', 'menu_items.id')
            ->join('categories', 'menu_items.category_id', '=', 'categories.id')
            ->where('orders.status', 'completed')
            ->whereBetween(DB::raw('DATE(orders.created_at)'), [$from, $to])
            ->select(
                'categories.id',
                'categories.name',
                DB::raw('SUM(order_items.subtotal) as revenue'),
                DB::raw('SUM(order_items.quantity) as items_sold')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('revenue')
            ->get();

        return response()->json($breakdown);
    }

    public function orderTrend(Request $request)
    {
        $days = $request->get('days', 30);

        $trend = Order::where('created_at', '>=', now()->subDays($days))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total_orders'),
                DB::raw('SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) as completed'),
                DB::raw('SUM(CASE WHEN status = "cancelled" THEN 1 ELSE 0 END) as cancelled')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json($trend);
    }
}
