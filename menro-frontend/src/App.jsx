import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import axios from 'axios';

// Component Imports
import Register from './Register';
import Login from './Login';
import Home from './Home';
import ComplaintForm from './ComplaintForm';
import AdminDashboard from './AdminDashboard';

// Global Axios Configuration for Secure Cookie Authentication
axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true; 
axios.defaults.withXSRFToken = true;   

function App() {
  // Application State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('guest'); 
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check login status and role when the app loads
  useEffect(() => {
    axios.get('/api/user')
      .then((response) => {
        setIsLoggedIn(true);
        setUserRole(response.data.role); // Save the specific role (e.g., 'resident', 'menro_staff')
      })
      .catch(() => {
        setIsLoggedIn(false);
        setUserRole('guest');
      })
      .finally(() => {
        setIsCheckingAuth(false);
      });
  }, []);

  // Securely handle logging out
  const handleLogout = async () => {
    try {
      await axios.post('/api/logout');
      setIsLoggedIn(false);
      setUserRole('guest');
      window.location.href = '/'; // Force a clean reload
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Prevent the app from flashing while we check the cookie
  if (isCheckingAuth) {
    return <div className="min-h-screen flex items-center justify-center text-green-700 font-bold">Loading MENRO Portal...</div>;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        
        {/* Dynamic Navigation Bar */}
        <nav className="bg-green-600 p-4 text-white shadow-md relative z-10">
          <div className="container mx-auto flex justify-between items-center font-semibold">
            
            {/* Left Side Links */}
            <div className="flex gap-6 items-center">
                {/* Dynamic Logo/Home Link */}
                <Link 
                  to={userRole !== 'resident' && userRole !== 'guest' ? '/admin' : '/'} 
                  className="hover:text-green-200 text-lg flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
                  MENRO Arayat
                </Link>
                
                {/* Only show "File Complaint" to Logged-in Residents */}
                {isLoggedIn && userRole === 'resident' && (
                    <Link to="/submit-complaint" className="hover:text-green-200">File Complaint</Link>
                )}
            </div>

            {/* Right Side Links */}
            <div className="flex gap-4 items-center">
                {isLoggedIn ? (
                    <button 
                      onClick={handleLogout} 
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                      Logout
                    </button>
                ) : (
                    <>
                        <Link to="/login" className="hover:text-green-200 px-2">Login</Link>
                        <Link to="/register" className="bg-white text-green-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors shadow-sm">
                          Register
                        </Link>
                    </>
                )}
            </div>

          </div>
        </nav>

        {/* Main Content Area & Route Guards */}
        {/* Note: Removed the container constraints so the Home Landing Page stretches full width */}
        <main className="flex-grow bg-gray-50">
          <Routes>
           {/* Home Route: Residents and Guests stay here, Officials go to Admin */}
            <Route path="/" element={
              isLoggedIn && (userRole === 'menro_staff' || userRole === 'barangay_official') 
                ? <Navigate to="/admin" /> 
                : <Home />
            } />
            
            {/* Admin Route: ONLY explicitly known officials can access this page */}
            <Route path="/admin" element={
              isLoggedIn && (userRole === 'menro_staff' || userRole === 'barangay_official') 
                ? <AdminDashboard /> 
                : <Navigate to="/" />
            } />

            {/* Authentication Routes: Smart Navigation based purely on state */}
            <Route path="/login" element={
              isLoggedIn 
                ? ((userRole === 'menro_staff' || userRole === 'barangay_official') ? <Navigate to="/admin" /> : <Navigate to="/" />) 
                : <Login setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />
            } />
            
            <Route path="/register" element={
              isLoggedIn 
                ? ((userRole === 'menro_staff' || userRole === 'barangay_official') ? <Navigate to="/admin" /> : <Navigate to="/" />) 
                : <Register setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />
            } />
            
            {/* Complaint Form: Only for Residents */}
            <Route path="/submit-complaint" element={
              isLoggedIn && userRole === 'resident' ? <ComplaintForm /> : <Navigate to="/login" />
            } />
          </Routes>
        </main>

      </div>
    </Router>
  );
}

export default App;