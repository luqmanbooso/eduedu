import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, isRead, type } = req.query;
    const skip = (page - 1) * limit;
    
    const query = { recipient: req.user._id };
    
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }
    
    if (type) {
      query.type = type;
    }
    
    const notifications = await Notification.find(query)
      .populate('sender', 'name avatar')
      .populate('relatedCourse', 'title thumbnail')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(req.user._id);
    
    res.json({
      notifications,
      unreadCount,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.markAsRead(req.params.id, req.user._id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error marking notification as read' });
  }
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private
router.put('/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { 
        isRead: true, 
        readAt: new Date() 
      }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error marking all notifications as read' });
  }
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
});

// @desc    Delete all notifications
// @route   DELETE /api/notifications/delete-all
// @access  Private
router.delete('/delete-all', protect, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.json({ message: 'All notifications deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting all notifications' });
  }
});

// @desc    Get notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
router.get('/preferences', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');
    res.json(user.preferences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching notification preferences' });
  }
});

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const { emailNotifications, pushNotifications, courseRecommendations } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        'preferences.emailNotifications': emailNotifications,
        'preferences.pushNotifications': pushNotifications,
        'preferences.courseRecommendations': courseRecommendations
      },
      { new: true }
    ).select('preferences');
    
    res.json(user.preferences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating notification preferences' });
  }
});

// @desc    Create system notification (Admin only)
// @route   POST /api/notifications/system
// @access  Private (Admin)
router.post('/system', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    const { title, message, recipients, type = 'system_announcement', priority = 'medium' } = req.body;
    
    if (!title || !message || !recipients) {
      return res.status(400).json({ message: 'Title, message, and recipients are required' });
    }
    
    const notifications = recipients.map(recipientId => ({
      recipient: recipientId,
      type,
      title,
      message,
      priority
    }));
    
    await Notification.insertMany(notifications);
    
    res.status(201).json({
      message: `System notification sent to ${recipients.length} users`,
      count: recipients.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating system notification' });
  }
});

export default router;
