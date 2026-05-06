<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barangay extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'latitude', 'longitude'];

    // A Barangay can have many residents (users)
    public function users()
    {
        return $this->hasMany(User::class);
    }
}