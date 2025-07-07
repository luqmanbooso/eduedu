import React from 'react';
import { Target, CheckCircle, Users, Plus, Trash2 } from 'lucide-react';

const LearningGoalsForm = React.memo(({ 
  courseData, 
  onArrayChange,
  onAddArrayItem,
  onRemoveArrayItem
}) => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What will students achieve?</h2>
        <p className="text-gray-600">Define clear, measurable learning outcomes for your course</p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 text-green-600 mr-2" />
            Learning Outcomes
          </h3>
          <p className="text-gray-600 mb-6">What specific skills or knowledge will students gain?</p>
          
          <div className="space-y-4">
            {courseData.learningOutcomes.map((outcome, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mt-1">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <textarea
                    value={outcome}
                    onChange={(e) => onArrayChange('learningOutcomes', index, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="e.g., Build responsive web applications using React and modern JavaScript"
                    rows={2}
                  />
                </div>
                {courseData.learningOutcomes.length > 1 && (
                  <button
                    onClick={() => onRemoveArrayItem('learningOutcomes', index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <button
            onClick={() => onAddArrayItem('learningOutcomes')}
            className="mt-4 flex items-center space-x-2 text-blue-600 hover:text-blue-700 px-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Learning Outcome</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Requirements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              Prerequisites
            </h3>
            <p className="text-gray-600 mb-4">What should students know beforehand?</p>
            
            <div className="space-y-3">
              {courseData.requirements.map((requirement, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => onArrayChange('requirements', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Basic HTML/CSS knowledge"
                  />
                  {courseData.requirements.length > 1 && (
                    <button
                      onClick={() => onRemoveArrayItem('requirements', index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <button
              onClick={() => onAddArrayItem('requirements')}
              className="mt-3 flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Prerequisite</span>
            </button>
          </div>
          
          {/* Target Audience */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 text-purple-600 mr-2" />
              Target Audience
            </h3>
            <p className="text-gray-600 mb-4">Who is this course designed for?</p>
            
            <div className="space-y-3">
              {courseData.targetAudience.map((audience, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={audience}
                    onChange={(e) => onArrayChange('targetAudience', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Beginner developers"
                  />
                  {courseData.targetAudience.length > 1 && (
                    <button
                      onClick={() => onRemoveArrayItem('targetAudience', index)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <button
              onClick={() => onAddArrayItem('targetAudience')}
              className="mt-3 flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Target Audience</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

LearningGoalsForm.displayName = 'LearningGoalsForm';

export default LearningGoalsForm;
