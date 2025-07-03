import axios from 'axios';

// Base API URL - adjust based on your environment
// Using import.meta.env for Vite instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Course API functions
export const courseAPI = {
  // Get all courses with filters
  getAllCourses: async (params = {}) => {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  // Get single course
  getCourse: async (courseId) => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  },

  // Enroll in course
  enrollInCourse: async (courseId) => {
    const response = await api.post(`/courses/${courseId}/enroll`);
    return response.data;
  },

  // Get instructor's courses
  getInstructorCourses: async () => {
    const response = await api.get('/courses/instructor/my-courses');
    return response.data;
  },

  // Create course
  createCourse: async (courseData) => {
    console.log('=== API Service Create Course ===');
    console.log('Course data being sent:', courseData);
    console.log('API Base URL:', API_BASE_URL);
    console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
    
    try {
      const response = await api.post('/courses', courseData);
      console.log('API Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Service Error:', error);
      console.error('API Error Response:', error.response?.data);
      throw error;
    }
  },

  // Update course
  updateCourse: async (courseId, courseData) => {
    const response = await api.put(`/courses/${courseId}`, courseData);
    return response.data;
  },

  // Delete course
  deleteCourse: async (courseId) => {
    const response = await api.delete(`/courses/${courseId}`);
    return response.data;
  },

  // Add module to course
  addModule: async (courseId, moduleData) => {
    const response = await api.post(`/courses/${courseId}/modules`, moduleData);
    return response.data;
  },

  // Add lesson to module
  addLesson: async (courseId, moduleId, lessonData) => {
    const response = await api.post(`/courses/${courseId}/modules/${moduleId}/lessons`, lessonData);
    return response.data;
  },

  // Create discussion
  createDiscussion: async (courseId, discussionData) => {
    const response = await api.post(`/courses/${courseId}/discussions`, discussionData);
    return response.data;
  },

  // Submit course for review
  submitForReview: async (courseId) => {
    const response = await api.patch(`/courses/${courseId}/submit-review`);
    return response.data;
  },

  // Reply to discussion
  replyToDiscussion: async (courseId, discussionId, replyData) => {
    const response = await api.post(`/courses/${courseId}/discussions/${discussionId}/replies`, replyData);
    return response.data;
  },

  // Get enrolled courses
  getEnrolledCourses: async () => {
    const response = await api.get('/courses/enrolled');
    return response.data;
  },

  // Get completed courses
  getCompletedCourses: async () => {
    const response = await api.get('/courses/completed');
    return response.data;
  },

  // Get wishlisted courses
  getWishlistedCourses: async () => {
    const response = await api.get('/courses/wishlist');
    return response.data;
  },

  // Add to wishlist
  addToWishlist: async (courseId) => {
    const response = await api.post(`/courses/${courseId}/wishlist`);
    return response.data;
  },

  // Remove from wishlist
  removeFromWishlist: async (courseId) => {
    const response = await api.delete(`/courses/${courseId}/wishlist`);
    return response.data;
  }
};

// Enrollment API functions
export const enrollmentAPI = {
  // Enroll in a course
  enrollInCourse: async (courseId) => {
    const response = await api.post(`/enrollment/enroll/${courseId}`);
    return response.data;
  },

  // Get enrollment status for a course
  getEnrollmentStatus: async (courseId) => {
    const response = await api.get(`/enrollment/status/${courseId}`);
    return response.data;
  },

  // Update lesson progress
  updateLessonProgress: async (courseId, lessonId, progressData) => {
    const response = await api.post(`/enrollment/progress/${courseId}/lesson/${lessonId}`, progressData);
    return response.data;
  },

  // Get user's enrolled courses (with progress)
  getEnrolledCourses: async (params = {}) => {
    const response = await api.get('/enrollment/enrolled-courses', { params });
    return response.data;
  },

  // Get user's completed courses
  getCompletedCourses: async () => {
    const response = await api.get('/enrollment/completed-courses');
    return response.data;
  },

  // Get learning dashboard stats
  getLearningStats: async () => {
    const response = await api.get('/enrollment/stats');
    return response.data;
  }
};

