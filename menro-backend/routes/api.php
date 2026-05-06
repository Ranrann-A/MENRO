<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Models\Barangay;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\AdminComplaintController;

/*
|--------------------------------------------------------------------------
| Public Routes (No login required)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/barangays', function () {
    return response()->json(Barangay::orderBy('name')->get()); 
});

/*
|--------------------------------------------------------------------------
| Protected Routes (Login required)
|--------------------------------------------------------------------------
| Any route placed inside this group requires a valid Sanctum token.
*/
Route::middleware('auth:sanctum')->group(function () {
    
    // Get the logged-in user's info, including their barangay name
    Route::get('/user', function (Request $request) {
        // We use ->load('barangay') to fetch their exact barangay name too!
        return $request->user()->load('barangay');
    });

    // Get all complaints for the logged-in user
    Route::get('/complaints', [ComplaintController::class, 'index']);

    // Logout route
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Complaint submission route
    Route::post('/complaints', [ComplaintController::class, 'store']);


    // Admin routes for managing complaints
    Route::get('/admin/complaints', [AdminComplaintController::class, 'index']);
    
    // MENRO Action: Forward Complaint to Barangay
    Route::put('/admin/complaints/{id}/forward', [AdminComplaintController::class, 'forward']);
    
    // Barangay Action: Resolve Complaint
    Route::put('/admin/complaints/{id}/resolve', [AdminComplaintController::class, 'resolve']);
});