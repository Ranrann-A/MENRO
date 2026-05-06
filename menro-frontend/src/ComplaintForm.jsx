import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ComplaintForm = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    location_address: '',
    description: '',
  });
  
  const [photo, setPhoto] = useState(null);

  // Fetch user data so we can display their Barangay and Email in the UI notes
  useEffect(() => {
    axios.get('/api/user')
      .then(response => setUser(response.data))
      .catch(() => setErrorMessage('Failed to load user profile.'));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Create a FormData object to hold text AND files
    const formData = new FormData();
    formData.append('title', title); // replace 'title' with your state variable names
    formData.append('location_address', locationAddress); 
    formData.append('description', description);
    
    // 2. Only append the photo if they actually selected one
    if (photo) {
      formData.append('photo', photo);
    }

    try {
      // 3. Send it to Laravel. Notice the special 'headers' configuration!
      await axios.post('/api/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      alert('Complaint submitted successfully!');
      // Reset your form here...

      
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  if (!user) return <div className="p-8 text-center">Loading form...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-8 p-8 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">File a New Complaint</h2>
        <p className="text-gray-500 mt-1">Report waste management issues in your area</p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Complaint Type (Title) */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Complaint Type <span className="text-red-500">*</span></label>
          <select 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            required
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          >
            <option value="" disabled>Select complaint type</option>
            <option value="Uncollected Garbage">Uncollected Garbage</option>
            <option value="Illegal Dumping">Illegal Dumping</option>
            <option value="Overflowing Bins">Overflowing Bins</option>
            <option value="Missed Collection Schedule">Missed Collection Schedule</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Specific Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Specific Location</label>
          <input 
            type="text" 
            name="location_address" 
            value={formData.location_address} 
            onChange={handleChange} 
            placeholder="e.g., Corner of Sampaguita St. and Main Road"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
          <p className="text-xs text-gray-500 mt-2">
            Your barangay: {user.barangay ? user.barangay.name : 'Unknown'}
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Description <span className="text-red-500">*</span></label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            required
            rows="4"
            placeholder="Please describe the issue in detail..."
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors resize-none"
          ></textarea>
        </div>

        {/* Photo Evidence (UI Only for now) */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Photo Evidence (Optional)</label>
          <div className="w-full p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
            <svg className="w-8 h-8 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            <span className="text-sm text-gray-600">Click to take a photo or upload from gallery</span>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Your complaint will be reviewed by the barangay and MENRO office.
          </p>
          <p className="text-sm text-blue-700 mt-1">
            You will receive updates via email at: {user.email}
          </p>
        </div>

        <div>
          <label className="block text-gray-800 text-sm font-bold mb-2">Photo Evidence (Optional)</label>
          <input 
            type="file" 
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0])} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          />
          <p className="text-xs text-gray-500 mt-1">Max file size: 5MB. Accepted formats: JPG, PNG.</p>
        </div>
        
        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-blue-300"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
        </button>
      </form>
    </div>
  );
};

export default ComplaintForm;