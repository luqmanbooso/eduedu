import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, Video, Camera, Lightbulb, Brain, CheckCircle, 
  Trophy, Medal, Crown, Download, Share 
} from 'lucide-react';

const LessonCreationModal = ({ 
  isOpen, 
  onClose, 
  moduleIndex, 
  newLesson, 
  setNewLesson, 
  addLessonToModule,
  handleLessonVideoUpload,
  uploadingVideo
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Create New Lesson</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Lesson Info */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
              <Video className="w-5 h-5 mr-2" />
              Lesson Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  value={newLesson.title}
                  onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="e.g., Introduction to JavaScript Variables"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lesson Type
                </label>
                <select
                  value={newLesson.type}
                  onChange={(e) => setNewLesson({...newLesson, type: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="video">Video Lesson</option>
                  <option value="text">Text/Reading</option>
                  <option value="interactive">Interactive Content</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lesson Description *
              </label>
              <textarea
                value={newLesson.description}
                onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Describe what students will learn in this lesson..."
              />
            </div>
          </div>

          {/* Video Upload Requirements */}
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Video Upload Requirements
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Upload Title *
                </label>
                <input
                  type="text"
                  value={newLesson.videoUploadTitle}
                  onChange={(e) => setNewLesson({...newLesson, videoUploadTitle: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="e.g., Creating Your Course Title and Selecting a Category"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will be displayed as the video title for students
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Upload Description *
                </label>
                <textarea
                  value={newLesson.videoUploadDescription}
                  onChange={(e) => setNewLesson({...newLesson, videoUploadDescription: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  placeholder="Provide detailed description of the video content, learning objectives, and what students will accomplish..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Upload
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleLessonVideoUpload(e.target.files[0])}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    {uploadingVideo && (
                      <div className="text-sm text-purple-600">Uploading...</div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Upload a video file (MP4, MOV, AVI supported)
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Video URL
                  </label>
                  <input
                    type="url"
                    value={newLesson.videoUrl}
                    onChange={(e) => setNewLesson({...newLesson, videoUrl: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Duration
                  </label>
                  <input
                    type="text"
                    value={newLesson.videoDuration}
                    onChange={(e) => setNewLesson({...newLesson, videoDuration: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="e.g., 15:30 (mm:ss format)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Thumbnail
                  </label>
                  <input
                    type="url"
                    value={newLesson.videoThumbnail}
                    onChange={(e) => setNewLesson({...newLesson, videoThumbnail: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="Optional thumbnail URL"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content Tips and Notes */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-4 flex items-center">
              <Lightbulb className="w-5 h-5 mr-2" />
              Content Tips & Notes
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Tips for Students
                </label>
                <textarea
                  value={newLesson.notes}
                  onChange={(e) => setNewLesson({...newLesson, notes: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Provide helpful tips, key takeaways, or important notes for students..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Transcript (Optional)
                </label>
                <textarea
                  value={newLesson.transcript}
                  onChange={(e) => setNewLesson({...newLesson, transcript: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Add video transcript for accessibility and better SEO..."
                />
              </div>
            </div>
          </div>

          {/* Quiz and Assignment Options */}
          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-900 mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Assessment Options
            </h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newLesson.quiz.questions.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setNewLesson({
                        ...newLesson,
                        quiz: {
                          ...newLesson.quiz,
                          questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0 }]
                        }
                      });
                    } else {
                      setNewLesson({
                        ...newLesson,
                        quiz: { ...newLesson.quiz, questions: [] }
                      });
                    }
                  }}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Add Quiz to this lesson
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={!!newLesson.assignment.title}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setNewLesson({
                        ...newLesson,
                        assignment: {
                          ...newLesson.assignment,
                          title: 'Assignment for ' + newLesson.title
                        }
                      });
                    } else {
                      setNewLesson({
                        ...newLesson,
                        assignment: { ...newLesson.assignment, title: '' }
                      });
                    }
                  }}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Add Assignment to this lesson
                </label>
              </div>
            </div>
          </div>

          {/* Completion Criteria */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Completion Criteria
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Watch Time (%)
                </label>
                <input
                  type="number"
                  value={newLesson.completionCriteria?.watchTime || 80}
                  onChange={(e) => setNewLesson({
                    ...newLesson,
                    completionCriteria: {
                      ...(newLesson.completionCriteria || {}),
                      watchTime: parseInt(e.target.value) || 80
                    }
                  })}
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
                  placeholder="80"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Percentage of video student must watch to mark as complete
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newLesson.completionCriteria?.requireQuizPass || false}
                  onChange={(e) => setNewLesson({
                    ...newLesson,
                    completionCriteria: {
                      ...(newLesson.completionCriteria || {}),
                      requireQuizPass: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-gray-600 rounded focus:ring-gray-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Require quiz pass for completion
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={newLesson.completionCriteria?.requireAssignmentSubmission || false}
                  onChange={(e) => setNewLesson({
                    ...newLesson,
                    completionCriteria: {
                      ...(newLesson.completionCriteria || {}),
                      requireAssignmentSubmission: e.target.checked
                    }
                  })}
                  className="w-4 h-4 text-gray-600 rounded focus:ring-gray-500"
                />
                <label className="text-sm font-medium text-gray-700">
                  Require assignment submission for completion
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => addLessonToModule(moduleIndex)}
            disabled={!newLesson.title || !newLesson.videoUploadTitle || !newLesson.videoUploadDescription}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Lesson
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LessonCreationModal;
