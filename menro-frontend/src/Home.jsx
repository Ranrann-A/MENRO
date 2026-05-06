import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const location = useLocation();
  const successMessage = location.state?.successMessage;

  // --- Mock Data for the News Cards ---
  const newsItems = [
    {
      id: 1,
      category: 'Program',
      date: 'March 28, 2026',
      title: 'New Waste Segregation Program Launched',
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400',
      badgeColor: 'bg-green-600'
    },
    {
      id: 2,
      category: 'Schedule',
      date: 'March 25, 2026',
      title: 'Collection Schedule Update for April',
      image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=400',
      badgeColor: 'bg-green-700'
    },
    {
      id: 3,
      category: 'Activity',
      date: 'March 20, 2026',
      title: 'Community Clean-up Drive Success',
      image: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?auto=format&fit=crop&q=80&w=400',
      badgeColor: 'bg-green-500'
    }
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userResponse, complaintsResponse] = await Promise.all([
          axios.get('/api/user'),
          axios.get('/api/complaints')
        ]);
        
        setUser(userResponse.data);
        setComplaints(complaintsResponse.data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your dashboard...</div>;

  // ==========================================
  // LOGGED IN VIEW (Resident Dashboard)
  // ==========================================
  if (user) {
    return (
      <div className="container mx-auto p-8 mt-4 bg-white shadow rounded-lg">
        <div className="max-w-4xl mx-auto">
          {successMessage && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <strong className="font-bold">Success! </strong>
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h2>
            <p className="text-gray-600 mt-1">MENRO Arayat - Resident Dashboard | {user.barangay ? user.barangay.name : ''}</p>
          </div>

          <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
            <button className="px-4 py-2 bg-gray-100 text-gray-900 font-semibold rounded-t-lg">My Complaints</button>
            <Link to="/submit-complaint" className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">File New Complaint</Link>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">Household Violations</button>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800">My Complaint History</h3>
            <p className="text-gray-500 text-sm mb-6">Track the status of all your filed complaints</p>

            {complaints.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">You haven't filed any complaints yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {complaints.map((complaint) => (
                  <div key={complaint.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex">
                    <div className={`w-2 ${complaint.status === 'resolved' ? 'bg-green-500' : 'bg-blue-600'}`}></div>
                    <div className="p-6 w-full">
                        <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-bold text-gray-900">
                                CMP-2026-{complaint.id.toString().padStart(3, '0')}
                            </h4>
                            
                            {/* We add '|| "pending"' so it always has a fallback value */}
                            <span className={`px-2 py-1 rounded text-xs font-bold text-white capitalize ${
                                (complaint.status || 'pending') === 'pending' ? 'bg-yellow-500' : 
                                complaint.status === 'resolved' ? 'bg-green-500' : 'bg-blue-500'
                            }`}>
                                {complaint.status || 'pending'}
                            </span>
                        </div>
                      
                        <div className="flex items-center text-gray-500 text-sm mb-6 gap-1">
                            Filed on {formatDate(complaint.created_at)}
                        </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Complaint Type</p>
                          <p className="font-medium text-gray-900">{complaint.title}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Location</p>
                          <div className="font-medium text-gray-900">
                            {complaint.location_address || 'Not specified'}
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Description</p>
                        <p className="text-gray-800">{complaint.description}</p>
                      </div>

                      {complaint.official_response && (
                        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-5">
                          <h5 className="font-bold text-blue-900 mb-2">Official Response</h5>
                          <p className="text-blue-800 mb-2">{complaint.official_response}</p>
                          <p className="text-xs text-blue-600">Responded on {formatDate(complaint.resolved_at || complaint.updated_at)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // GUEST VIEW (Landing Page)
  // ==========================================
  return (
    <div className="w-full bg-white pb-16">
      
      {/* Hero Banner Section */}
      <div className="bg-[#0e964d] text-white py-20 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Welcome to Arayat Solid Waste <br className="hidden md:block" /> Management
          </h1>
          <p className="text-lg md:text-xl mb-8 font-light tracking-wide text-green-50">
            Working together for a cleaner, greener Arayat, Pampanga
          </p>
          <button className="bg-white text-[#0e964d] font-bold py-3 px-6 rounded-lg shadow hover:bg-gray-100 transition duration-200">
            View Schedule
          </button>
        </div>
      </div>

      {/* Latest News Section */}
      <div className="max-w-6xl mx-auto px-6 sm:px-12 mt-16">
        <div className="flex items-center gap-3 mb-8">
          <svg className="w-8 h-8 text-[#0e964d]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
          </svg>
          <h2 className="text-3xl font-bold text-gray-900">Latest News & Updates</h2>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition duration-200">
              
              {/* Image with Badge */}
              <div className="relative h-48 w-full">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                <span className={`absolute top-4 right-4 text-white text-xs font-bold px-3 py-1 rounded-full shadow ${item.badgeColor}`}>
                  {item.category}
                </span>
              </div>
              
              {/* Card Content */}
              <div className="p-6">
                <p className="text-sm text-gray-500 mb-2">{item.date}</p>
                <h3 className="text-xl font-bold text-gray-900 leading-snug">
                  {item.title}
                </h3>
              </div>
              
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Home;