// Certificate API functions
export const certificateAPI = {
  // Generate certificate for completed course
  generateCertificate: async (courseId, score = null) => {
    const response = await api.post('/certificates/generate', { courseId, score });
    return response.data;
  },

  // Get user's certificates
  getMyCertificates: async () => {
    const response = await api.get('/certificates/my-certificates');
    return response.data;
  },

  // Download certificate PDF
  downloadCertificate: async (certificateId) => {
    const response = await api.get(`/certificates/download/${certificateId}`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `certificate-${certificateId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  },

  // Verify certificate
  verifyCertificate: async (certificateId, verificationCode) => {
    const response = await api.get(`/certificates/verify/${certificateId}/${verificationCode}`);
    return response.data;
  },

  // Get certificate preview data
  getCertificatePreview: async (certificateId) => {
    const response = await api.get(`/certificates/preview/${certificateId}`);
    return response.data;
  }
};

// Progress API functions  
export const progressAPI = {
  // Get course progress for a user
  getCourseProgress: async (courseId) => {
    const response = await api.get(`/progress/course/${courseId}`);
    return response.data;
  },

  // Get lesson progress
  getLessonProgress: async (courseId, lessonId) => {
    const response = await api.get(`/progress/course/${courseId}/lesson/${lessonId}`);
    return response.data;
  },

  // Update lesson progress
  updateLessonProgress: async (courseId, progressData) => {
    const response = await api.post(`/progress/course/${courseId}/lesson`, progressData);
    return response.data;
  },

  // Mark lesson as complete
  markLessonComplete: async (courseId, lessonId) => {
    const response = await api.post(`/progress/course/${courseId}/lesson/${lessonId}/complete`);
    return response.data;
  },

  // Complete entire course
  completeCourse: async (courseId) => {
    const response = await api.post(`/progress/course/${courseId}/complete`);
    return response.data;
  },

  // Add bookmark
  addBookmark: async (courseId, bookmarkData) => {
    const response = await api.post(`/progress/course/${courseId}/bookmark`, bookmarkData);
    return response.data;
  },

  // Add note
  addNote: async (courseId, noteData) => {
    const response = await api.post(`/progress/course/${courseId}/note`, noteData);
    return response.data;
  },

  // Get all user progress
  getUserProgress: async () => {
    const response = await api.get('/progress/user');
    return response.data;
  }
};

// Enhanced Course API with enrollment checks
export const enhancedCourseAPI = {
  // Get course with enrollment status
  getCourseWithEnrollment: async (courseId) => {
    try {
      const [courseResponse, enrollmentResponse] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/enrollment/status/${courseId}`)
      ]);
      
      return {
        ...courseResponse.data,
        enrollment: enrollmentResponse.data.data
      };
    } catch (error) {
      // If enrollment check fails, still return course data
      if (error.response?.status === 401) {
        const courseResponse = await api.get(`/courses/${courseId}`);
        return {
          ...courseResponse.data,
          enrollment: { isEnrolled: false, canEnroll: true }
        };
      }
      throw error;
    }
  },

  // Get learning dashboard data
  getLearningDashboard: async () => {
    try {
      const [enrolledCoursesResponse, certificatesResponse] = await Promise.all([
        enrollmentAPI.getEnrolledCourses({ limit: 6 }),
        certificateAPI.getMyCertificates()
      ]);

      return {
        enrolledCourses: enrolledCoursesResponse.data.courses,
        certificates: certificatesResponse.data.certificates,
        stats: {
          totalEnrolled: enrolledCoursesResponse.data.pagination.total,
          totalCompleted: enrolledCoursesResponse.data.pagination.completed,
          totalCertificates: certificatesResponse.data.totalCertificates,
          totalCredits: certificatesResponse.data.totalCredits
        }
      };
    } catch (error) {
      console.error('Error fetching learning dashboard:', error);
      return {
        enrolledCourses: [],
        certificates: [],
        stats: { totalEnrolled: 0, totalCompleted: 0, totalCertificates: 0, totalCredits: 0 }
      };
    }
  }
};

