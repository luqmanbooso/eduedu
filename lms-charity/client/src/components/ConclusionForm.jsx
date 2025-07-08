import React from 'react';
import { CheckCircle, Brain, ArrowRight, FileText, Award, HelpCircle, Plus, Trash2 } from 'lucide-react';

const ConclusionForm = React.memo(({ 
  courseData, 
  onCourseDataChange,
  onArrayChange,
  onAddArrayItem,
  onRemoveArrayItem
}) => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Conclusion & Next Steps</h2>
        <p className="text-gray-600">Define how your course concludes and guide students on their next journey</p>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Course Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            Course Summary
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary of Key Concepts
            </label>
            <textarea
              value={courseData.nextSteps.summary}
              onChange={(e) => onCourseDataChange(prev => ({
                ...prev,
                nextSteps: { ...prev.nextSteps, summary: e.target.value }
              }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Recap the most important takeaways from each lesson..."
            />
          </div>
        </div>

        {/* Further Learning */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="w-5 h-5 text-blue-600 mr-2" />
            Suggestions for Further Learning
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Resources & Study Materials
            </label>
            {courseData.nextSteps.furtherLearning.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => onArrayChange('nextSteps', index, e.target.value, 'furtherLearning')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Advanced React Documentation, Practice Projects..."
                />
                <button
                  onClick={() => onRemoveArrayItem('nextSteps', index, 'furtherLearning')}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={() => onAddArrayItem('nextSteps', 'furtherLearning')}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <Plus size={16} className="mr-1" />
              Add Further Learning Resource
            </button>
          </div>
        </div>

        {/* Next Topics */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <ArrowRight className="w-5 h-5 text-purple-600 mr-2" />
            Next Topics to Study
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recommended Next Courses or Topics
            </label>
            {courseData.nextSteps.nextTopics.map((topic, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => onArrayChange('nextSteps', index, e.target.value, 'nextTopics')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Node.js Backend Development, React Native..."
                />
                <button
                  onClick={() => onRemoveArrayItem('nextSteps', index, 'nextTopics')}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={() => onAddArrayItem('nextSteps', 'nextTopics')}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <Plus size={16} className="mr-1" />
              Add Next Topic
            </button>
          </div>
        </div>

        {/* Prerequisites */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 text-orange-600 mr-2" />
            Prerequisites
          </h3>
          <p className="text-gray-600 mb-4">
            What skills or knowledge should students have before starting this course? 
            This helps set proper expectations and ensures student success.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Prior Knowledge
            </label>
            {courseData.prerequisites.map((prerequisite, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={prerequisite}
                  onChange={(e) => onArrayChange('prerequisites', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Basic HTML/CSS knowledge, JavaScript fundamentals, Familiarity with programming concepts..."
                />
                <button
                  onClick={() => onRemoveArrayItem('prerequisites', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={() => onAddArrayItem('prerequisites')}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <Plus size={16} className="mr-1" />
              Add Prerequisite
            </button>
          </div>
        </div>

        {/* Certification */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="w-5 h-5 text-yellow-600 mr-2" />
            Certification
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="certification-enabled"
                checked={courseData.certification.enabled}
                onChange={(e) => onCourseDataChange(prev => ({
                  ...prev,
                  certification: { ...prev.certification, enabled: e.target.checked }
                }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="certification-enabled" className="text-sm font-medium text-gray-700">
                Offer completion certificate
              </label>
            </div>
            
            {courseData.certification.enabled && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate Title
                  </label>
                  <input
                    type="text"
                    value={courseData.certification.title}
                    onChange={(e) => onCourseDataChange(prev => ({
                      ...prev,
                      certification: { ...prev.certification, title: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Certificate of Completion - React Fundamentals"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificate Description
                  </label>
                  <textarea
                    value={courseData.certification.description}
                    onChange={(e) => onCourseDataChange(prev => ({
                      ...prev,
                      certification: { ...prev.certification, description: e.target.value }
                    }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Description of what this certificate represents..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Support Channels */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <HelpCircle className="w-5 h-5 text-green-600 mr-2" />
            Support Channels
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How learners can get help and ask questions
            </label>
            {courseData.supportChannels.map((channel, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={channel}
                  onChange={(e) => onArrayChange('supportChannels', index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Discord community, Email support, Q&A forum..."
                />
                <button
                  onClick={() => onRemoveArrayItem('supportChannels', index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              onClick={() => onAddArrayItem('supportChannels')}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <Plus size={16} className="mr-1" />
              Add Support Channel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ConclusionForm.displayName = 'ConclusionForm';

export default ConclusionForm;
