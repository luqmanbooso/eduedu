import { useState, useEffect } from 'react';
import { courseAPI, progressAPI, notificationAPI, certificateAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useStudentDashboard = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        availableCoursesData,
        progressData,
        notificationsData,
        certificatesData
      ] = await Promise.all([
        courseAPI.getAllCourses({ page: 1, limit: 50 }),
        progressAPI.getAllProgress(),
        notificationAPI.getNotifications({ page: 1, limit: 20 }),
        certificateAPI.getCertificates()
      ]);

      // Set available courses (those not enrolled in)
      setAvailableCourses(availableCoursesData.courses || []);

      // Set progress data and extract enrolled courses
      setProgress(progressData || []);
      
      // Transform progress data to enrolled courses format
      const enrolledCoursesData = progressData.map(progressItem => ({
        ...progressItem.course,
        progress: progressItem.progressPercentage || 0,
        totalLessons: progressItem.course.modules?.reduce((acc, module) => 
          acc + (module.lessons?.length || 0), 0) || 0,
        completedLessons: progressItem.completedLessons?.length || 0,
        enrolledAt: progressItem.createdAt,
        lastAccessed: progressItem.lastAccessed,
        nextLesson: progressItem.currentLesson?.title || 'Start Course',
        estimatedTimeLeft: calculateTimeLeft(progressItem),
        hasQuizzes: true,
        hasAssignments: true,
        hasDiscussions: true,
        upcomingDeadlines: getUpcomingDeadlines(progressItem.course)
      }));

      setEnrolledCourses(enrolledCoursesData);

      // Set notifications
      setNotifications(notificationsData.notifications || []);

      // Set certificates
      setCertificates(certificatesData.certificates || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate estimated time left for a course
  const calculateTimeLeft = (progressItem) => {
    const totalLessons = progressItem.course.modules?.reduce((acc, module) => 
      acc + (module.lessons?.length || 0), 0) || 0;
    const completedLessons = progressItem.completedLessons?.length || 0;
    const remainingLessons = totalLessons - completedLessons;
    const avgLessonTime = 30; // minutes per lesson
    const timeLeftMinutes = remainingLessons * avgLessonTime;
    
    if (timeLeftMinutes < 60) {
      return `${timeLeftMinutes}m`;
    } else {
      return `${Math.round(timeLeftMinutes / 60)}h`;
    }
  };

  // Get upcoming deadlines for a course
  const getUpcomingDeadlines = (course) => {
    // This would be based on assignment due dates, quiz deadlines, etc.
    // For now, return empty array as assignments are handled separately
    return [];
  };

  // Enroll in a course
  const enrollInCourse = async (courseId) => {
    try {
      await courseAPI.enrollInCourse(courseId);
      
      // Start progress tracking for the course
      await progressAPI.startCourse(courseId);
      
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
      const progressItem = progress.find(p => p.course._id === courseId);
      if (progressItem) {
        await progressAPI.updateProgress(courseId, {
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
      await progressAPI.completeLesson({
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

  // Load data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    // Data
    enrolledCourses,
    availableCourses,
    notifications,
    certificates,
    progress,
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
