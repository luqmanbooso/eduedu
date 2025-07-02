import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  Users, 
  Plus, 
  Search, 
  Filter,
  ThumbsUp,
  MessageCircle,
  Pin,
  MoreVertical,
  Send,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Star
} from 'lucide-react';
import axios from 'axios';

const DiscussionForum = ({ courseId, isOpen, onClose }) => {
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (isOpen && courseId) {
      fetchDiscussions();
    }
  }, [isOpen, courseId]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/courses/${courseId}/discussions`);
      setDiscussions(response.data.discussions || []);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Discussions', color: 'text-gray-600' },
    { id: 'general', label: 'General', color: 'text-blue-600' },
    { id: 'question', label: 'Q&A', color: 'text-green-600' },
    { id: 'announcement', label: 'Announcements', color: 'text-purple-600' },
    { id: 'assignment-help', label: 'Assignment Help', color: 'text-orange-600' }
  ];

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || discussion.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryInfo = (category) => {
    return categories.find(cat => cat.id === category) || categories[0];
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(`/api/courses/${courseId}/discussions/${selectedDiscussion._id}/replies`, {
        content: newMessage
      });
      
      // Update the selected discussion with new reply
      setSelectedDiscussion({
        ...selectedDiscussion,
        replies: [...(selectedDiscussion.replies || []), response.data.reply]
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl rounded-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Discussion Forum</h2>
                  <p className="text-blue-100 text-sm">Engage with your students</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex h-[calc(95vh-88px)]">
            {/* Discussions List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Search and Filters */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex space-x-2 mb-3">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search discussions..."
                    />
                  </div>
                  <button
                    onClick={() => setShowNewDiscussion(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setFilterCategory(category.id)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        filterCategory === category.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discussions List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredDiscussions.map((discussion, index) => (
                      <motion.div
                        key={discussion._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedDiscussion(discussion)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedDiscussion?._id === discussion._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-medium ${getCategoryInfo(discussion.category).color}`}>
                              {getCategoryInfo(discussion.category).label}
                            </span>
                            {discussion.isPinned && <Pin className="w-3 h-3 text-orange-500" />}
                            {discussion.isResolved && <CheckCircle className="w-3 h-3 text-green-500" />}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(discussion.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{discussion.title}</h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{discussion.content}</p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {discussion.author?.name}
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              {discussion.replies?.length || 0}
                            </span>
                            <span className="flex items-center">
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              {discussion.likes?.length || 0}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {filteredDiscussions.length === 0 && (
                      <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No discussions found</p>
                        <button
                          onClick={() => setShowNewDiscussion(true)}
                          className="mt-3 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Start the first discussion
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Discussion Detail */}
            <div className="flex-1 flex flex-col">
              {selectedDiscussion ? (
                <>
                  {/* Discussion Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          getCategoryInfo(selectedDiscussion.category).id === 'general' ? 'bg-blue-100 text-blue-700' :
                          getCategoryInfo(selectedDiscussion.category).id === 'question' ? 'bg-green-100 text-green-700' :
                          getCategoryInfo(selectedDiscussion.category).id === 'announcement' ? 'bg-purple-100 text-purple-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {getCategoryInfo(selectedDiscussion.category).label}
                        </span>
                        {selectedDiscussion.isPinned && <Pin className="w-4 h-4 text-orange-500" />}
                        {selectedDiscussion.isResolved && <CheckCircle className="w-4 h-4 text-green-500" />}
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-3">{selectedDiscussion.title}</h2>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {selectedDiscussion.author?.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{selectedDiscussion.author?.name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(selectedDiscussion.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {selectedDiscussion.replies?.length || 0} replies
                        </span>
                        <span className="flex items-center">
                          <ThumbsUp className="w-4 h-4 mr-1" />
                          {selectedDiscussion.likes?.length || 0} likes
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Discussion Content */}
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="prose max-w-none mb-6">
                      <p className="text-gray-700">{selectedDiscussion.content}</p>
                    </div>

                    {/* Replies */}
                    <div className="space-y-4">
                      {selectedDiscussion.replies?.map((reply, index) => (
                        <motion.div
                          key={reply._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-gray-50 rounded-lg p-4"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {reply.author?.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-medium text-gray-900">{reply.author?.name}</p>
                                  {reply.author?.role === 'instructor' && (
                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                      Instructor
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">
                                  {new Date(reply.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <p className="text-gray-700">{reply.content}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Reply Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-3">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={3}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Write a reply..."
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a discussion</h3>
                    <p className="text-gray-500">Choose a discussion from the list to view details and participate</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* New Discussion Modal */}
      <NewDiscussionModal
        isOpen={showNewDiscussion}
        onClose={() => setShowNewDiscussion(false)}
        courseId={courseId}
        onSuccess={fetchDiscussions}
      />
    </AnimatePresence>
  );
};

// New Discussion Modal Component
const NewDiscussionModal = ({ isOpen, onClose, courseId, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    isPinned: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`/api/courses/${courseId}/discussions`, formData);
      onSuccess();
      onClose();
      setFormData({ title: '', content: '', category: 'general', isPinned: false });
    } catch (error) {
      console.error('Error creating discussion:', error);
      setError(error.response?.data?.message || 'Failed to create discussion');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl rounded-2xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Start New Discussion</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discussion Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter discussion title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General Discussion</option>
                  <option value="question">Q&A</option>
                  <option value="announcement">Announcement</option>
                  <option value="assignment-help">Assignment Help</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Write your discussion content..."
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pinned"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="pinned" className="ml-2 text-sm text-gray-700">
                  Pin this discussion to the top
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    'Create Discussion'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DiscussionForum;
