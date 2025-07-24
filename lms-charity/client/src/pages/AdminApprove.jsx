import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminApprove = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState('pending');
  const params = new URLSearchParams(location.search);
  const token = params.get('token');

  const handleApprove = async () => {
    setStatus('loading');
    try {
      const res = await axios.post('/api/auth/admin-approve', { token });
      // Save token, log in, redirect
      loginWithToken({ token: res.data.loginToken });
      setStatus('success');
      navigate('/admin');
    } catch (err) {
      setStatus('error');
    }
  };

  if (!token) return <div>Invalid or missing token.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Admin Login Approval</h2>
        {status === 'pending' && (
          <>
            <p>Are you sure you want to approve this admin login?</p>
            <button
              onClick={handleApprove}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg font-bold"
            >
              Approve Admin Login
            </button>
          </>
        )}
        {status === 'loading' && <p>Approving...</p>}
        {status === 'success' && <p>Login approved! Redirecting...</p>}
        {status === 'error' && <p className="text-red-600">Approval failed. Try again.</p>}
      </div>
    </div>
  );
};

export default AdminApprove; 