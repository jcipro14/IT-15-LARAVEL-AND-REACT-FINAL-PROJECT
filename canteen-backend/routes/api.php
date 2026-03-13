<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\ReportController;

// Public Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);
Route::get('/menu',            [MenuController::class, 'index']);
Route::get('/menu/{menuItem}', [MenuController::class, 'show']);
Route::get('/categories',      [MenuController::class, 'categories']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout',  [AuthController::class, 'logout']);
    Route::get('/me',       [AuthController::class, 'me']);
    Route::put('/profile',  [AuthController::class, 'updateProfile']);

    // All roles - place orders and view own orders
    Route::post('/orders',   [OrderController::class, 'store']);
    Route::get('/my-orders', [OrderController::class, 'myOrders']);

    // Cashier + Admin
    Route::middleware('role:admin,cashier')->group(function () {
        Route::get('/orders',                      [OrderController::class, 'index']);
        Route::get('/orders/queue',                [OrderController::class, 'queue']);
        Route::get('/orders/{order}',              [OrderController::class, 'show']);
        Route::patch('/orders/{order}/status',     [OrderController::class, 'updateStatus']);
        Route::patch('/orders/{order}/cancel',     [OrderController::class, 'cancel']);
    });

    // Admin Only
    Route::middleware('role:admin')->group(function () {
        Route::post('/menu',                                  [MenuController::class, 'store']);
        Route::put('/menu/{menuItem}',                        [MenuController::class, 'update']);
        Route::delete('/menu/{menuItem}',                     [MenuController::class, 'destroy']);
        Route::patch('/menu/{menuItem}/toggle-availability',  [MenuController::class, 'toggleAvailability']);

        Route::get('/inventory',                              [InventoryController::class, 'index']);
        Route::get('/inventory/low-stock',                    [InventoryController::class, 'lowStock']);
        Route::get('/inventory/logs',                         [InventoryController::class, 'logs']);
        Route::post('/inventory/bulk-restock',                [InventoryController::class, 'bulkRestock']);
        Route::patch('/inventory/{menuItem}/adjust',          [InventoryController::class, 'adjust']);

        Route::get('/reports/summary',                        [ReportController::class, 'salesSummary']);
        Route::get('/reports/daily',                          [ReportController::class, 'dailySales']);
        Route::get('/reports/weekly',                         [ReportController::class, 'weeklySales']);
        Route::get('/reports/top-items',                      [ReportController::class, 'topItems']);
        Route::get('/reports/categories',                     [ReportController::class, 'categoryBreakdown']);
        Route::get('/reports/order-trend',                    [ReportController::class, 'orderTrend']);
    });
});
