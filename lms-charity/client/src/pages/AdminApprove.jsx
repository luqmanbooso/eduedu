import React, { useEffect, useState } from 'react';
console.log('AdminApprove page loaded');
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AdminApprove = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState('loading');
  const params = new URLSearchParams(location.search);
  const token = params.get('token');

  useEffect(() => {
    // Delay the approval logic by 3 seconds for debugging
    const timer = setTimeout(() => {
      const approve = async () => {
        console.log('AdminApprove useEffect running, token:', token);
        if (!token) {
          setStatus('error');
          return;
        }
        try {
          console.log('Sending approval API call...');
          const res = await axios.post('/auth/admin-approve', { token });
          console.log('Received loginToken from backend:', res.data.loginToken);
          loginWithToken({ token: res.data.loginToken });
          setStatus('success');
          setTimeout(() => {
            navigate('/admin', { replace: true });
          }, 2000); // 2s delay before redirect to admin
        } catch (err) {
          console.log('Error during approval:', err);
          setStatus('error');
        }
      };
      approve();
    }, 500); // 0.5s delay before running approve
    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, [token]);

  if (status === 'loading') return <div>Approving admin login...</div>;
  if (status === 'error') return <div>Approval failed. Invalid or expired link.</div>;
  return null;
};

export default AdminApprove; 