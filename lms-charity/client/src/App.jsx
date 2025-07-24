import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ModernNavbar from './components/ModernNavbar';
import InstructorNavbar from './components/InstructorNavbar';
import HomePage from './pages/HomePage';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import CourseCreate from './pages/CourseCreate';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import MyLearningEnhanced from './pages/MyLearningEnhanced';
import CourseLearnEnhanced from './pages/CourseLearnEnhanced';
import CertificateViewer from './components/CertificateViewer';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import CourseEditPlaceholder from './pages/CourseEditPlaceholder';
import CoursePreviewPlaceholder from './pages/CoursePreviewPlaceholder';
import InstructorProfile from './pages/InstructorProfile';
import InstructorHelp from './pages/InstructorHelp';

// Component to conditionally render the appropriate navbar
const ConditionalNavbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Don't render navbar for admin dashboard
  if (location.pathname.startsWith('/admin')) {
    return null;
  }
  
  // Render InstructorNavbar for instructors, ModernNavbar for everyone else
  if (user && user.role === 'instructor') {
    return <InstructorNavbar />;
  }
  
  return <ModernNavbar />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 transition-colors">
          <ConditionalNavbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/courses" element={<CourseList />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/certificate/:certificateId/:verificationCode" element={<CertificateViewer />} />
              <Route 
                path="/my-learning" 
                element={
                  <ProtectedRoute>
                    <MyLearningEnhanced />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/learn/:courseId" 
                element={
                  <ProtectedRoute>
                    <CourseLearnEnhanced />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/instructor/dashboard" 
                element={
                  <ProtectedRoute requiredRole="instructor">
                    <InstructorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/instructor/courses" 
                element={
                  <ProtectedRoute requiredRole="instructor">
                    <InstructorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/instructor/students" 
                element={
                  <ProtectedRoute requiredRole="instructor">
                    <InstructorDashboard />
                  </ProtectedRoute>
                } 
              />

              <Route
                path="/instructor/discussions"
                element={
                  <ProtectedRoute requiredRole="instructor">
                    <InstructorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/grading"
                element={
                  <ProtectedRoute requiredRole="instructor">
                    <InstructorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/analytics"
                element={
                  <ProtectedRoute requiredRole="instructor">
                    <InstructorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-course" 
                element={
                  <ProtectedRoute requiredRole="instructor">
                    <CourseCreate />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/instructor/profile" 
                element={
                  <ProtectedRoute requiredRole="instructor">
                    <InstructorProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/instructor/help" 
                element={
                  <ProtectedRoute requiredRole="instructor">
                    <InstructorHelp />
                  </ProtectedRoute>
                } 
              />
              <Route path="/courses/edit/:id" element={<CourseEditPlaceholder />} />
              <Route path="/courses/preview/:id" element={<CoursePreviewPlaceholder />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
