<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{   
    public function index(Request $request)
    {
        // Fetch complaints only for the logged-in user
        $complaints = Complaint::where('user_id', $request->user()->id)
                               ->orderBy('created_at', 'desc')
                               ->get();
                               
        return response()->json($complaints);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'location_address' => 'required|string|max:255',
            'description' => 'required|string',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120', // Optional image, max 5MB
        ]);

        $photoPath = null;
        
        // If the user uploaded a photo, save it to the 'public/complaints' folder
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('complaints', 'public');
        }

        $complaint = Complaint::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'location_address' => $validated['location_address'],
            'description' => $validated['description'],
            'photo_path' => $photoPath, // Save the path to the database
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'Complaint submitted successfully', 'complaint' => $complaint], 201);
    }
}