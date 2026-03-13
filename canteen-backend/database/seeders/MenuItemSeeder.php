<?php

namespace Database\Seeders;

use App\Models\MenuItem;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class MenuItemSeeder extends Seeder
{
    public function run(): void
    {
        $meals      = Category::where('slug', 'meals')->first()->id;
        $snacks     = Category::where('slug', 'snacks')->first()->id;
        $beverages  = Category::where('slug', 'beverages')->first()->id;
        $desserts   = Category::where('slug', 'desserts')->first()->id;
        $combos     = Category::where('slug', 'combos')->first()->id;
        $breakfast  = Category::where('slug', 'breakfast')->first()->id;

        $items = [
            // Meals
            ['category_id' => $meals, 'name' => 'Adobo Rice Meal',    'price' => 65,  'stock_quantity' => 50, 'description' => 'Classic Filipino adobo with steamed rice', 'is_featured' => true],
            ['category_id' => $meals, 'name' => 'Sinigang na Baboy',  'price' => 75,  'stock_quantity' => 40, 'description' => 'Pork sinigang in tamarind broth with veggies'],
            ['category_id' => $meals, 'name' => 'Chicken Tinola',     'price' => 70,  'stock_quantity' => 45, 'description' => 'Ginger-based chicken soup with papaya'],
            ['category_id' => $meals, 'name' => 'Pork Sisig',         'price' => 80,  'stock_quantity' => 35, 'description' => 'Sizzling pork sisig with egg', 'is_featured' => true],
            ['category_id' => $meals, 'name' => 'Beef Kaldereta',     'price' => 90,  'stock_quantity' => 30, 'description' => 'Rich beef stew in tomato sauce'],
            ['category_id' => $meals, 'name' => 'Fried Tilapia',      'price' => 60,  'stock_quantity' => 40, 'description' => 'Crispy fried whole tilapia with rice'],
            ['category_id' => $meals, 'name' => 'Chicken Inasal',     'price' => 85,  'stock_quantity' => 38, 'description' => 'Grilled chicken marinated in local spices', 'is_featured' => true],

            // Snacks
            ['category_id' => $snacks, 'name' => 'Lumpiang Shanghai',  'price' => 35, 'stock_quantity' => 80, 'description' => '5 pieces of crispy pork spring rolls'],
            ['category_id' => $snacks, 'name' => 'French Fries',       'price' => 40, 'stock_quantity' => 60, 'description' => 'Golden crispy fries with ketchup'],
            ['category_id' => $snacks, 'name' => 'Cheese Pimiento',    'price' => 30, 'stock_quantity' => 50, 'description' => 'Bread with cheesy pimiento filling'],
            ['category_id' => $snacks, 'name' => 'Banana Cue',         'price' => 20, 'stock_quantity' => 100,'description' => 'Caramelized banana on a stick'],
            ['category_id' => $snacks, 'name' => 'Fishball (10 pcs)',  'price' => 25, 'stock_quantity' => 90, 'description' => '10 pieces of fishballs with sweet sauce'],
            ['category_id' => $snacks, 'name' => 'Hotdog Sandwich',    'price' => 35, 'stock_quantity' => 55, 'description' => 'Grilled hotdog in pandesal'],

            // Beverages
            ['category_id' => $beverages, 'name' => 'Bottled Water',     'price' => 15, 'stock_quantity' => 200,'description' => '500ml mineral water'],
            ['category_id' => $beverages, 'name' => 'Softdrink (can)',   'price' => 35, 'stock_quantity' => 120,'description' => 'Coke, Sprite, or Royal assorted'],
            ['category_id' => $beverages, 'name' => 'Pineapple Juice',   'price' => 25, 'stock_quantity' => 80, 'description' => 'Fresh pineapple juice in tetra pack'],
            ['category_id' => $beverages, 'name' => 'Iced Coffee',       'price' => 45, 'stock_quantity' => 70, 'description' => 'Cold brew coffee with milk', 'is_featured' => true],
            ['category_id' => $beverages, 'name' => 'Milk Tea (Regular)','price' => 55, 'stock_quantity' => 60, 'description' => 'Classic milk tea with pearls'],
            ['category_id' => $beverages, 'name' => 'Fresh Buko Juice',  'price' => 30, 'stock_quantity' => 50, 'description' => 'Cold coconut water with meat'],
            ['category_id' => $beverages, 'name' => 'Chocolate Drink',   'price' => 20, 'stock_quantity' => 90, 'description' => 'Creamy hot or cold chocolate'],

            // Desserts
            ['category_id' => $desserts, 'name' => 'Halo-Halo',        'price' => 55, 'stock_quantity' => 40, 'description' => 'Mixed dessert with shaved ice and leche flan', 'is_featured' => true],
            ['category_id' => $desserts, 'name' => 'Leche Flan',       'price' => 40, 'stock_quantity' => 35, 'description' => 'Classic custard pudding with caramel'],
            ['category_id' => $desserts, 'name' => 'Buko Pandan',      'price' => 30, 'stock_quantity' => 45, 'description' => 'Coconut and pandan jelly salad'],
            ['category_id' => $desserts, 'name' => 'Maja Blanca',      'price' => 25, 'stock_quantity' => 50, 'description' => 'Creamy coconut milk pudding'],
            ['category_id' => $desserts, 'name' => 'Cassava Cake',     'price' => 30, 'stock_quantity' => 40, 'description' => 'Sweet cassava cake with custard topping'],

            // Combos
            ['category_id' => $combos, 'name' => 'Silog Combo',       'price' => 75,  'stock_quantity' => 40, 'description' => 'Sinangag + itlog + choice of meat', 'is_featured' => true],
            ['category_id' => $combos, 'name' => 'Snack Combo A',     'price' => 60,  'stock_quantity' => 50, 'description' => 'Fries + hotdog sandwich + softdrink'],
            ['category_id' => $combos, 'name' => 'Meal Deal 1',       'price' => 95,  'stock_quantity' => 35, 'description' => 'Rice meal + juice + dessert'],
            ['category_id' => $combos, 'name' => 'Student Special',   'price' => 85,  'stock_quantity' => 30, 'description' => 'Any meal + bottled water + banana cue'],

            // Breakfast
            ['category_id' => $breakfast, 'name' => 'Tapsilog',       'price' => 70,  'stock_quantity' => 45, 'description' => 'Beef tapa + sinangag + sunny side up egg'],
            ['category_id' => $breakfast, 'name' => 'Longsilog',      'price' => 65,  'stock_quantity' => 40, 'description' => 'Pork longganisa + sinangag + egg'],
            ['category_id' => $breakfast, 'name' => 'Tocilog',        'price' => 65,  'stock_quantity' => 38, 'description' => 'Sweet pork tocino + sinangag + egg'],
            ['category_id' => $breakfast, 'name' => 'Champorado',     'price' => 35,  'stock_quantity' => 50, 'description' => 'Chocolate rice porridge with tuyo'],
            ['category_id' => $breakfast, 'name' => 'Pandesal (3pcs)','price' => 15,  'stock_quantity' => 100,'description' => '3 pieces of soft fresh pandesal'],
        ];

        foreach ($items as $item) {
            MenuItem::create(array_merge([
                'slug'                => Str::slug($item['name']) . '-' . uniqid(),
                'low_stock_threshold' => 10,
                'is_available'        => true,
                'is_featured'         => false,
                'preparation_time'    => rand(3, 15),
            ], $item));
        }
    }
}
