import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, User, LogOut, Plus, BookOpen } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-blue-500" />
              <span className="text-xl font-bold text-gray-900">
                Charity LMS
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              to="/courses" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium"
            >
              <BookOpen className="h-4 w-4" />
              <span>Browse Courses</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                {(user.role === 'instructor' || user.role === 'admin') && (
                  <Link 
                    to="/create-course" 
                    className="btn-primary flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Course</span>
                  </Link>
                )}
                
                <Link 
                  to="/dashboard" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    {user.name}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="btn-primary"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
