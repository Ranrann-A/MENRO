<?php

namespace App\Http\Controllers;

use App\Models\Complaint;
use Illuminate\Http\Request;

class AdminComplaintController extends Controller
{
    /**
     * Fetch complaints based on the user's official role.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // SCENARIO A: User is MENRO Staff
        if ($user->role === 'menro_staff') {
            // MENRO sees everything. We also load the user and their barangay data.
            $complaints = Complaint::with(['user.barangay'])
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json($complaints);
        }

        // SCENARIO B: User is a Barangay Official
        if ($user->role === 'barangay_official') {
            // Officials only see complaints from their barangay AND that MENRO has forwarded
            $complaints = Complaint::with(['user.barangay'])
                ->whereHas('user', function ($query) use ($user) {
                    $query->where('barangay_id', $user->barangay_id);
                })
                ->where('forwarded_to_barangay', true) // Must be forwarded by MENRO!
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($complaints);
        }

        // If a standard resident tries to access this, reject them
        return response()->json(['message' => 'Unauthorized Access'], 403);
    }

    /**
     * MENRO Only: Forward the complaint to the Barangay.
     */
    public function forward(Request $request, $id)
    {
        // Security Check: Only MENRO can forward
        if ($request->user()->role !== 'menro_staff') {
            return response()->json(['message' => 'Only MENRO can forward complaints.'], 403);
        }

        $complaint = Complaint::findOrFail($id);
        
        $complaint->update([
            'forwarded_to_barangay' => true,
            'status' => 'forwarded' // Update the status so the resident knows!
        ]);

        return response()->json(['message' => 'Complaint forwarded to Barangay successfully.', 'complaint' => $complaint]);
    }

    /**
     * Barangay Official: Provide an official response and resolve.
     */
    public function resolve(Request $request, $id)
    {
        // Validate the response text
        $request->validate([
            'official_response' => 'required|string'
        ]);

        $complaint = Complaint::findOrFail($id);

        $complaint->update([
            'official_response' => $request->official_response,
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);

        return response()->json(['message' => 'Complaint resolved successfully.', 'complaint' => $complaint]);
    }
}