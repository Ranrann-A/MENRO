<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BarangaySeeder extends Seeder
{
    public function run(): void
    {
        $barangays = [
            ['name' => 'Poblacion', 'latitude' => 15.1488, 'longitude' => 120.7686],
            ['name' => 'San Juan Bano', 'latitude' => 15.2015, 'longitude' => 120.7554],
            ['name' => 'Plazang Luma', 'latitude' => 15.1550, 'longitude' => 120.7630],
            ['name' => 'Cacutud', 'latitude' => 15.1633, 'longitude' => 120.7712],
            // Add the remaining barangays of Arayat here as needed
        ];

        DB::table('barangays')->insert($barangays);
    }
}