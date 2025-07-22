import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import CourseBasicsForm from '../components/CourseBasicsForm';
import LearningGoalsForm from '../components/LearningGoalsForm';
import MediaForm from '../components/MediaForm';
import ContentForm from '../components/ContentForm';
import ConclusionForm from '../components/ConclusionForm';
import ResourceInput from '../components/ResourceInput';
import ReviewForm from '../components/ReviewForm';
import VideoLessonForm from '../components/VideoLessonForm';
import QuizLessonForm from '../components/QuizLessonForm';
import AssignmentLessonForm from '../components/AssignmentLessonForm';
import FileUploadResource from '../components/FileUploadResource';
import {
  BookOpen,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  FileText,
  Video,
  Image,
  Clock,
  Users,
  Target,
  CheckCircle,
  Brain,
  FileQuestion,
  X,
  PlayCircle,
  Camera,
  Info,
  Rocket,
  Link,
  Calendar,
  Award,
  HelpCircle,
  FileUp,
  Edit3,
  Save,
  Star,
  Download
} from 'lucide-react';

const CourseCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Course data
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    instructor: {
      name: user?.name || '',
      avatar: user?.avatar || '',
      bio: '',
      rating: 0,
      studentsCount: 0
    },
    level: 'Beginner',
    category: 'Programming',
    tags: [],
    thumbnail: '',
    previewVideo: '',
    totalDuration: 0,
    learningOutcomes: [''],
    prerequisites: [''],
    targetAudience: [''],
    modules: [],
    certification: {
      enabled: false,
      title: '',
      description: ''
    },
    supportChannels: [''],
    nextSteps: {
      summary: '',
      furtherLearning: [''],
      nextTopics: ['']
    }
  });
  
  // Form states
  const [newTag, setNewTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Modal states
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(null);
  const [expandedLessons, setExpandedLessons] = useState({});
  
  // Working states
  const [workingModule, setWorkingModule] = useState({
    title: '',
    description: ''
  });
  
  const [workingLesson, setWorkingLesson] = useState({
    title: '',
    description: '',
    type: 'video',
    videoDuration: 0,
    content: '',
    overview: '',
    keyTakeaways: [''],
    resources: [], // Start with empty array for file uploads
    quiz: {
      questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }],
      timeLimit: 30,
      passingScore: 70
    },        assignment: {
          title: '', // Add title field to match backend
          description: '', // Add description field to match backend
          instructions: '', // String, not array
          dueDays: 7,
          maxPoints: 100, // Will map to maxScore on backend
          submissionType: 'both', // Use backend enum values
          resources: [],
          rubric: []
        }
  });

  const steps = [
    { id: 1, title: 'Course Basics', icon: BookOpen },
    { id: 2, title: 'Learning Goals', icon: Target },
    { id: 3, title: 'Course Media', icon: Camera },
    { id: 4, title: 'Course Content', icon: Video },
    { id: 5, title: 'Course Conclusion', icon: CheckCircle },
    { id: 6, title: 'Publish', icon: Rocket }
  ];

  const categories = [
    'Programming', 'Design', 'Business', 'Marketing', 'Science', 'Language', 'Data Science', 'AI/ML', 'Cybersecurity', 'Other'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  // Step validation
  const isStepValid = (stepId) => {
    switch (stepId) {
      case 1:
        return courseData.title.trim() && courseData.description.trim();
      case 2:
        return courseData.learningOutcomes.some(o => o.trim());
        // Target audience is now optional
      case 3:
        return courseData.thumbnail;
      case 4:
        return courseData.modules.length > 0 && courseData.modules.some(m => m.lessons.length > 0);
      case 5:
        return courseData.nextSteps.summary.trim() && 
               courseData.prerequisites.some(p => p.trim());
      case 6:
        return true;
      default:
        return false;
    }
  };

  const canGoNext = () => isStepValid(currentStep);
  const canGoPrevious = () => currentStep > 1;

  const goNext = () => {
    if (canGoNext() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goPrevious = () => {
    if (canGoPrevious()) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Input handlers
  const handleInputChange = useCallback((field, value) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Course data change handler - stable reference
  const handleCourseDataChange = useCallback((field, value) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  }, []);

  // Memoize categories and levels to prevent unnecessary re-renders
  const categoriesMemo = useMemo(() => categories, []);
  const levelsMemo = useMemo(() => levels, []);

  // Helper functions for nested arrays
  const handleArrayChange = useCallback((parentField, index, value, childField = null) => {
    setCourseData(prev => {
      if (childField) {
        return {
          ...prev,
          [parentField]: {
            ...prev[parentField],
            [childField]: prev[parentField][childField].map((item, i) => i === index ? value : item)
          }
        };
      } else {
        return {
          ...prev,
          [parentField]: prev[parentField].map((item, i) => i === index ? value : item)
        };
      }
    });
  }, []);

  const addArrayItem = useCallback((parentField, childField = null) => {
    setCourseData(prev => {
      if (childField) {
        return {
          ...prev,
          [parentField]: {
            ...prev[parentField],
            [childField]: [...prev[parentField][childField], '']
          }
        };
      } else {
        return {
          ...prev,
          [parentField]: [...prev[parentField], '']
        };
      }
    });
  }, []);

  const removeArrayItem = useCallback((parentField, index, childField = null) => {
    setCourseData(prev => {
      if (childField) {
        if (prev[parentField][childField].length > 1) {
          return {
            ...prev,
            [parentField]: {
              ...prev[parentField],
              [childField]: prev[parentField][childField].filter((_, i) => i !== index)
            }
          };
        }
        return prev;
      } else {
        if (prev[parentField].length > 1) {
          return {
            ...prev,
            [parentField]: prev[parentField].filter((_, i) => i !== index)
          };
        }
        return prev;
      }
    });
  }, []);

  // Tag management
  const addTag = useCallback(() => {
    if (newTag.trim() && !courseData.tags.includes(newTag.trim())) {
      setCourseData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  }, [newTag, courseData.tags]);

  const removeTag = useCallback((tagToRemove) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  // File upload
  const handleFileUpload = async (file, type) => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Determine upload endpoint
      let uploadEndpoint, fieldName;
      if (type === 'thumbnail' || file.type.startsWith('image/')) {
        uploadEndpoint = '/api/upload/image';
        fieldName = 'image';
      } else if (type === 'preview' || file.type.startsWith('video/')) {
        uploadEndpoint = '/api/upload/video';
        fieldName = 'video';
      }
      
      const formData = new FormData();
      formData.append(fieldName, file);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);
      
      const response = await fetch(`http://localhost:5000${uploadEndpoint}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      const data = await response.json();
      const fileUrl = `http://localhost:5000${data.url}`;
      
      setUploadProgress(100);
      
      if (type === 'thumbnail') {
        setCourseData(prev => ({ ...prev, thumbnail: fileUrl }));
        toast.success('Thumbnail uploaded!');
      } else if (type === 'preview') {
        setCourseData(prev => ({ ...prev, previewVideo: fileUrl }));
        toast.success('Preview video uploaded!');
      }
      
      setIsUploading(false);
      setUploadProgress(0);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Module management
  const addModule = () => {
    if (workingModule.title.trim()) {
      const newModule = {
        _id: Date.now().toString(),
        title: workingModule.title,
        description: workingModule.description,
        order: courseData.modules.length + 1,
        lessons: []
      };
      
      setCourseData(prev => ({
        ...prev,
        modules: [...prev.modules, newModule]
      }));
      
      setWorkingModule({ title: '', description: '' });
      setShowModuleModal(false);
      toast.success('Module added!');
    }
  };

  const removeModule = (moduleId) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.filter(module => module._id !== moduleId)
    }));
  };

  // Lesson management
  const addLesson = () => {
    // Basic validation
    if (!workingLesson.title.trim() || !workingLesson.description.trim() || currentModuleIndex === null) {
      toast.error('Please fill in lesson title and description');
      return;
    }
    
    const newLesson = {
        _id: Date.now().toString(),
        title: workingLesson.title,
        description: workingLesson.description,
        type: workingLesson.type,
        order: courseData.modules[currentModuleIndex].lessons.length + 1,
        isCompleted: false,
        overview: workingLesson.overview,
        keyTakeaways: workingLesson.keyTakeaways.filter(kt => kt.trim()),
        resources: workingLesson.resources.filter(r => r.title && r.title.trim()) // Filter out empty resources
      };
      
      // Add type-specific properties
      if (newLesson.type === 'video') {
        newLesson.videoDuration = workingLesson.videoDuration;
        newLesson.videoUrl = workingLesson.videoUrl;
        newLesson.videoDescription = workingLesson.videoDescription;
        newLesson.timestamps = workingLesson.timestamps;
      } else if (newLesson.type === 'text') {
        newLesson.content = workingLesson.content;
      } else if (newLesson.type === 'quiz') {
        newLesson.quiz = workingLesson.quiz;
      } else if (newLesson.type === 'assignment') {
        newLesson.assignment = workingLesson.assignment;
      }
      
      setCourseData(prev => ({
        ...prev,
        modules: prev.modules.map((module, index) => 
          index === currentModuleIndex 
            ? { ...module, lessons: [...module.lessons, newLesson] }
            : module
        )
      }));
      
      setWorkingLesson({
        title: '',
        description: '',
        type: 'video',
        overview: '',
        keyTakeaways: [''],
        resources: [], // Changed to empty array for file uploads
        
        // Video lesson specific
        videoDuration: 0,
        videoUrl: '',
        videoDescription: '',
        timestamps: [],
        
        // Text lesson specific
        content: '',
        
        // Quiz lesson specific
        quiz: {
          questions: [],
          timeLimit: 10,
          passingScore: 70,
          maxAttempts: 3,
          randomizeQuestions: false
        },
        
        // Assignment lesson specific
        assignment: {
          instructions: '',
          dueDays: 7,
          maxPoints: 100,
          submissionType: 'file',
          allowLateSubmission: false,
          requirePeerReview: false,
          rubric: [],
          resources: []
        }
      });
      
      setShowLessonModal(false);
      setCurrentModuleIndex(null);
      toast.success('Lesson added!');
  };

  const removeLesson = (moduleIndex, lessonId) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, index) => 
        index === moduleIndex
          ? { ...module, lessons: module.lessons.filter(lesson => lesson._id !== lessonId) }
          : module
      )
    }));
  };

  // Submit course
  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const totalDuration = courseData.modules.reduce((total, module) => 
        total + module.lessons.reduce((moduleTotal, lesson) => 
          moduleTotal + (lesson.videoDuration || 0), 0), 0);

      const coursePayload = {
        ...courseData,
        totalDuration,
        instructor: {
          ...courseData.instructor,
          name: user?.name || courseData.instructor.name
        },
        learningOutcomes: courseData.learningOutcomes.filter(outcome => outcome.trim()),
        prerequisites: courseData.prerequisites.filter(req => req.trim()),
        targetAudience: courseData.targetAudience.filter(audience => audience.trim()),
        status: 'draft',
        isPublished: false,
        // Map assignment data to backend schema
        modules: courseData.modules.map(module => ({
          ...module,
          lessons: module.lessons.map(mapAssignmentData)
        }))
      };

      const response = await axios.post('/courses', coursePayload, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        toast.success('Course created successfully!');
        navigate('/instructor/courses');
      }

    } catch (error) {
      console.error('Course creation error:', error);
      
      if (error.response?.status === 401) {
        toast.error('Please login again');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to create course');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for lesson content management
  const addLessonArrayItem = (field, subfield = null) => {
    setWorkingLesson(prev => {
      if (subfield) {
        return {
          ...prev,
          [field]: {
            ...prev[field],
            [subfield]: [...prev[field][subfield], field === 'quiz' && subfield === 'questions' ? 
              { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' } : 
              field === 'resources' ? { title: '', url: '', type: 'document' } : '']
          }
        };
      } else {
        return {
          ...prev,
          [field]: [...prev[field], field === 'resources' ? { title: '', url: '', type: 'document' } : '']
        };
      }
    });
  };

  const removeLessonArrayItem = (field, index, subfield = null) => {
    setWorkingLesson(prev => {
      if (subfield) {
        return {
          ...prev,
          [field]: {
            ...prev[field],
            [subfield]: prev[field][subfield].filter((_, i) => i !== index)
          }
        };
      } else {
        return {
          ...prev,
          [field]: prev[field].filter((_, i) => i !== index)
        };
      }
    });
  };

  const updateLessonArrayItem = (field, index, value, subfield = null, itemProperty = null) => {
    setWorkingLesson(prev => {
      if (subfield) {
        return {
          ...prev,
          [field]: {
            ...prev[field],
            [subfield]: prev[field][subfield].map((item, i) => 
              i === index ? (itemProperty ? { ...item, [itemProperty]: value } : value) : item
            )
          }
        };
      } else {
        return {
          ...prev,
          [field]: prev[field].map((item, i) => 
            i === index ? (itemProperty ? { ...item, [itemProperty]: value } : value) : item
          )
        };
      }
    });
  };

  const toggleLessonExpanded = (moduleIndex, lessonIndex) => {
    const key = `${moduleIndex}-${lessonIndex}`;
    setExpandedLessons(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Helper function to map frontend assignment data to backend schema
  const mapAssignmentData = (lesson) => {
    if (lesson.type === 'assignment' && lesson.assignment) {
      return {
        ...lesson,
        assignment: {
          ...lesson.assignment,
          title: lesson.title, // Use lesson title for assignment title
          description: lesson.description, // Use lesson description for assignment description 
          maxScore: lesson.assignment.maxPoints, // Map maxPoints to maxScore
          // Keep all other assignment fields including instructions
          instructions: lesson.assignment.instructions
        }
      };
    }
    return lesson;
  };

  // Step components - Using React.memo to prevent unnecessary re-renders
  const StepBasics = useMemo(() => (
    <CourseBasicsForm
      courseData={courseData}
      onCourseDataChange={handleCourseDataChange}
      categories={categoriesMemo}
      levels={levelsMemo}
    />
  ), [courseData.title, courseData.description, courseData.category, courseData.level, courseData.tags, handleCourseDataChange, categoriesMemo, levelsMemo]);

  // Step component memos
  const StepLearningGoalsMemo = useMemo(() => (
    <LearningGoalsForm
      courseData={courseData}
      onArrayChange={handleArrayChange}
      onAddArrayItem={addArrayItem}
      onRemoveArrayItem={removeArrayItem}
    />
  ), [courseData.learningOutcomes, courseData.targetAudience, handleArrayChange, addArrayItem, removeArrayItem]);

  const StepMediaMemo = useMemo(() => (
    <MediaForm
      courseData={courseData}
      onFileUpload={handleFileUpload}
      isUploading={isUploading}
      uploadProgress={uploadProgress}
    />
  ), [courseData.thumbnail, courseData.previewVideo, handleFileUpload, isUploading, uploadProgress]);

  const StepContentMemo = useMemo(() => (
    <ContentForm
      courseData={courseData}
      onShowModuleModal={setShowModuleModal}
      onShowLessonModal={setShowLessonModal}
      onRemoveModule={removeModule}
      onRemoveLesson={removeLesson}
      onSetCurrentModuleIndex={setCurrentModuleIndex}
    />
  ), [courseData.modules, removeModule, removeLesson]);

  const StepConclusionMemo = useMemo(() => (
    <ConclusionForm
      courseData={courseData}
      onCourseDataChange={setCourseData}
      onArrayChange={handleArrayChange}
      onAddArrayItem={addArrayItem}
      onRemoveArrayItem={removeArrayItem}
    />
  ), [courseData.nextSteps, courseData.prerequisites, courseData.certification, courseData.supportChannels, handleArrayChange, addArrayItem, removeArrayItem]);

  const StepReviewMemo = useMemo(() => (
    <ReviewForm
      courseData={courseData}
      onSubmit={handleSubmit}
      loading={loading}
    />
  ), [courseData, handleSubmit, loading]);

  const renderStepContent = useCallback(() => {
    switch (currentStep) {
      case 1: return StepBasics;
      case 2: return StepLearningGoalsMemo;
      case 3: return StepMediaMemo;
      case 4: return StepContentMemo;
      case 5: return StepConclusionMemo;
      case 6: return StepReviewMemo;
      default: return StepBasics;
    }
  }, [currentStep, StepBasics, StepLearningGoalsMemo, StepMediaMemo, StepContentMemo, StepConclusionMemo, StepReviewMemo]);

  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup is no longer needed since we use server URLs instead of blob URLs
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/instructor/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
            <p className="text-gray-600 mt-2">Step {currentStep} of {steps.length}</p>
          </div>
          <div className="w-32"></div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              
              return (
                <div key={step.id} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isActive ? 'bg-blue-600 text-white shadow-lg scale-110' :
                      isCompleted ? 'bg-green-600 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={goPrevious}
            disabled={!canGoPrevious()}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 ${
              canGoPrevious() 
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Previous</span>
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={goNext}
              disabled={!canGoNext()}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                canGoNext() 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <span>Next</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg disabled:opacity-50"
            >
              <Rocket className="w-5 h-5" />
              <span>{loading ? 'Publishing...' : 'Publish Course'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Module Modal */}
      <AnimatePresence>
        {showModuleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-lg font-semibold mb-4">Add New Module</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Module Title</label>
                  <input
                    type="text"
                    value={workingModule.title}
                    onChange={(e) => setWorkingModule(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Getting Started with React"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={workingModule.description}
                    onChange={(e) => setWorkingModule(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of this module..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModuleModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addModule}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Module
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lesson Modal */}
      <AnimatePresence>
        {showLessonModal && currentModuleIndex !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-semibold mb-4">Add New Lesson</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Basic Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Title</label>
                    <input
                      type="text"
                      value={workingLesson.title}
                      onChange={(e) => setWorkingLesson(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., What is React and Why Use It?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={workingLesson.description}
                      onChange={(e) => setWorkingLesson(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !workingLesson.description.trim() ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Brief description of this lesson..."
                      required
                    />
                    {!workingLesson.description.trim() && (
                      <p className="text-xs text-red-600 mt-1">Description is required</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Type</label>
                    <select
                      value={workingLesson.type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setWorkingLesson(prev => {
                          const updated = { ...prev, type: newType };
                          
                          // Initialize type-specific data when type changes
                          if (newType === 'assignment' && !updated.assignment) {
                            updated.assignment = {
                              title: updated.title || '',
                              description: updated.description || '',
                              instructions: '',
                              dueDays: 7,
                              maxPoints: 100,
                              submissionType: 'both',
                              resources: [],
                              rubric: []
                            };
                          } else if (newType === 'quiz' && !updated.quiz) {
                            updated.quiz = {
                              questions: [{ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' }],
                              timeLimit: 30,
                              passingScore: 70
                            };
                          }
                          
                          return updated;
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="video">Video Lesson</option>
                      <option value="quiz">Quiz</option>
                      <option value="assignment">Assignment</option>
                      <option value="text">Text/Reading</option>
                    </select>
                  </div>

                  {/* Lesson Type Specific Content */}
                  {workingLesson.type === 'video' && (
                    <VideoLessonForm
                      lessonData={workingLesson}
                      onUpdate={setWorkingLesson}
                    />
                  )}

                  {workingLesson.type === 'quiz' && (
                    <QuizLessonForm
                      lessonData={workingLesson}
                      onUpdate={setWorkingLesson}
                    />
                  )}

                  {workingLesson.type === 'assignment' && (
                    <AssignmentLessonForm
                      lessonData={workingLesson}
                      onUpdate={setWorkingLesson}
                    />
                  )}

                  {workingLesson.type === 'text' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reading Content</label>
                      <textarea
                        value={workingLesson.content}
                        onChange={(e) => setWorkingLesson(prev => ({ ...prev, content: e.target.value }))}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter the text content for students to read..."
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Overview</label>
                    <textarea
                      value={workingLesson.overview}
                      onChange={(e) => setWorkingLesson(prev => ({ ...prev, overview: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief summary of what students will learn in this lesson..."
                    />
                  </div>
                </div>

                {/* Common Lesson Content */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Additional Learning Materials</h4>
                  
                  {/* Key Takeaways */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Key Learning Points</label>
                    {workingLesson.keyTakeaways.map((takeaway, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={takeaway}
                          onChange={(e) => updateLessonArrayItem('keyTakeaways', index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Key learning point..."
                        />
                        <button
                          onClick={() => removeLessonArrayItem('keyTakeaways', index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addLessonArrayItem('keyTakeaways')}
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                    >
                      <Plus size={16} className="mr-1" /> Add Learning Point
                    </button>
                  </div>

                  {/* Resources - File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Lesson Resources
                    </label>
                    <FileUploadResource
                      resources={workingLesson.resources || []}
                      onResourcesChange={(newResources) => {
                        setWorkingLesson(prev => ({
                          ...prev,
                          resources: newResources
                        }));
                      }}
                      allowedTypes="all"
                      maxFileSize={50 * 1024 * 1024} // 50MB
                      maxFiles={10}
                    />
                  </div>
                </div>
              </div>



              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowLessonModal(false);
                    setCurrentModuleIndex(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addLesson}
                  disabled={!workingLesson.title.trim() || !workingLesson.description.trim()}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    workingLesson.title.trim() && workingLesson.description.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Add Lesson
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseCreate;