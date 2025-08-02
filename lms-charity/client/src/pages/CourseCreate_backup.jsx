import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { 
  BookOpen, 
  Upload, 
  Plus, 
  Trash2, 
  Save,
  ArrowLeft,
  FileText,
  Video,
  Brain,
  Target,
  X,
  Play,
  CheckCircle,
  CheckSquare
} from 'lucide-react';

const CourseCreateComplete = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to create courses');
      navigate('/login');
      return;
    }
    
    if (!user) {
      console.log('User not loaded yet...');
      return;
    }
    
    if (user.role !== 'instructor' && user.role !== 'admin') {
      toast.error('Only instructors can create courses');
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  const [courseData, setCourseData] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: '',
    subcategory: '',
    level: 'Beginner',
    thumbnail: '',
    price: 0,
    currency: 'USD',
    estimatedDuration: '',
    language: 'English',
    tags: [],
    learningOutcomes: [''],
    requirements: [''],
    targetAudience: [''],
    modules: []
  });

  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    estimatedDuration: '',
    lessons: []
  });

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(null);

  // Quiz creation state
  const [currentQuiz, setCurrentQuiz] = useState({
    title: '',
    description: '',
    questions: [],
    timeLimit: 300, // 5 minutes
    passingScore: 70
  });

  // Assignment creation state
  const [currentAssignment, setCurrentAssignment] = useState({
    title: '',
    description: '',
    instructions: [],
    maxScore: 100,
    dueDate: '',
    submissionType: 'both'
  });

  const categories = [
    'Programming',
    'Data Science',
    'AI/ML',
    'Design',
    'Business',
    'Other'
  ];

  const levels = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' }
  ];

  // Add module function
  const addModule = () => {
    if (newModule.title.trim()) {
      setCourseData(prev => ({
        ...prev,
        modules: [...prev.modules, { 
          ...newModule, 
          _id: Date.now(),
          order: prev.modules.length + 1,
          lessons: []
        }]
      }));
      setNewModule({
        title: '',
        description: '',
        estimatedDuration: '',
        lessons: []
      });
      setShowModuleModal(false);
      toast.success('Module added successfully!');
    }
  };

  // Create Video Lesson
  const createVideoLesson = (moduleIndex) => {
    const videoLesson = {
      _id: Date.now(),
      title: 'New Video Lesson',
      description: 'Video lesson description',
      type: 'video',
      videoUrl: '',
      videoDuration: 0,
      order: courseData.modules[moduleIndex].lessons.length + 1,
      isCompleted: false,
      resources: []
    };
    
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, index) => 
        index === moduleIndex
          ? {
              ...module,
              lessons: [...module.lessons, videoLesson]
            }
          : module
      )
    }));
    
    toast.success('Video lesson created successfully!');
  };

  // Create Quiz Lesson
  const createQuizLesson = (moduleIndex) => {
    if (currentQuiz.questions.length === 0) {
      toast.error('Please add at least one question to the quiz');
      return;
    }

    const quizLesson = {
      _id: Date.now(),
      title: currentQuiz.title,
      description: currentQuiz.description,
      type: 'quiz',
      order: courseData.modules[moduleIndex].lessons.length + 1,
      isCompleted: false,
      quiz: {
        questions: currentQuiz.questions,
        timeLimit: currentQuiz.timeLimit,
        passingScore: currentQuiz.passingScore
      }
    };
    
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, index) => 
        index === moduleIndex
          ? {
              ...module,
              lessons: [...module.lessons, quizLesson]
            }
          : module
      )
    }));
    
    // Reset quiz state
    setCurrentQuiz({
      title: '',
      description: '',
      questions: [],
      timeLimit: 300,
      passingScore: 70
    });
    
    setShowQuizModal(false);
    toast.success('Quiz lesson created successfully!');
  };

  // Create Assignment Lesson
  const createAssignmentLesson = (moduleIndex) => {
    if (!currentAssignment.title || !currentAssignment.description) {
      toast.error('Please fill in assignment title and description');
      return;
    }

    const assignmentLesson = {
      _id: Date.now(),
      title: currentAssignment.title,
      description: currentAssignment.description,
      type: 'assignment',
      order: courseData.modules[moduleIndex].lessons.length + 1,
      isCompleted: false,
      assignment: {
        title: currentAssignment.title,
        description: currentAssignment.description,
        instructions: currentAssignment.instructions,
        maxScore: currentAssignment.maxScore,
        dueDate: currentAssignment.dueDate,
        submissionType: currentAssignment.submissionType
      }
    };
    
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, index) => 
        index === moduleIndex
          ? {
              ...module,
              lessons: [...module.lessons, assignmentLesson]
            }
          : module
      )
    }));
    
    // Reset assignment state
    setCurrentAssignment({
      title: '',
      description: '',
      instructions: [],
      maxScore: 100,
      dueDate: '',
      submissionType: 'both'
    });
    
    setShowAssignmentModal(false);
    toast.success('Assignment lesson created successfully!');
  };

  // Add quiz question
  const addQuizQuestion = () => {
    setCurrentQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, {
        id: Date.now(),
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }]
    }));
  };

  // Update quiz question
  const updateQuizQuestion = (questionIndex, field, value) => {
    setCurrentQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) => 
        index === questionIndex ? { ...q, [field]: value } : q
      )
    }));
  };

  // Update quiz question option
  const updateQuizQuestionOption = (questionIndex, optionIndex, value) => {
    setCurrentQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) => 
        index === questionIndex 
          ? { ...q, options: q.options.map((opt, oIndex) => oIndex === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  // Add assignment instruction
  const addAssignmentInstruction = () => {
    setCurrentAssignment(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  // Update assignment instruction
  const updateAssignmentInstruction = (index, value) => {
    setCurrentAssignment(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => i === index ? value : inst)
    }));
  };

  // Submit course
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validate required fields
      if (!courseData.title || !courseData.description || !courseData.category) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Prepare submission data
      const submissionData = {
        title: courseData.title,
        description: courseData.description,
        shortDescription: courseData.shortDescription || '',
        category: courseData.category,
        subcategory: courseData.subcategory || '',
        level: courseData.level,
        price: courseData.price || 0,
        currency: courseData.currency || 'USD',
        estimatedDuration: courseData.estimatedDuration || '',
        language: courseData.language || 'English',
        tags: courseData.tags || [],
        learningOutcomes: courseData.learningOutcomes.filter(outcome => outcome && outcome.trim()),
        requirements: courseData.requirements.filter(req => req && req.trim()),
        targetAudience: courseData.targetAudience.filter(audience => audience && audience.trim()),
        modules: courseData.modules.map((module, moduleIndex) => ({
          title: module.title,
          description: module.description || '',
          estimatedDuration: parseFloat(module.estimatedDuration) || 0,
          order: module.order || moduleIndex + 1,
          lessons: module.lessons.map((lesson, lessonIndex) => ({
            title: lesson.title,
            description: lesson.description || '',
            type: lesson.type,
            content: lesson.content || '',
            videoUrl: lesson.videoUrl || '',
            videoDuration: parseFloat(lesson.videoDuration) || 0,
            order: lesson.order || lessonIndex + 1,
            isPreview: lesson.isPreview || false,
            resources: lesson.resources || [],
            ...(lesson.quiz && { quiz: lesson.quiz }),
            ...(lesson.assignment && { assignment: lesson.assignment })
          }))
        })),
        status: 'draft',
        isPublished: false
      };

      console.log('Submitting course data:', submissionData);

      const response = await axios.post('/api/courses', submissionData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        baseURL: import.meta.env.VITE_API_URL || 'https://eduback.vercel.app/api'
      });      console.log('Course created successfully:', response.data);
      toast.success('Course created successfully!');
      navigate('/instructor/dashboard');
    } catch (error) {
      console.error('Course creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Creating your course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/instructor/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
                <p className="text-gray-600">Build an engaging course with videos, quizzes, and assignments</p>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Information Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Course Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={courseData.title}
                    onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Complete React Development Masterclass 2024"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description *
                  </label>
                  <textarea
                    value={courseData.shortDescription}
                    onChange={(e) => setCourseData({...courseData, shortDescription: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="A brief description of your course"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={courseData.category}
                    onChange={(e) => setCourseData({...courseData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level
                  </label>
                  <select
                    value={courseData.level}
                    onChange={(e) => setCourseData({...courseData, level: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {levels.map(level => (
                      <option key={level.value} value={level.value}>{level.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Course Content</h2>
                <button
                  onClick={() => setShowModuleModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Module
                </button>
              </div>

              {/* Modules */}
              <div className="space-y-4">
                {courseData.modules.map((module, moduleIndex) => (
                  <div key={module._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{module.title}</h3>
                        <p className="text-sm text-gray-600">{module.description}</p>
                      </div>
                    </div>

                    {/* Lessons */}
                    <div className="space-y-2 mb-3">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0 mr-3">
                            {lesson.type === 'video' && <Play className="h-5 w-5 text-blue-600" />}
                            {lesson.type === 'quiz' && <Brain className="h-5 w-5 text-purple-600" />}
                            {lesson.type === 'assignment' && <FileText className="h-5 w-5 text-green-600" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{lesson.title}</p>
                            <p className="text-sm text-gray-600 capitalize">{lesson.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Lesson Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => createVideoLesson(moduleIndex)}
                        className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Add Video
                      </button>
                      <button
                        onClick={() => {
                          setSelectedModuleIndex(moduleIndex);
                          setShowQuizModal(true);
                        }}
                        className="flex items-center px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                      >
                        <Brain className="h-4 w-4 mr-1" />
                        Add Quiz
                      </button>
                      <button
                        onClick={() => {
                          setSelectedModuleIndex(moduleIndex);
                          setShowAssignmentModal(true);
                        }}
                        className="flex items-center px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Add Assignment
                      </button>
                    </div>
                  </div>
                ))}
                
                {courseData.modules.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No modules yet. Add your first module to get started!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Course Details Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Course Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description
                  </label>
                  <textarea
                    value={courseData.description}
                    onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide a detailed description of your course..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    value={courseData.price}
                    onChange={(e) => setCourseData({...courseData, price: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0 for free"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">Add New Module</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module Title
                </label>
                <input
                  type="text"
                  value={newModule.title}
                  onChange={(e) => setNewModule({...newModule, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Getting Started with React"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module Description
                </label>
                <textarea
                  value={newModule.description}
                  onChange={(e) => setNewModule({...newModule, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what students will learn in this module"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModuleModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addModule}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Module
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create Quiz</h3>
              <button
                onClick={() => setShowQuizModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={currentQuiz.title}
                  onChange={(e) => setCurrentQuiz({...currentQuiz, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., React Fundamentals Quiz"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Description
                </label>
                <textarea
                  value={currentQuiz.description}
                  onChange={(e) => setCurrentQuiz({...currentQuiz, description: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Test your understanding of React basics"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    value={currentQuiz.timeLimit / 60}
                    onChange={(e) => setCurrentQuiz({...currentQuiz, timeLimit: parseInt(e.target.value) * 60})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    value={currentQuiz.passingScore}
                    onChange={(e) => setCurrentQuiz({...currentQuiz, passingScore: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Questions */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Questions
                  </label>
                  <button
                    onClick={addQuizQuestion}
                    className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Question
                  </button>
                </div>
                
                <div className="space-y-4">
                  {currentQuiz.questions.map((question, questionIndex) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Question {questionIndex + 1}
                        </label>
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => updateQuizQuestion(questionIndex, 'question', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your question"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name={`question-${questionIndex}`}
                              checked={question.correctAnswer === optionIndex}
                              onChange={() => updateQuizQuestion(questionIndex, 'correctAnswer', optionIndex)}
                              className="text-blue-600"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateQuizQuestionOption(questionIndex, optionIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={`Option ${optionIndex + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowQuizModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => createQuizLesson(selectedModuleIndex)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Create Quiz
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create Assignment</h3>
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Title
                </label>
                <input
                  type="text"
                  value={currentAssignment.title}
                  onChange={(e) => setCurrentAssignment({...currentAssignment, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Create a Profile Card Component"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Description
                </label>
                <textarea
                  value={currentAssignment.description}
                  onChange={(e) => setCurrentAssignment({...currentAssignment, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Build a reusable profile card component that displays user information..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Instructions
                  </label>
                  <button
                    onClick={addAssignmentInstruction}
                    className="flex items-center px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Instruction
                  </button>
                </div>
                
                <div className="space-y-2">
                  {currentAssignment.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckSquare className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <input
                        type="text"
                        value={instruction}
                        onChange={(e) => updateAssignmentInstruction(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Instruction ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Score
                  </label>
                  <input
                    type="number"
                    value={currentAssignment.maxScore}
                    onChange={(e) => setCurrentAssignment({...currentAssignment, maxScore: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={currentAssignment.dueDate}
                    onChange={(e) => setCurrentAssignment({...currentAssignment, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAssignmentModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => createAssignmentLesson(selectedModuleIndex)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Assignment
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CourseCreateComplete;
