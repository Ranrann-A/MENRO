<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use HasFactory;

    // Tell Laravel which columns are safe to save data into
    protected $fillable = [
        'user_id',
        'title',
        'location_address',
        'description',
        'photo_path',
        'status',      
        'forwarded_to_barangay',        
        'official_response',   
        'resolved_at'          
    ];

    // Relationship to the User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}