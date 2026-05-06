import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = ({ setIsLoggedIn, setUserRole }) => {
  const navigate = useNavigate();
  
  // State for loading data and handling errors
  const [barangays, setBarangays] = useState([]);
  const [loadingBarangays, setLoadingBarangays] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // State for the form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    barangay_id: '',
    password: '',
    password_confirmation: ''
  });

  // 1. Fetch the Barangays when the component loads
  useEffect(() => {
    // Notice we use the relative path '/api/barangays' now!
    axios.get('/api/barangays')
      .then(response => {
        setBarangays(response.data);
        setLoadingBarangays(false);
      })
      .catch(error => {
        console.error("Barangay Fetch Error:", error);
        setErrorMessage('Could not load barangays. Please check your backend connection.');
        setLoadingBarangays(false);
      });
  }, []);

  // 2. Handle typing in the input fields
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Clear old errors

    // Simple password validation before talking to the server
    if (formData.password !== formData.password_confirmation) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      // Step A: The Security Handshake. Ask Laravel for a CSRF cookie first.
      await axios.get('/sanctum/csrf-cookie');
      
      // Step B: Send the registration data using the relative path
      await axios.post('/api/register', formData);
      
      // Step C: Update App.jsx state to show the user is logged in
      setIsLoggedIn(true);
      setUserRole('resident')
      // Step D: Redirect to the home dashboard
      navigate('/');
    } catch (error) {
      // Display specific validation errors from Laravel (like "Email already taken")
      if (error.response && error.response.data.errors) {
        setErrorMessage(Object.values(error.response.data.errors).flat().join(' '));
      } else if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Registration failed. Please check your connection and try again.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-3xl font-bold text-center text-green-700 mb-6">Resident Registration</h2>
      
      {/* Error Message Display */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        <div>
          <label className="block text-gray-800 text-sm font-bold mb-2">Full Name</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-gray-800 text-sm font-bold mb-2">Email Address</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-gray-800 text-sm font-bold mb-2">Barangay</label>
          <select 
            name="barangay_id" 
            value={formData.barangay_id} 
            onChange={handleChange} 
            required
            disabled={loadingBarangays}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors bg-white disabled:bg-gray-100"
          >
            <option value="" disabled>
              {loadingBarangays ? "Loading Barangays..." : "Select your Barangay"}
            </option>
            {barangays.map((brgy) => (
              <option key={brgy.id} value={brgy.id}>
                {brgy.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-800 text-sm font-bold mb-2">Password</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            minLength="8"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-gray-800 text-sm font-bold mb-2">Confirm Password</label>
          <input 
            type="password" 
            name="password_confirmation" 
            value={formData.password_confirmation} 
            onChange={handleChange} 
            required 
            minLength="8"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          />
        </div>

        <button 
          type="submit" 
          className="mt-4 bg-[#0e964d] hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-300 transition duration-200"
        >
          Register Account
        </button>

      </form>
    </div>
  );
};

export default Register;