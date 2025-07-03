import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, Reply, MoreVertical, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../services/api';

const CommentSection = ({ courseId, lessonId = null }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const { user } = useAuth();

  const fetchComments = async () => {
    try {
      setLoading(true);
      const endpoint = lessonId 
        ? `/comments/${courseId}/${lessonId}`
        : `/comments/${courseId}`;
      
      console.log('Fetching comments from:', endpoint);
      const response = await api.get(`${endpoint}?sortBy=${sortBy}&limit=50`);
      console.log('Comments response:', response.data);
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchComments();
    }
  }, [courseId, lessonId, sortBy]);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      setSubmitting(true);
      const response = await api.post('/comments', {
        content: newComment,
        course: courseId,
        lesson: lessonId
      });

      // Refresh comments list to ensure proper population
      await fetchComments();
      setNewComment('');
      toast.success('Comment posted successfully!');
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const submitReply = async (parentId) => {
    if (!replyContent.trim() || !user) return;

    try {
      setSubmitting(true);
      const response = await api.post('/comments', {
        content: replyContent,
        course: courseId,
        lesson: lessonId,
        parentComment: parentId
      });

      // Refresh comments list to ensure proper population
      await fetchComments();
      setReplyTo(null);
      setReplyContent('');
      toast.success('Reply posted successfully!');
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const updateComment = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const response = await api.put(`/comments/${commentId}`, {
        content: editContent
      });

      setComments(prev =>
        prev.map(comment =>
          comment._id === commentId ? response.data : comment
        )
      );

      setEditingComment(null);
      setEditContent('');
      toast.success('Comment updated successfully!');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.delete(`/comments/${commentId}`);
      setComments(prev => prev.filter(comment => comment._id !== commentId));
      toast.success('Comment deleted successfully!');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const toggleLike = async (commentId) => {
    if (!user) return;

    try {
      const response = await api.post(`/comments/${commentId}/like`);
      
      setComments(prev =>
        prev.map(comment =>
          comment._id === commentId
            ? { 
                ...comment, 
                likes: response.data.liked 
                  ? [...(comment.likes || []), { user: user._id }]
                  : comment.likes.filter(like => like.user !== user._id),
                likeCount: response.data.likeCount
              }
            : comment
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to like comment');
    }
  };

  const toggleReplies = (commentId) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  const isLiked = (comment) => {
    return comment.likes?.some(like => like.user === user?._id);
  };

  const CommentItem = ({ comment, isReply = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isReply ? 'ml-12 border-l-2 border-gray-200 pl-4' : ''} py-4`}
    >
      <div className="flex space-x-3">
        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-serif font-bold">
          {comment.author?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        
        <div className="flex-1">
          <div className="bg-gray-50 p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-serif font-semibold text-black">
                {comment.author?.name || 'Anonymous'}
              </h4>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 font-serif">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
                {(comment.author?._id === user?._id || user?.role === 'admin') && (
                  <div className="relative group">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={16} />
                    </button>
                    <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                      <button
                        onClick={() => {
                          setEditingComment(comment._id);
                          setEditContent(comment.content);
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 font-serif"
                      >
                        <Edit size={14} className="mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteComment(comment._id)}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 font-serif"
                      >
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {editingComment === comment._id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 resize-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 font-serif"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateComment(comment._id)}
                    className="px-3 py-1 bg-purple-600 text-white text-sm hover:bg-purple-700 font-serif font-semibold transition-all"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent('');
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm hover:bg-gray-400 font-serif font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 font-serif">
                {comment.content}
              </p>
            )}
          </div>
          
          {/* Comment Actions */}
          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={() => toggleLike(comment._id)}
              className={`flex items-center space-x-1 text-sm font-serif transition-colors ${
                isLiked(comment)
                  ? 'text-red-500'
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart size={16} fill={isLiked(comment) ? 'currentColor' : 'none'} />
              <span>{comment.likeCount || comment.likes?.length || 0}</span>
            </button>
            
            {!isReply && (
              <button
                onClick={() => setReplyTo(comment._id)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-purple-600 font-serif transition-colors"
              >
                <Reply size={16} />
                <span>Reply</span>
              </button>
            )}
            
            {!isReply && comment.replies?.length > 0 && (
              <button
                onClick={() => toggleReplies(comment._id)}
                className="flex items-center space-x-1 text-sm text-gray-500 hover:text-purple-600 font-serif transition-colors"
              >
                {expandedReplies.has(comment._id) ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
                <span>{comment.replies.length} replies</span>
              </button>
            )}
          </div>
          
          {/* Reply Form */}
          {replyTo === comment._id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-serif font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-2 border border-gray-300 resize-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 font-serif"
                    rows={2}
                  />
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => submitReply(comment._id)}
                      disabled={submitting || !replyContent.trim()}
                      className="px-3 py-1 bg-purple-600 text-white text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-serif font-semibold transition-all"
                    >
                      {submitting ? 'Replying...' : 'Reply'}
                    </button>
                    <button
                      onClick={() => {
                        setReplyTo(null);
                        setReplyContent('');
                      }}
                      className="px-3 py-1 bg-gray-300 text-gray-700 text-sm hover:bg-gray-400 font-serif font-semibold transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Replies */}
          {!isReply && expandedReplies.has(comment._id) && comment.replies?.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 space-y-4"
            >
              {comment.replies.map((reply) => (
                <CommentItem key={reply._id} comment={reply} isReply={true} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (!user) {
    return (
      <div className="bg-white border border-gray-200 p-6 text-center">
        <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 font-serif">
          Please log in to view and post comments
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-serif font-bold text-black">
          Comments ({comments.length})
        </h3>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-1 border border-gray-300 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 font-serif"
        >
          <option value="createdAt">Newest First</option>
          <option value="likes">Most Liked</option>
        </select>
      </div>
      
      {/* New Comment Form */}
      <form onSubmit={submitComment} className="mb-6">
        <div className="flex space-x-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-serif font-bold">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-3 border border-gray-300 resize-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 font-serif"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-serif font-semibold transition-all"
              >
                {submitting ? 'Posting...' : 'Post Comment'}
              </motion.button>
            </div>
          </div>
        </div>
      </form>
      
      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 w-1/4 mb-2"></div>
                  <div className="h-16 bg-gray-300"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 font-serif">
            No comments yet. Be the first to comment!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
