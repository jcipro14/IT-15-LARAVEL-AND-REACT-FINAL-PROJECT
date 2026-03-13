<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::create([
            'name'     => 'Jayson Cipro',
            'email'    => 'admin@canteen.com',
            'password' => Hash::make('cipro123'),
            'role'     => 'admin',
        ]);

        // Cashiers
        User::create([
            'name'     => 'Karylle Jayed Madjos',
            'email'    => 'cashier1@canteen.com',
            'password' => Hash::make('madjos123'),
            'role'     => 'cashier',
        ]);
        User::create([
            'name'     => 'Paul Daniel Varon',
            'email'    => 'cashier2@canteen.com',
            'password' => Hash::make('varon123'),
            'role'     => 'cashier',
        ]);

        // Sample customers
        $customers = [
            ['name' => 'Denns Lagang',     'email' => 'lagang@student.edu'],
            ['name' => 'Kaichi Takeda','email' => 'Takeda@student.edu'],
            
        ];

        foreach ($customers as $customer) {
            User::create(array_merge($customer, [
                'password' => Hash::make('password'),
                'role'     => 'customer',
            ]));
        }
    }
}
