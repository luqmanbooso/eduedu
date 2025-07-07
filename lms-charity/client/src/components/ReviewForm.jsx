import React from 'react';
import { CheckCircle, Clock, Users, BookOpen, Camera, Target, Award, Rocket } from 'lucide-react';

const ReviewForm = React.memo(({ 
  courseData, 
  onSubmit, 
  loading 
}) => {
  const totalLessons = courseData.modules.reduce((total, module) => total + module.lessons.length, 0);
  const estimatedDuration = courseData.modules.reduce((total, module) => 
    total + module.lessons.reduce((moduleTotal, lesson) => moduleTotal + (lesson.estimatedDuration || 0), 0), 0);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Publish</h2>
        <p className="text-gray-600">Review your course details before publishing</p>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Course Overview */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 text-blue-600 mr-2" />
            Course Overview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">{courseData.title}</h4>
              <p className="text-gray-600 text-sm mb-4">{courseData.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium mr-2">Category:</span>
                  <span>{courseData.category}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium mr-2">Level:</span>
                  <span>{courseData.level}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium mr-2">Price:</span>
                  <span>${courseData.price || '0'}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{courseData.modules.length}</div>
                    <div className="text-sm text-gray-600">Modules</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{totalLessons}</div>
                    <div className="text-sm text-gray-600">Lessons</div>
                  </div>
                </div>
              </div>
              
              {courseData.thumbnail && (
                <div>
                  <img 
                    src={courseData.thumbnail} 
                    alt="Course thumbnail" 
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Learning Outcomes */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 text-green-600 mr-2" />
            Learning Outcomes
          </h3>
          <ul className="space-y-2">
            {courseData.learningOutcomes.filter(outcome => outcome.trim()).map((outcome, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{outcome}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Course Structure */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <BookOpen className="w-5 h-5 text-purple-600 mr-2" />
            Course Structure
          </h3>
          
          <div className="space-y-4">
            {courseData.modules.map((module, index) => (
              <div key={module._id} className="border border-gray-100 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Module {index + 1}: {module.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">{module.description}</p>
                
                {module.lessons.length > 0 && (
                  <div className="space-y-2">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div key={lesson._id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {lessonIndex + 1}.
                          </span>
                          <span className="text-sm text-gray-700">{lesson.title}</span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {lesson.type}
                          </span>
                        </div>
                        {lesson.estimatedDuration && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {lesson.estimatedDuration} min
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Publish Button */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="font-semibold text-gray-900 mb-2">Ready to Publish?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Once published, students will be able to enroll in your course. You can always make updates later.
            </p>
            
            <button
              onClick={onSubmit}
              disabled={loading}
              className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                loading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  <span>Publish Course</span>
                </>
              )}
            </button>
            
            <p className="text-xs text-gray-500 mt-3">
              Your course will be submitted for review and published once approved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

ReviewForm.displayName = 'ReviewForm';

export default ReviewForm;
