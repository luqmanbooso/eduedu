// Test component to verify course structure
import React, { useState } from 'react';

const CourseStructureTest = () => {
  // Sample course data that matches CourseLearnEnhanced expectations
  const sampleCourse = {
    _id: 'test-course-id',
    title: 'Test Course Structure',
    description: 'Testing the course structure compatibility',
    instructor: {
      name: 'Test Instructor',
      avatar: ''
    },
    progress: 0,
    modules: [
      {
        _id: 'test-module-1',
        title: 'Module 1: Introduction',
        order: 1,
        lessons: [
          {
            _id: 'test-lesson-1',
            title: 'Welcome Video',
            description: 'Introduction to the course',
            type: 'video',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            videoDuration: 596,
            order: 1,
            isCompleted: false,
            resources: [
              { title: 'Course Outline', url: '#', type: 'pdf' }
            ]
          },
          {
            _id: 'test-lesson-2',
            title: 'Knowledge Check Quiz',
            description: 'Test your understanding',
            type: 'quiz',
            order: 2,
            isCompleted: false,
            quiz: {
              questions: [
                {
                  id: 1,
                  question: 'What is the main purpose of this course?',
                  options: [
                    'To learn web development',
                    'To test structure',
                    'To build apps',
                    'To study theory'
                  ],
                  correctAnswer: 1
                }
              ],
              timeLimit: 300,
              passingScore: 70
            }
          },
          {
            _id: 'test-lesson-3',
            title: 'First Assignment',
            description: 'Apply what you learned',
            type: 'assignment',
            order: 3,
            isCompleted: false,
            assignment: {
              title: 'Setup Development Environment',
              description: 'Install and configure your development tools',
              instructions: [
                'Install Node.js',
                'Setup VS Code',
                'Configure Git'
              ],
              maxScore: 100,
              dueDate: '2024-02-15',
              submissionType: 'both'
            }
          }
        ]
      }
    ]
  };

  const [course, setCourse] = useState(sampleCourse);

  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Course Structure Test</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{course.title}</h2>
        <p className="text-gray-600 mb-6">{course.description}</p>
        
        <div className="space-y-4">
          {course.modules.map((module) => (
            <div key={module._id} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">{module.title}</h3>
              
              <div className="space-y-2">
                {module.lessons.map((lesson) => (
                  <div key={lesson._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        lesson.type === 'video' ? 'bg-blue-100 text-blue-600' :
                        lesson.type === 'quiz' ? 'bg-purple-100 text-purple-600' :
                        lesson.type === 'assignment' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {lesson.type === 'video' ? '📹' :
                         lesson.type === 'quiz' ? '🧠' :
                         lesson.type === 'assignment' ? '📝' : '📄'}
                      </div>
                      <div>
                        <h4 className="font-medium">{lesson.title}</h4>
                        <p className="text-sm text-gray-600">{lesson.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                            {lesson.type}
                          </span>
                          {lesson.type === 'video' && lesson.videoDuration && (
                            <span className="text-xs text-gray-500">
                              {formatTime(lesson.videoDuration)}
                            </span>
                          )}
                          {lesson.quiz && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              Quiz ({lesson.quiz.questions.length} Q)
                            </span>
                          )}
                          {lesson.assignment && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Assignment
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Order: {lesson.order}</div>
                      <div className="text-sm">
                        {lesson.isCompleted ? '✅ Complete' : '⏳ Pending'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Structure Validation</h3>
        <pre className="text-sm bg-white p-3 rounded border overflow-x-auto">
          {JSON.stringify(course, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default CourseStructureTest;
