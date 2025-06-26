import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Eye, Trash2, Settings } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const NotificationCenter = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  // Mock notifications for demo purposes
  useEffect(() => {
    const mockNotifications = [
      {
        _id: '1',
        title: 'New course available',
        message: 'Introduction to Data Science is now available for enrollment',
        type: 'new_course_available',
        isRead: false,
        createdAt: new Date().toISOString(),
        priority: 'high'
      },
      {
        _id: '2',
        title: 'Assignment due soon',
        message: 'Your JavaScript assignment is due in 2 days',
        type: 'course_update',
        isRead: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        priority: 'medium'
      },
      {
        _id: '3',
        title: 'Certificate earned',
        message: 'Congratulations! You earned a certificate for Python Basics',
        type: 'certificate_issued',
        isRead: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        priority: 'low'
      }
    ];
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
  }, []);

  /* Commented out for demo - replace with actual API calls when backend is ready
  const fetchNotifications = async (pageNum = 1, reset = false) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/notifications?page=${pageNum}&limit=20&isRead=${filter === 'unread' ? 'false' : ''}`);
      
      if (reset) {
        setNotifications(response.data.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.data.notifications]);
      }
      
      setUnreadCount(response.data.unreadCount);
      setHasMore(response.data.pagination.current < response.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications(1, true);
    }
  }, [user, filter]);
  */

  const markAsRead = async (notificationId) => {
    // Mock function for demo
    setNotifications(prev =>
      prev.map(notif =>
        notif._id === notificationId
          ? { ...notif, isRead: true, readAt: new Date() }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    /* Uncomment for real implementation
    try {
      await axios.put(`/api/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );
      setUnreadCount(prev => prev - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
    */
  };

  const markAllAsRead = async () => {
    // Mock function for demo
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
    );
    setUnreadCount(0);
    
    /* Uncomment for real implementation
    try {
      await axios.put('/api/notifications/mark-all-read');
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
    */
  };

  const deleteNotification = async (notificationId) => {
    // Mock function for demo
    setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    
    /* Uncomment for real implementation
    try {
      await axios.delete(`/api/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
    */
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, false);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      course_enrollment: '📚',
      new_lesson: '🎯',
      course_completion: '🎉',
      certificate_issued: '🏆',
      comment_reply: '💬',
      course_update: '🔄',
      lesson_completed: '✅',
      quiz_result: '📊',
      new_course_available: '🆕',
      instructor_message: '👨‍🏫',
      system_announcement: '📢'
    };
    return iconMap[type] || '🔔';
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      high: 'border-red-500 bg-red-50',
      medium: 'border-yellow-500 bg-yellow-50',
      low: 'border-blue-500 bg-blue-50'
    };
    return colorMap[priority] || 'border-gray-300 bg-gray-50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="w-80 bg-white rounded-xl shadow-lg border border-gray-200 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
            </h3>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          {/* Filter */}
          <div className="flex space-x-1">
            {['all', 'unread'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => {
                  setFilter(filterType);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  filter === filterType
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filterType === 'all' ? 'All' : 'Unread'}
                {filterType === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>
      </div>

        {/* Notifications List */}
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 && !loading ? (
            <div className="p-8 text-center text-gray-500">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-medium">No notifications yet</p>
              <p className="text-sm mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50/50 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 ml-2"></div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && !loading && notifications.length > 0 && (
            <div className="p-3 text-center border-t border-gray-100">
              <button
                onClick={loadMore}
                className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
              >
                Load more notifications
              </button>
            </div>
          )}

          {loading && (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading...</p>
            </div>
          )}
        </div>
    </motion.div>
  );
};

export default NotificationCenter;
