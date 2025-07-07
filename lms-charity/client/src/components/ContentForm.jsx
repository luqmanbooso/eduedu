import React from 'react';
import { BookOpen, Plus, Trash2, Video, Brain, FileQuestion, FileText } from 'lucide-react';

const ContentForm = React.memo(({ 
  courseData,
  onShowModuleModal,
  onShowLessonModal,
  onRemoveModule,
  onRemoveLesson,
  onSetCurrentModuleIndex
}) => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your course content</h2>
        <p className="text-gray-600">Organize your content into modules and lessons</p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Course Modules</h3>
          <button
            onClick={() => onShowModuleModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Module</span>
          </button>
        </div>
        
        {courseData.modules.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first module</p>
            <button
              onClick={() => onShowModuleModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add First Module
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {courseData.modules.map((module, moduleIndex) => (
              <div key={module._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{module.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    <p className="text-xs text-gray-500 mt-2">{module.lessons.length} lessons</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        onSetCurrentModuleIndex(moduleIndex);
                        onShowLessonModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRemoveModule(module._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {module.lessons.length > 0 && (
                  <div className="p-4 space-y-2">
                    {module.lessons.map((lesson) => (
                      <div key={lesson._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${
                            lesson.type === 'video' ? 'bg-blue-100 text-blue-600' :
                            lesson.type === 'quiz' ? 'bg-purple-100 text-purple-600' :
                            lesson.type === 'assignment' ? 'bg-green-100 text-green-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {lesson.type === 'video' ? <Video className="w-4 h-4" /> :
                             lesson.type === 'quiz' ? <Brain className="w-4 h-4" /> :
                             lesson.type === 'assignment' ? <FileQuestion className="w-4 h-4" /> :
                             <FileText className="w-4 h-4" />}
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">{lesson.title}</h5>
                            <p className="text-sm text-gray-600">{lesson.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => onRemoveLesson(moduleIndex, lesson._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

ContentForm.displayName = 'ContentForm';

export default ContentForm;
