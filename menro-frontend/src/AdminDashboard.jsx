import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [responses, setResponses] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, complaintsRes] = await Promise.all([
        axios.get('/api/user'),
        axios.get('/api/admin/complaints')
      ]);
      setUser(userRes.data);
      setComplaints(complaintsRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      if (error.response) {
        setFetchError(`Backend Error ${error.response.status}: ${error.response.data.message || error.response.statusText}`);
      } else {
        setFetchError("Network error: Could not reach the backend.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForward = async (id) => {
    try {
      await axios.put(`/api/admin/complaints/${id}/forward`);
      fetchData(); 
    } catch (error) {
      alert("Failed to forward complaint.");
    }
  };

  const handleResolve = async (id) => {
    if (!responses[id] || responses[id].trim() === '') {
      alert("Please type an official response before resolving.");
      return;
    }
    try {
      await axios.put(`/api/admin/complaints/${id}/resolve`, {
        official_response: responses[id]
      });
      fetchData(); 
    } catch (error) {
      alert("Failed to resolve complaint.");
    }
  };

  const handleResponseChange = (id, text) => {
    setResponses({ ...responses, [id]: text });
  };

  // --- ANALYTICS CALCULATIONS ---
  // We calculate these on the fly every time the component renders or updates!
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    forwarded: complaints.filter(c => c.status === 'forwarded').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

  // --- RENDER LOGIC ---
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-bold">Loading Official Portal...</div>;
  
  if (fetchError) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-10">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
          <h3 className="text-red-800 font-bold text-lg mb-2">Dashboard Failed to Load</h3>
          <p className="text-red-700 font-mono text-sm">{fetchError}</p>
        </div>
      </div>
    );
  }

  if (!user) return <div className="p-8 text-center text-red-500">Unauthorized access.</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">MENRO Administrative Portal</h2>
          <p className="text-gray-600 mt-1">
            Logged in as: <span className="font-bold text-green-700 uppercase tracking-wide">{user.role.replace('_', ' ')}</span>
            {user.barangay && <span className="ml-2 text-gray-500 font-medium">({user.barangay.name})</span>}
          </p>
        </div>
      </div>

      {/* --- NEW: ANALYTICS SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        
        {/* Total Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Records</p>
          <p className="text-4xl font-black text-gray-800">{stats.total}</p>
        </div>

        {/* Pending Card */}
        <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6 flex flex-col justify-center border-b-4 border-b-yellow-400">
          <p className="text-sm font-semibold text-yellow-600 uppercase tracking-wider mb-1">Pending Action</p>
          <p className="text-4xl font-black text-yellow-500">{stats.pending}</p>
        </div>

        {/* Forwarded Card */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6 flex flex-col justify-center border-b-4 border-b-blue-500">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-1">Dispatched</p>
          <p className="text-4xl font-black text-blue-600">{stats.forwarded}</p>
        </div>

        {/* Resolved Card */}
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 flex flex-col justify-center border-b-4 border-b-green-500">
          <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-1">Resolved</p>
          <p className="text-4xl font-black text-green-600">{stats.resolved}</p>
        </div>

      </div>

      {/* Data Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-700">Complaint Register</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold bg-white">Tracking ID</th>
              <th className="p-4 font-semibold bg-white">Details</th>
              <th className="p-4 font-semibold bg-white">Status</th>
              <th className="p-4 font-semibold bg-white">Action Required</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {complaints.length === 0 ? (
              <tr><td colSpan="4" className="p-12 text-center text-gray-500 font-medium">No active complaints found.</td></tr>
            ) : (
              complaints.map(complaint => (
                <tr key={complaint.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-700 whitespace-nowrap align-top">
                    CMP-{complaint.id.toString().padStart(3, '0')}
                  </td>
                  <td className="p-4 align-top">
                    <p className="font-bold text-gray-900 text-base">{complaint.title}</p>
                    <p className="text-gray-600 mt-1 mb-2 leading-relaxed">{complaint.description}</p>
                    <div className="inline-block bg-gray-100 rounded px-2 py-1 text-xs text-gray-500 mb-1">
                      <span className="font-semibold text-gray-700">Location:</span> {complaint.location_address || 'N/A'}
                    </div>
                    <br/>
                    <div className="inline-block bg-gray-100 rounded px-2 py-1 text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">Reporter:</span> {complaint.user?.name}
                    </div>
                  </td>
                  <td className="p-4 whitespace-nowrap align-top">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize shadow-sm ${
                      complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      complaint.status === 'forwarded' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="p-4 w-72 align-top">
                    {user.role === 'menro_staff' && complaint.status === 'pending' && (
                      <button onClick={() => handleForward(complaint.id)} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold transition-colors shadow-sm flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                        Forward to Barangay
                      </button>
                    )}
                    {user.role === 'menro_staff' && complaint.status !== 'pending' && (
                      <div className="text-gray-500 italic flex items-center gap-2 text-sm bg-gray-50 p-2 rounded border border-gray-100">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        Dispatched to Local Unit
                      </div>
                    )}
                    {user.role === 'barangay_official' && complaint.status === 'forwarded' && (
                      <div className="flex flex-col gap-3">
                        <textarea
                          placeholder="Type official response..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none resize-none text-sm"
                          rows="3"
                          value={responses[complaint.id] || ''}
                          onChange={(e) => handleResponseChange(complaint.id, e.target.value)}
                        ></textarea>
                        <button onClick={() => handleResolve(complaint.id)} className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-bold transition-colors shadow-sm flex items-center justify-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          Mark as Resolved
                        </button>
                      </div>
                    )}
                    {user.role === 'barangay_official' && complaint.status === 'resolved' && (
                      <div className="text-green-700 font-semibold flex items-center gap-2 bg-green-50 p-3 rounded-lg border border-green-100">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Issue Resolved
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;