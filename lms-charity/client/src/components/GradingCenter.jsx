import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  User, 
  Clock, 
  Download, 
  Eye, 
  Edit3, 
  Send, 
  CheckCircle, 
  XCircle,
  Star,
  MessageSquare,
  Calendar,
  Filter,
  Search,
  MoreVertical,
  X,
  Upload,
  Save,
  RotateCcw
} from 'lucide-react';
import axios from 'axios';

const GradingCenter = ({ courseId, isOpen, onClose }) => {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [gradingMode, setGradingMode] = useState(false);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchAssignments();
    }
  }, [isOpen, courseId]);

  useEffect(() => {
    if (selectedAssignment) {
      fetchSubmissions(selectedAssignment._id);
    }
  }, [selectedAssignment]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/courses/${courseId}/assignments`);
      setAssignments(response.data.assignments || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    if (!assignmentId) return;
    try {
      const response = await axios.get(`/assignments/${assignmentId}/submissions`);
      console.log('Fetched submissions:', response.data.submissions);
      setSubmissions(response.data.submissions || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const status = getStatusText(submission).toLowerCase();
    const studentName = submission.student?.name?.toLowerCase() || '';

    if (filterStatus !== 'all' && status !== filterStatus) {
      return false;
    }
    if (searchTerm && !studentName.includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getStatusColor = (submission) => {
    if (submission.grade !== undefined) return 'text-green-600 bg-green-100';
    if (new Date(submission.submittedAt) > new Date(selectedAssignment?.dueDate)) return 'text-red-600 bg-red-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getStatusText = (submission) => {
    if (submission.grade !== undefined) return 'Graded';
    if (new Date(submission.submittedAt) > new Date(selectedAssignment?.dueDate)) return 'Late';
    return 'Pending';
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
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Grading Center</h2>
                  <p className="text-green-100 text-sm">Manage assignments and grade submissions</p>
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
            {/* Assignments List */}
            <div className="w-1/4 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Assignments</h3>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search assignments..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {assignments.map((assignment, index) => (
                      <motion.div
                        key={assignment._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedAssignment(assignment)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedAssignment?._id === assignment._id ? 'bg-green-50 border-r-2 border-green-500' : ''
                        }`}
                      >
                        <h4 className="font-medium text-gray-900 mb-1">{assignment.title}</h4>
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {assignment.submissions?.length || 0} submissions
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Max: {assignment.maxScore}pts</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              assignment.submissions?.every(s => s.grade !== undefined) 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {assignment.submissions?.every(s => s.grade !== undefined) ? 'Complete' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {assignments.length === 0 && (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No assignments found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submissions List */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {selectedAssignment ? (
                <>
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-2">{selectedAssignment.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{selectedAssignment.description}</p>
                    
                    {/* Filters */}
                    <div className="flex space-x-2 mb-3">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      >
                        <option value="all">All Submissions</option>
                        <option value="graded">Graded</option>
                        <option value="ungraded">Ungraded</option>
                        <option value="late">Late</option>
                      </select>
                    </div>
                    
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search students..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <div className="divide-y divide-gray-200">
                      {filteredSubmissions.map((submission, index) => (
                        <motion.div
                          key={submission._id ? submission._id : `submission-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedSubmission(submission)}
                          className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedSubmission?._id === submission._id ? 'bg-green-50 border-r-2 border-green-500' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {submission.student?.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{submission.student?.name}</h4>
                                <p className="text-xs text-gray-500">{submission.student?.email}</p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(submission)}`}>
                              {getStatusText(submission)}
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                            </p>
                            {submission.grade !== undefined && (
                              <p className="text-xs text-green-600 font-medium">
                                Grade: {submission.grade}/{selectedAssignment.maxScore}
                              </p>
                            )}
                            {submission.files?.length > 0 && (
                              <p className="text-xs text-gray-500 flex items-center">
                                <FileText className="w-3 h-3 mr-1" />
                                {submission.files.length} file(s)
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}

                      {filteredSubmissions.length === 0 && (
                        <div className="text-center py-12">
                          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">No submissions found</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Assignment</h3>
                    <p className="text-gray-500">Choose an assignment to view submissions</p>
                  </div>
                </div>
              )}
            </div>

            {/* Grading Panel */}
            <div className="flex-1 flex flex-col">
              {selectedSubmission ? (
                <GradingPanel
                  submission={selectedSubmission}
                  assignment={selectedAssignment}
                  onGradeUpdate={fetchSubmissions}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Edit3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Submission</h3>
                    <p className="text-gray-500">Choose a submission to start grading</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Grading Panel Component
const GradingPanel = ({ submission, assignment, onGradeUpdate }) => {
  const [grade, setGrade] = useState(submission.grade || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setGrade(submission.grade || '');
    setFeedback(submission.feedback || '');
    setError('');
    setSuccess('');
  }, [submission]);

  const handleSaveGrade = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.put(`/submissions/${submission._id}/grade`, {
        grade: parseFloat(grade),
        feedback: feedback.trim()
      });
      
      setSuccess('Grade saved successfully!');
      onGradeUpdate(assignment._id);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving grade:', error);
      setError(error.response?.data?.message || 'Failed to save grade');
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentage = () => {
    if (!grade || !assignment.maxScore) return 0;
    return Math.round((parseFloat(grade) / assignment.maxScore) * 100);
  };

  const getGradeColor = () => {
    const percentage = calculatePercentage();
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-medium">
              {submission.student?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{submission.student?.name}</h3>
              <p className="text-sm text-gray-600">{submission.student?.email}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Submitted</p>
            <p className="text-sm font-medium text-gray-900">
              {new Date(submission.submittedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Assignment Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">{assignment.title}</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Max Score:</span>
              <span className="ml-2 font-medium">{assignment.maxScore} pts</span>
            </div>
            <div>
              <span className="text-gray-500">Due Date:</span>
              <span className="ml-2 font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span className={`ml-2 font-medium ${
                new Date(submission.submittedAt) > new Date(assignment.dueDate) ? 'text-red-600' : 'text-green-600'
              }`}>
                {new Date(submission.submittedAt) > new Date(assignment.dueDate) ? 'Late' : 'On Time'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Submission Content */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Submission</h4>
          {submission.content && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-700">{submission.content}</p>
            </div>
          )}
          
          {/* Files */}
          {submission.files && submission.files.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700">Attached Files:</h5>
              {submission.files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Grading Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-medium text-gray-900 mb-4">Grading</h4>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  max={assignment.maxScore}
                  min="0"
                  step="0.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
                <span className="absolute right-3 top-2 text-sm text-gray-500">
                  /{assignment.maxScore}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percentage
              </label>
              <div className={`px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 ${getGradeColor()} font-medium`}>
                {calculatePercentage()}%
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Letter Grade
              </label>
              <div className={`px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 ${getGradeColor()} font-medium`}>
                {calculatePercentage() >= 90 ? 'A' :
                 calculatePercentage() >= 80 ? 'B' :
                 calculatePercentage() >= 70 ? 'C' :
                 calculatePercentage() >= 60 ? 'D' : 'F'}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              placeholder="Provide detailed feedback for the student..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setGrade(submission.grade || '');
                setFeedback(submission.feedback || '');
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </button>
            <button
              onClick={handleSaveGrade}
              disabled={loading || !grade}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Grade
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GradingCenter;