// Notification helpers for enrollment
export const notificationHelpers = {
  // Show enrollment success notification
  showEnrollmentSuccess: (courseTitle) => {
    if (window.showNotification) {
      window.showNotification({
        type: 'success',
        title: 'Enrollment Successful!',
        message: `You are now enrolled in "${courseTitle}". Start learning!`,
        action: {
          label: 'Start Learning',
          onClick: () => window.location.href = '/my-courses'
        }
      });
    }
  },

  // Show course completion notification
  showCourseCompletion: (courseTitle, certificateId) => {
    if (window.showNotification) {
      window.showNotification({
        type: 'success',
        title: 'Course Completed! 🎉',
        message: `Congratulations! You've completed "${courseTitle}" and earned a certificate.`,
        action: {
          label: 'View Certificate',
          onClick: () => window.location.href = `/certificates/${certificateId}`
        }
      });
    }
  },

  // Show certificate download success
  showCertificateDownload: (certificateId) => {
    if (window.showNotification) {
      window.showNotification({
        type: 'info',
        title: 'Certificate Downloaded',
        message: 'Your certificate has been downloaded successfully.',
        action: {
          label: 'View All Certificates',
          onClick: () => window.location.href = '/my-certificates'
        }
      });
    }
  }
};

// Notifications API functions
export const notificationAPI = {
  // Get user notifications
  getNotifications: async (params = {}) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  }
};

// Auth API functions
export const authAPI = {
  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await api.put('/profile', profileData);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};

// Upload API functions
export const uploadAPI = {
  // Upload file
  uploadFile: async (file, type = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

// Admin API functions
export const adminAPI = {
  // Get courses pending review
  getPendingCourses: async (params = {}) => {
    const response = await api.get('/admin/courses/pending', { params });
    return response.data;
  },

  // Update course status (approve/reject)
  updateCourseStatus: async (courseId, status, rejectionReason) => {
    const response = await api.put(`/admin/courses/${courseId}/status`, {
      status,
      rejectionReason
    });
    return response.data;
  },

  // Get all courses (admin view)
  getAllCourses: async (params = {}) => {
    const response = await api.get('/admin/courses', { params });
    return response.data;
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // User management
  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Course management
  deleteCourse: async (courseId) => {
    const response = await api.delete(`/admin/courses/${courseId}`);
    return response.data;
  },

  toggleCourseFeatured: async (courseId) => {
    const response = await api.put(`/admin/courses/${courseId}/featured`);
    return response.data;
  },

  // Notifications
  getNotifications: async () => {
    try {
      const response = await api.get('/admin/notifications');
      return response.data;
    } catch (error) {
      console.log('Admin notifications endpoint not available, returning empty array');
      return { notifications: [] };
    }
  },

  sendNotification: async (notificationData) => {
    try {
      const response = await api.post('/admin/notifications', notificationData);
      return response.data;
    } catch (error) {
      console.log('Send notification endpoint not available');
      return { success: false };
    }
  }
};

// Wishlist API functions
export const wishlistAPI = {
  // Add course to wishlist
  addToWishlist: async (courseId) => {
    const response = await api.post(`/wishlist/add/${courseId}`);
    return response.data;
  },

  // Remove course from wishlist
  removeFromWishlist: async (courseId) => {
    const response = await api.delete(`/wishlist/remove/${courseId}`);
    return response.data;
  },

  // Get user's wishlist
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },

  // Check if course is in wishlist
  checkWishlist: async (courseId) => {
    const response = await api.get(`/wishlist/check/${courseId}`);
    return response.data;
  }
};

export default api;
