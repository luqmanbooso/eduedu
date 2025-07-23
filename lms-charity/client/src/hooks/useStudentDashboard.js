import { useState, useEffect } from 'react';
import { courseAPI, notificationAPI, certificateAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useStudentDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch enrolled courses with progress
      const enrolledCoursesRes = await courseAPI.getEnrolledCourses();
      const enrolledCoursesRaw = (enrolledCoursesRes.data || enrolledCoursesRes.courses || []);
      const enrolledCourses = enrolledCoursesRaw.map(course => ({
        ...course,
        progress: course.progress?.percentage || 0,
        completedLessons: course.progress?.completedLessons || 0,
        totalLessons: course.totalLessons || 0,
        estimatedTimeLeft: course.progress?.timeLeft || 'N/A',
        enrolledAt: course.enrollment?.enrolledAt || course.enrolledAt,
        lastAccessed: course.enrollment?.lastAccessed || course.lastAccessed,
        nextLesson: course.progress?.nextLesson || 'Start Course',
        hasQuizzes: !!course.hasQuizzes,
        hasAssignments: !!course.hasAssignments,
        hasDiscussions: !!course.hasDiscussions,
        upcomingDeadlines: [] // You can fill this if you have deadlines
      }));
      setEnrolledCourses(enrolledCourses);

      // Fetch available courses and filter out enrolled
      const allCoursesRes = await courseAPI.getAllCourses({ page: 1, limit: 50 });
      const availableCourses = (allCoursesRes.courses || []).filter(
        c => !enrolledCourses.some(ec => ec._id === c._id)
      );
      setAvailableCourses(availableCourses);

      // Fetch certificates
      const certificatesRes = await certificateAPI.getMyCertificates();
      setCertificates(certificatesRes.certificates || []);

      // Fetch notifications
      const notificationsRes = await notificationAPI.getNotifications({ page: 1, limit: 20 });
      setNotifications(notificationsRes.notifications || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Enroll in a course
  const enrollInCourse = async (courseId) => {
    try {
      await courseAPI.enrollInCourse(courseId);
      
      // Refresh dashboard data
      await fetchDashboardData();
      
      toast.success('Successfully enrolled in course!');
      
      return true;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error(error.response?.data?.message || 'Failed to enroll in course');
      return false;
    }
  };

  // Continue learning (navigate to course)
  const continueLearning = async (courseId) => {
    try {
      // Update last accessed time
      const progressItem = enrolledCourses.find(p => p._id === courseId);
      if (progressItem) {
        await courseAPI.updateCourseProgress(courseId, {
          lastAccessed: new Date()
        });
      }
      
      toast.success('Continuing course...');
      return true;
    } catch (error) {
      console.error('Error updating course access:', error);
      return false;
    }
  };

  // Complete a lesson
  const completeLesson = async (courseId, lessonId, timeSpent = 0, quizScore = null) => {
    try {
      await courseAPI.completeLesson({
        courseId,
        lessonId,
        timeSpent,
        quizScore
      });
      
      // Refresh progress data
      await fetchDashboardData();
      
      toast.success('Lesson completed!');
      return true;
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast.error('Failed to mark lesson as complete');
      return false;
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true, readAt: new Date() }
            : notification
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ 
          ...notification, 
          isRead: true, 
          readAt: new Date() 
        }))
      );
      
      toast.success('All notifications marked as read');
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark notifications as read');
      return false;
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.filter(notification => notification._id !== notificationId)
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
      return false;
    }
  };

  // Download certificate
  const downloadCertificate = async (certificateId) => {
    try {
      const blob = await certificateAPI.downloadCertificate(certificateId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Certificate downloaded!');
      return true;
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
      return false;
    }
  };

  return {
    // Data
    enrolledCourses,
    availableCourses,
    notifications,
    certificates,
    loading,
    error,
    
    // Actions
    enrollInCourse,
    continueLearning,
    completeLesson,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    downloadCertificate,
    refreshData: fetchDashboardData
  };
};
