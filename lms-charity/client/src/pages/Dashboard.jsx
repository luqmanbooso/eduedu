import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  // Redirect users to their role-specific dashboards
  if (user && user.role === 'instructor') {
    return <Navigate to="/instructor/dashboard" replace />;
  }
  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  if (user && user.role === 'student') {
    return <Navigate to="/my-learning" replace />;
  }

  // If not logged in or unknown role, render nothing
  return null;
};

export default Dashboard;
