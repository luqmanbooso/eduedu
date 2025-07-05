import React from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Medal, Crown, CheckCircle, Clock, Star, Target } from 'lucide-react';

const CompletionRequirementsModal = ({ 
  isOpen, 
  onClose, 
  courseData, 
  handleNestedInputChange 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Course Completion Requirements</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2" />
              Completion Criteria
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Watch All Videos</label>
                  <p className="text-xs text-gray-500">Students must watch all lesson videos</p>
                </div>
                <input
                  type="checkbox"
                  checked={courseData.settings.completionRequirements.watchAllVideos}
                  onChange={(e) => handleNestedInputChange('settings', 'completionRequirements', {
                    ...courseData.settings.completionRequirements,
                    watchAllVideos: e.target.checked
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Complete All Quizzes</label>
                  <p className="text-xs text-gray-500">Students must complete all section quizzes</p>
                </div>
                <input
                  type="checkbox"
                  checked={courseData.settings.completionRequirements.completeAllQuizzes}
                  onChange={(e) => handleNestedInputChange('settings', 'completionRequirements', {
                    ...courseData.settings.completionRequirements,
                    completeAllQuizzes: e.target.checked
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Submit All Assignments</label>
                  <p className="text-xs text-gray-500">Students must submit all required assignments</p>
                </div>
                <input
                  type="checkbox"
                  checked={courseData.settings.completionRequirements.submitAllAssignments}
                  onChange={(e) => handleNestedInputChange('settings', 'completionRequirements', {
                    ...courseData.settings.completionRequirements,
                    submitAllAssignments: e.target.checked
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Participate in Discussions</label>
                  <p className="text-xs text-gray-500">Students must participate in course discussions</p>
                </div>
                <input
                  type="checkbox"
                  checked={courseData.settings.completionRequirements.participateInDiscussions}
                  onChange={(e) => handleNestedInputChange('settings', 'completionRequirements', {
                    ...courseData.settings.completionRequirements,
                    participateInDiscussions: e.target.checked
                  })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-4 flex items-center">
              <Medal className="w-5 h-5 mr-2" />
              Minimum Scores
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Quiz Score (%)
                </label>
                <input
                  type="number"
                  value={courseData.settings.completionRequirements.minimumQuizScore}
                  onChange={(e) => handleNestedInputChange('settings', 'completionRequirements', {
                    ...courseData.settings.completionRequirements,
                    minimumQuizScore: parseInt(e.target.value) || 70
                  })}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Assignment Score (%)
                </label>
                <input
                  type="number"
                  value={courseData.settings.completionRequirements.minimumAssignmentScore}
                  onChange={(e) => handleNestedInputChange('settings', 'completionRequirements', {
                    ...courseData.settings.completionRequirements,
                    minimumAssignmentScore: parseInt(e.target.value) || 70
                  })}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Time-Based Requirements
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Enable Time-Based Completion</label>
                  <p className="text-xs text-gray-500">Students must spend minimum time in course</p>
                </div>
                <input
                  type="checkbox"
                  checked={courseData.settings.completionRequirements.timeBasedCompletion}
                  onChange={(e) => handleNestedInputChange('settings', 'completionRequirements', {
                    ...courseData.settings.completionRequirements,
                    timeBasedCompletion: e.target.checked
                  })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
              </div>
              {courseData.settings.completionRequirements.timeBasedCompletion && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Time Spent (minutes)
                  </label>
                  <input
                    type="number"
                    value={courseData.settings.completionRequirements.minimumTimeSpent}
                    onChange={(e) => handleNestedInputChange('settings', 'completionRequirements', {
                      ...courseData.settings.completionRequirements,
                      minimumTimeSpent: parseInt(e.target.value) || 0
                    })}
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                    placeholder="120"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-orange-900 mb-4 flex items-center">
              <Crown className="w-5 h-5 mr-2" />
              Certificate Settings
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificate Requirements Score (%)
                </label>
                <input
                  type="number"
                  value={courseData.certificate.requirements.minimumScore}
                  onChange={(e) => handleNestedInputChange('certificate', 'requirements', {
                    ...courseData.certificate.requirements,
                    minimumScore: parseInt(e.target.value) || 70
                  })}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum overall score required to earn certificate
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Completion Percentage (%)
                </label>
                <input
                  type="number"
                  value={courseData.certificate.requirements.completionPercentage}
                  onChange={(e) => handleNestedInputChange('certificate', 'requirements', {
                    ...courseData.certificate.requirements,
                    completionPercentage: parseInt(e.target.value) || 100
                  })}
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Percentage of course content that must be completed
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Save Requirements
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CompletionRequirementsModal;
