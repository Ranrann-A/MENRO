import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();
  
  // 1. Setup state to hold the user's typed input
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // State to handle any errors (like wrong password)
  const [errorMessage, setErrorMessage] = useState('');

  // 2. Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 3. Handle the form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage(''); 

        try {
        // 1. The Security Handshake: Ask Laravel to set the CSRF cookie first
        await axios.get('/sanctum/csrf-cookie');
        
        // 2. Send the login request (Notice we don't need the full URL anymore because of our defaults!)
        await axios.post('/api/login', formData);
        window.location.href = '/';
      
        } catch (error) {
        if (error.response && error.response.data.errors) {
            setErrorMessage(Object.values(error.response.data.errors).flat().join(' '));
        } else if (error.response && error.response.data.message) {
            setErrorMessage(error.response.data.message);
        } else {
            setErrorMessage('Login failed. Please check your credentials and try again.');
        }
        }
    };
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-green-700 mb-6">Resident Login</h2>
      
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Email Field */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-200"
        >
          Sign In
        </button>

      </form>
    </div>
  );
};

export default Login;