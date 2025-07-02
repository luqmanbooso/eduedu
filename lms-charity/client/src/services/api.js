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
    const response = await api.post('/courses', courseData);
    return response.data;
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
  }
};

// Progress API functions
export const progressAPI = {
  // Get user's progress for specific course
  getCourseProgress: async (courseId) => {
    const response = await api.get(`/progress/${courseId}`);
    return response.data;
  },

  // Get all user's progress
  getAllProgress: async () => {
    const response = await api.get('/progress/user/all');
    return response.data;
  },

  // Start course progress
  startCourse: async (courseId) => {
    const response = await api.post(`/progress/start/${courseId}`);
    return response.data;
  },

  // Complete lesson
  completeLesson: async (progressData) => {
    const response = await api.post('/progress/complete-lesson', progressData);
    return response.data;
  },

  // Update progress
  updateProgress: async (courseId, progressData) => {
    const response = await api.put(`/progress/${courseId}`, progressData);
    return response.data;
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

// Certificates API functions
export const certificateAPI = {
  // Get user certificates
  getCertificates: async () => {
    const response = await api.get('/certificates');
    return response.data;
  },

  // Download certificate
  downloadCertificate: async (certificateId) => {
    const response = await api.get(`/certificates/${certificateId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Verify certificate
  verifyCertificate: async (certificateId) => {
    const response = await api.get(`/certificates/${certificateId}/verify`);
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

export default api;
