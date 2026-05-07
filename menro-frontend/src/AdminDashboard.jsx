import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [responses, setResponses] = useState({});
  
  // NEW: State to control our Modal popup
  const [selectedComplaint, setSelectedComplaint] = useState(null);

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
      // If they forward from inside the modal, close it
      setSelectedComplaint(null);
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
      setSelectedComplaint(null);
    } catch (error) {
      alert("Failed to resolve complaint.");
    }
  };

  const handleResponseChange = (id, text) => {
    setResponses({ ...responses, [id]: text });
  };

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    forwarded: complaints.filter(c => c.status === 'forwarded').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
  };

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
    <div className="p-8 max-w-7xl mx-auto relative">
      
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

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Records</p>
          <p className="text-4xl font-black text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6 flex flex-col justify-center border-b-4 border-b-yellow-400">
          <p className="text-sm font-semibold text-yellow-600 uppercase tracking-wider mb-1">Pending Action</p>
          <p className="text-4xl font-black text-yellow-500">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6 flex flex-col justify-center border-b-4 border-b-blue-500">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-1">Dispatched</p>
          <p className="text-4xl font-black text-blue-600">{stats.forwarded}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-6 flex flex-col justify-center border-b-4 border-b-green-500">
          <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-1">Resolved</p>
          <p className="text-4xl font-black text-green-600">{stats.resolved}</p>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700">Complaint Register</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4 font-semibold bg-white">Tracking ID</th>
              <th className="p-4 font-semibold bg-white w-1/3">Summary</th>
              <th className="p-4 font-semibold bg-white">Status</th>
              <th className="p-4 font-semibold bg-white">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {complaints.length === 0 ? (
              <tr><td colSpan="4" className="p-12 text-center text-gray-500 font-medium">No active complaints found.</td></tr>
            ) : (
              complaints.map(complaint => (
                <tr key={complaint.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-700 align-middle">
                    CMP-{complaint.id.toString().padStart(3, '0')}
                  </td>
                  <td className="p-4 align-middle">
                    <p className="font-bold text-gray-900 text-base">{complaint.title}</p>
                    {/* Truncated description for the table view */}
                    <p className="text-gray-500 mt-1 truncate max-w-xs">{complaint.description}</p>
                    {complaint.photo_path && (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        Has Photo
                      </span>
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize shadow-sm ${
                      complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      complaint.status === 'forwarded' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      {complaint.status}
                    </span>
                  </td>
                  <td className="p-4 align-middle">
                    {/* View Details Button */}
                    <button 
                      onClick={() => setSelectedComplaint(complaint)}
                      className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm text-sm mr-2"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL OVERLAY --- */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col relative">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 rounded-t-xl">
              <div>
                <p className="text-sm font-bold text-gray-400 mb-1">TRACKING ID: CMP-{selectedComplaint.id.toString().padStart(3, '0')}</p>
                <h3 className="text-2xl font-black text-gray-900">{selectedComplaint.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              
              <div className="flex flex-wrap gap-4 mb-6">
                 <div className="bg-gray-100 rounded px-3 py-2 text-sm text-gray-700 flex-1">
                    <span className="font-bold text-gray-500 block text-xs uppercase mb-1">Reporter</span> 
                    {selectedComplaint.user?.name}
                 </div>
                 <div className="bg-gray-100 rounded px-3 py-2 text-sm text-gray-700 flex-1">
                    <span className="font-bold text-gray-500 block text-xs uppercase mb-1">Location</span> 
                    {selectedComplaint.location_address || 'N/A'}
                 </div>
                 <div className="bg-gray-100 rounded px-3 py-2 text-sm text-gray-700 flex-1">
                    <span className="font-bold text-gray-500 block text-xs uppercase mb-1">Current Status</span> 
                    <span className="capitalize font-bold">{selectedComplaint.status}</span>
                 </div>
              </div>

              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-2">Full Description</h4>
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100 whitespace-pre-wrap">
                  {selectedComplaint.description}
                </p>
              </div>

              {selectedComplaint.photo_path && (
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Photo Evidence
                  </h4>
                  <a href={`http://127.0.0.1:8000/storage/${selectedComplaint.photo_path}`} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={`http://127.0.0.1:8000/storage/${selectedComplaint.photo_path}`} 
                      alt="Complaint Evidence" 
                      className="w-full max-h-80 object-cover rounded-lg border border-gray-200 shadow-sm hover:opacity-90 transition-opacity"
                    />
                  </a>
                </div>
              )}

              {/* Action Area Inside Modal */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4">Required Actions</h4>
                
                {user.role === 'menro_staff' && selectedComplaint.status === 'pending' && (
                  <button onClick={() => handleForward(selectedComplaint.id)} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-bold transition-colors shadow-sm flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    Forward to Barangay Unit
                  </button>
                )}
                
                {user.role === 'menro_staff' && selectedComplaint.status !== 'pending' && (
                  <div className="text-gray-500 italic flex items-center gap-2 text-sm bg-gray-50 p-3 rounded border border-gray-100 justify-center">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Issue has been dispatched to Local Unit
                  </div>
                )}
                
                {user.role === 'barangay_official' && selectedComplaint.status === 'forwarded' && (
                  <div className="flex flex-col gap-3">
                    <textarea
                      placeholder="Type official resolution notes..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none resize-none text-sm"
                      rows="3"
                      value={responses[selectedComplaint.id] || ''}
                      onChange={(e) => handleResponseChange(selectedComplaint.id, e.target.value)}
                    ></textarea>
                    <button onClick={() => handleResolve(selectedComplaint.id)} className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-bold transition-colors shadow-sm flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Mark as Resolved
                    </button>
                  </div>
                )}
                
                {user.role === 'barangay_official' && selectedComplaint.status === 'resolved' && (
                  <div className="text-green-700 font-bold flex items-center justify-center gap-2 bg-green-50 p-4 rounded-lg border border-green-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Issue Resolved
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;