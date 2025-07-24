import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { GraduationCap, User, LogOut, Plus, BookOpen, Moon, Sun } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
                
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium dark:text-red-400"
                  >
                    <span>Admin Panel</span>
                  </Link>
                )}
                
                <Link 
                  to="/my-learning" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium dark:text-gray-300 dark:hover:text-blue-400"
                >
                  <User className="h-4 w-4" />
                  <span>My Learning</span>
                </Link>

                {/* Notification Center */}
                <NotificationCenter />

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {user.name}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-500 px-3 py-2 rounded-md text-sm font-medium dark:text-gray-300"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                {/* Theme Toggle for non-logged users */}
                <button
                  onClick={toggleTheme}
                  className="p-2 text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
                  title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-500 px-3 py-2 rounded-md text-sm font-medium dark:text-gray-300"
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
