<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Meals',      'slug' => 'meals',      'icon' => '🍱', 'description' => 'Full meal sets and rice dishes', 'sort_order' => 1],
            ['name' => 'Snacks',     'slug' => 'snacks',     'icon' => '🍟', 'description' => 'Light bites and finger foods',    'sort_order' => 2],
            ['name' => 'Beverages',  'slug' => 'beverages',  'icon' => '🥤', 'description' => 'Drinks and refreshments',         'sort_order' => 3],
            ['name' => 'Desserts',   'slug' => 'desserts',   'icon' => '🍰', 'description' => 'Sweet treats and pastries',       'sort_order' => 4],
            ['name' => 'Combos',     'slug' => 'combos',     'icon' => '🎁', 'description' => 'Value combo meals',               'sort_order' => 5],
            ['name' => 'Breakfast',  'slug' => 'breakfast',  'icon' => '🍳', 'description' => 'Morning breakfast items',         'sort_order' => 6],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }
    }
}
