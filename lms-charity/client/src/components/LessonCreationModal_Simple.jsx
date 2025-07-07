import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Video, Brain, FileText, BookOpen, Clock, Award, Plus
} from 'lucide-react';

const LessonCreationModal = ({ 
  isOpen, 
  onClose, 
  moduleIndex, 
  newLesson, 
  setNewLesson, 
  addLessonToModule
}) => {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newLesson.title.trim() && newLesson.description.trim()) {
      addLessonToModule(moduleIndex);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Create New Lesson</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Title *
            </label>
            <input
              type="text"
              value={newLesson.title}
              onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter lesson title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Description *
            </label>
            <textarea
              value={newLesson.description}
              onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Describe what students will learn"
              required
            />
          </div>

          {/* Lesson Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Type
            </label>
            <select
              value={newLesson.type}
              onChange={(e) => {
                const type = e.target.value;
                setNewLesson({
                  ...newLesson, 
                  type: type,
                  // Reset type-specific fields
                  videoUrl: type === 'video' ? (newLesson.videoUrl || '') : '',
                  videoDuration: type === 'video' ? (newLesson.videoDuration || 0) : 0,
                  content: type === 'text' ? (newLesson.content || '') : '',
                  resources: newLesson.resources || [],
                  quiz: type === 'quiz' ? {
                    questions: [],
                    timeLimit: 300,
                    passingScore: 70
                  } : undefined,
                  assignment: type === 'assignment' ? {
                    title: newLesson.title || '',
                    description: newLesson.description || '',
                    instructions: [],
                    maxScore: 100,
                    dueDate: '',
                    submissionType: 'both'
                  } : undefined
                });
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="video">Video Lesson</option>
              <option value="text">Text/Reading</option>
              <option value="quiz">Quiz</option>
              <option value="assignment">Assignment</option>
            </select>
          </div>

          {/* Video-specific fields */}
          {newLesson.type === 'video' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video URL
                </label>
                <input
                  type="url"
                  value={newLesson.videoUrl}
                  onChange={(e) => setNewLesson({...newLesson, videoUrl: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="https://example.com/video.mp4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Duration (mm:ss or seconds)
                </label>
                <input
                  type="text"
                  value={newLesson.videoDuration}
                  onChange={(e) => setNewLesson({...newLesson, videoDuration: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="5:30 or 330"
                />
              </div>
            </div>
          )}

          {/* Text-specific fields */}
          {newLesson.type === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={newLesson.content}
                onChange={(e) => setNewLesson({...newLesson, content: e.target.value})}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter lesson content..."
              />
            </div>
          )}

          {/* Quiz-specific fields */}
          {newLesson.type === 'quiz' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    value={Math.floor((newLesson.quiz?.timeLimit || 300) / 60)}
                    onChange={(e) => setNewLesson({
                      ...newLesson,
                      quiz: {
                        ...newLesson.quiz,
                        timeLimit: parseInt(e.target.value) * 60
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    value={newLesson.quiz?.passingScore || 70}
                    onChange={(e) => setNewLesson({
                      ...newLesson,
                      quiz: {
                        ...newLesson.quiz,
                        passingScore: parseInt(e.target.value)
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="70"
                  />
                </div>
              </div>
              
              {/* Quiz Questions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quiz Questions
                </label>
                <div className="space-y-4">
                  {newLesson.quiz?.questions?.map((question, qIndex) => (
                    <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-gray-900">Question {qIndex + 1}</h4>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedQuestions = newLesson.quiz.questions.filter((_, i) => i !== qIndex);
                            setNewLesson({
                              ...newLesson,
                              quiz: {
                                ...newLesson.quiz,
                                questions: updatedQuestions
                              }
                            });
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => {
                            const updatedQuestions = [...newLesson.quiz.questions];
                            updatedQuestions[qIndex] = {
                              ...updatedQuestions[qIndex],
                              question: e.target.value
                            };
                            setNewLesson({
                              ...newLesson,
                              quiz: {
                                ...newLesson.quiz,
                                questions: updatedQuestions
                              }
                            });
                          }}
                          placeholder="Enter your question"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name={`question-${qIndex}`}
                              checked={question.correctAnswer === oIndex}
                              onChange={() => {
                                const updatedQuestions = [...newLesson.quiz.questions];
                                updatedQuestions[qIndex] = {
                                  ...updatedQuestions[qIndex],
                                  correctAnswer: oIndex
                                };
                                setNewLesson({
                                  ...newLesson,
                                  quiz: {
                                    ...newLesson.quiz,
                                    questions: updatedQuestions
                                  }
                                });
                              }}
                              className="text-blue-600"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const updatedQuestions = [...newLesson.quiz.questions];
                                updatedQuestions[qIndex].options[oIndex] = e.target.value;
                                setNewLesson({
                                  ...newLesson,
                                  quiz: {
                                    ...newLesson.quiz,
                                    questions: updatedQuestions
                                  }
                                });
                              }}
                              placeholder={`Option ${oIndex + 1}`}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    const newQuestion = {
                      id: Date.now(),
                      question: '',
                      options: ['', '', '', ''],
                      correctAnswer: 0
                    };
                    setNewLesson({
                      ...newLesson,
                      quiz: {
                        ...newLesson.quiz,
                        questions: [...(newLesson.quiz?.questions || []), newQuestion]
                      }
                    });
                  }}
                  className="mt-3 flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>
          )}

          {/* Assignment-specific fields */}
          {newLesson.type === 'assignment' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={newLesson.assignment?.title || ''}
                  onChange={(e) => setNewLesson({
                    ...newLesson,
                    assignment: {
                      ...newLesson.assignment,
                      title: e.target.value
                    }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Assignment title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Description
                </label>
                <textarea
                  value={newLesson.assignment?.description || ''}
                  onChange={(e) => setNewLesson({
                    ...newLesson,
                    assignment: {
                      ...newLesson.assignment,
                      description: e.target.value
                    }
                  })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Describe the assignment requirements..."
                />
              </div>
              
              {/* Assignment Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                <div className="space-y-2">
                  {newLesson.assignment?.instructions?.map((instruction, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{index + 1}.</span>
                      <input
                        type="text"
                        value={instruction}
                        onChange={(e) => {
                          const updatedInstructions = [...(newLesson.assignment?.instructions || [])];
                          updatedInstructions[index] = e.target.value;
                          setNewLesson({
                            ...newLesson,
                            assignment: {
                              ...newLesson.assignment,
                              instructions: updatedInstructions
                            }
                          });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Enter instruction step"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updatedInstructions = newLesson.assignment?.instructions?.filter((_, i) => i !== index) || [];
                          setNewLesson({
                            ...newLesson,
                            assignment: {
                              ...newLesson.assignment,
                              instructions: updatedInstructions
                            }
                          });
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const currentInstructions = newLesson.assignment?.instructions || [];
                    setNewLesson({
                      ...newLesson,
                      assignment: {
                        ...newLesson.assignment,
                        instructions: [...currentInstructions, '']
                      }
                    });
                  }}
                  className="mt-2 flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Instruction</span>
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Score
                  </label>
                  <input
                    type="number"
                    value={newLesson.assignment?.maxScore || 100}
                    onChange={(e) => setNewLesson({
                      ...newLesson,
                      assignment: {
                        ...newLesson.assignment,
                        maxScore: parseInt(e.target.value)
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newLesson.assignment?.dueDate || ''}
                    onChange={(e) => setNewLesson({
                      ...newLesson,
                      assignment: {
                        ...newLesson.assignment,
                        dueDate: e.target.value
                      }
                    })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Type
                </label>
                <select
                  value={newLesson.assignment?.submissionType || 'both'}
                  onChange={(e) => setNewLesson({
                    ...newLesson,
                    assignment: {
                      ...newLesson.assignment,
                      submissionType: e.target.value
                    }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="text">Text Only</option>
                  <option value="file">File Only</option>
                  <option value="both">Text and File</option>
                </select>
              </div>
            </div>
          )}

          {/* Resources Section - Available for all lesson types */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lesson Resources
            </label>
            <div className="space-y-2">
              {newLesson.resources?.map((resource, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={resource.title}
                      onChange={(e) => {
                        const updatedResources = [...(newLesson.resources || [])];
                        updatedResources[index] = {
                          ...updatedResources[index],
                          title: e.target.value
                        };
                        setNewLesson({
                          ...newLesson,
                          resources: updatedResources
                        });
                      }}
                      placeholder="Resource title"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <input
                      type="url"
                      value={resource.url}
                      onChange={(e) => {
                        const updatedResources = [...(newLesson.resources || [])];
                        updatedResources[index] = {
                          ...updatedResources[index],
                          url: e.target.value
                        };
                        setNewLesson({
                          ...newLesson,
                          resources: updatedResources
                        });
                      }}
                      placeholder="Resource URL"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <select
                      value={resource.type}
                      onChange={(e) => {
                        const updatedResources = [...(newLesson.resources || [])];
                        updatedResources[index] = {
                          ...updatedResources[index],
                          type: e.target.value
                        };
                        setNewLesson({
                          ...newLesson,
                          resources: updatedResources
                        });
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="link">Link</option>
                      <option value="pdf">PDF</option>
                      <option value="document">Document</option>
                      <option value="video">Video</option>
                      <option value="image">Image</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedResources = newLesson.resources?.filter((_, i) => i !== index) || [];
                      setNewLesson({
                        ...newLesson,
                        resources: updatedResources
                      });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                const currentResources = newLesson.resources || [];
                setNewLesson({
                  ...newLesson,
                  resources: [...currentResources, { title: '', url: '', type: 'link' }]
                });
              }}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Resource</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Lesson
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LessonCreationModal;
