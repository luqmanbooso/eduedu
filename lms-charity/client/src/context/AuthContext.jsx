import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.baseURL = 'http://localhost:5000/api';
  
  // Add token to requests if available
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  // Listen for token changes in other tabs (e.g., after admin approval)
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === 'token' && event.newValue) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${event.newValue}`;
        fetchUser();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const fetchUser = async () => {
    try {
      console.log('fetchUser: Authorization header (axios):', axios.defaults.headers.common['Authorization']);
      if (api && api.defaults) {
        console.log('fetchUser: Authorization header (api):', api.defaults.headers.common['Authorization']);
      }
      const response = await axios.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      if (api && api.defaults) {
        delete api.defaults.headers.common['Authorization'];
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const googleAuth = async (userData) => {
    try {
      const response = await axios.post('/auth/google', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Google authentication failed' 
      };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post('/auth/forgot-password', { email });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send reset code' 
      };
    }
  };

  const verifyResetCode = async (resetToken, code) => {
    try {
      const response = await axios.post('/auth/verify-reset-code', { resetToken, code });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid verification code' 
      };
    }
  };

  const resetPassword = async (resetToken, newPassword) => {
    try {
      const response = await axios.post('/auth/reset-password', { resetToken, newPassword });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to reset password' 
      };
    }
  };

  // Rename the new login method to loginWithToken to avoid redeclaration
  const loginWithToken = ({ token }) => {
    console.log('Setting token in loginWithToken:', token);
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    if (api && api.defaults) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    fetchUser();
  };

  const value = {
    user,
    login,
    loginWithToken,
    register,
    logout,
    googleAuth,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
