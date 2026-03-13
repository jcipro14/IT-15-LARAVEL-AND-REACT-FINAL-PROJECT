<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MenuController extends Controller
{
    public function index(Request $request)
    {
        $query = MenuItem::with('category');

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        if ($request->has('available')) {
            $query->where('is_available', filter_var($request->available, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->has('featured')) {
            $query->where('is_featured', true);
        }

        $perPage = $request->get('per_page', 20);
        return response()->json($query->orderBy('name')->paginate($perPage));
    }

    public function store(Request $request)
    {
        $request->validate([
            'category_id'        => 'required|exists:categories,id',
            'name'               => 'required|string|max:255',
            'description'        => 'nullable|string',
            'price'              => 'required|numeric|min:0',
            'stock_quantity'     => 'required|integer|min:0',
            'low_stock_threshold'=> 'sometimes|integer|min:0',
            'is_available'       => 'sometimes|boolean',
            'is_featured'        => 'sometimes|boolean',
            'preparation_time'   => 'sometimes|integer|min:1',
            'image'              => 'nullable|image|max:2048',
        ]);

        $data = $request->except('image');
        $data['slug'] = Str::slug($request->name) . '-' . uniqid();

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('menu-items', 'public');
        }

        $item = MenuItem::create($data);
        return response()->json($item->load('category'), 201);
    }

    public function show(MenuItem $menuItem)
    {
        return response()->json($menuItem->load('category'));
    }

    public function update(Request $request, MenuItem $menuItem)
    {
        $request->validate([
            'category_id'        => 'sometimes|exists:categories,id',
            'name'               => 'sometimes|string|max:255',
            'description'        => 'nullable|string',
            'price'              => 'sometimes|numeric|min:0',
            'stock_quantity'     => 'sometimes|integer|min:0',
            'low_stock_threshold'=> 'sometimes|integer|min:0',
            'is_available'       => 'sometimes|boolean',
            'is_featured'        => 'sometimes|boolean',
            'preparation_time'   => 'sometimes|integer|min:1',
            'image'              => 'nullable|image|max:2048',
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('menu-items', 'public');
        }

        $menuItem->update($data);
        return response()->json($menuItem->fresh()->load('category'));
    }

    public function destroy(MenuItem $menuItem)
    {
        $menuItem->delete();
        return response()->json(['message' => 'Menu item deleted']);
    }

    public function toggleAvailability(MenuItem $menuItem)
    {
        $menuItem->update(['is_available' => !$menuItem->is_available]);
        return response()->json([
            'message'      => 'Availability updated',
            'is_available' => $menuItem->fresh()->is_available,
        ]);
    }

    public function categories()
    {
        $categories = Category::withCount('activeMenuItems')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json($categories);
    }
}
