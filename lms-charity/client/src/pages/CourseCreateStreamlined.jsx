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
  Image,
  Settings,
  Clock,
  Users,
  Star,
  Award,
  Calendar,
  DollarSign,
  Eye,
  CheckCircle,
  Brain,
  FileQuestion,
  Globe,
  Target,
  HelpCircle,
  MessageSquare,
  X,
  GraduationCap,
  Timer,
  PlayCircle,
  Lightbulb,
  Zap,
  Camera,
  Edit3,
  Gift,
  Send,
  Check,
  Rocket,
  TrendingUp,
  Heart,
  ThumbsUp,
  Download,
  Share,
  AlertCircle,
  CheckSquare,
  XCircle,
  Info,
  BookOpenCheck,
  PenTool,
  Presentation,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Clock3,
  Trophy,
  Medal,
  Crown,
  Flame,
  Sparkles
} from 'lucide-react';

const CourseCreateStreamlined = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Course data with structure matching the sample data exactly
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
    requirements: [''],
    targetAudience: [''],
    modules: []
  });

  const [newTag, setNewTag] = useState('');
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    duration: 0,
    lessons: []
  });

  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    type: 'video',
    videoUrl: '',
    videoDuration: 0,
    content: '',
    resources: [],
    quiz: {
      questions: [],
      timeLimit: 300,
      passingScore: 70
    },
    assignment: {
      title: '',
      description: '',
      instructions: [],
      maxScore: 100,
      dueDate: '',
      submissionType: 'both'
    }
  });

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(null);

  const categories = [
    'Programming', 'Web Development', 'Mobile Development', 'Data Science',
    'Machine Learning', 'DevOps', 'Cybersecurity', 'Cloud Computing',
    'Game Development', 'UI/UX Design', 'Business', 'Marketing',
    'Photography', 'Music', 'Art & Design', 'Health & Fitness',
    'Cooking', 'Language Learning', 'Personal Development', 'Other'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  // Format time helper
  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Basic input handlers
  const handleInputChange = (field, value) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field, index, value) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setCourseData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    if (courseData[field].length > 1) {
      setCourseData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  // Tag management
  const addTag = () => {
    if (newTag.trim() && !courseData.tags.includes(newTag.trim())) {
      setCourseData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Module management
  const addModule = () => {
    if (newModule.title.trim()) {
      const moduleWithId = {
        _id: Date.now().toString(),
        title: newModule.title,
        description: newModule.description || '',
        order: courseData.modules.length + 1,
        duration: parseFloat(newModule.duration) || 0,
        lessons: []
      };
      
      setCourseData(prev => ({
        ...prev,
        modules: [...prev.modules, moduleWithId]
      }));
      
      setNewModule({ title: '', description: '', duration: 0, lessons: [] });
      setShowModuleModal(false);
      toast.success('Module added successfully');
    }
  };

  const removeModule = (moduleId) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.filter(module => module._id !== moduleId)
    }));
  };

  // Lesson management with exact structure matching
  const addLessonToModule = (moduleIndex) => {
    if (newLesson.title.trim()) {
      const lessonWithId = {
        _id: Date.now().toString(),
        title: newLesson.title,
        description: newLesson.description || '',
        type: newLesson.type,
        order: courseData.modules[moduleIndex].lessons.length + 1,
        isCompleted: false,
        resources: newLesson.resources || []
      };

      // Add type-specific fields exactly like sample data
      if (lessonWithId.type === 'video') {
        lessonWithId.videoUrl = newLesson.videoUrl || '';
        lessonWithId.videoDuration = parseInt(newLesson.videoDuration) || 0;
        lessonWithId.transcript = newLesson.transcript || '';
        lessonWithId.notes = newLesson.notes || '';
      }

      if (lessonWithId.type === 'quiz' && newLesson.quiz.questions.length > 0) {
        lessonWithId.quiz = {
          questions: newLesson.quiz.questions.map(q => ({
            id: q.id || Date.now() + Math.random(),
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || ''
          })),
          timeLimit: newLesson.quiz.timeLimit || 300,
          passingScore: newLesson.quiz.passingScore || 70,
          instructions: newLesson.quiz.instructions || ''
        };
      }

      if (lessonWithId.type === 'assignment' && newLesson.assignment.title) {
        lessonWithId.assignment = {
          title: newLesson.assignment.title,
          description: newLesson.assignment.description,
          instructions: newLesson.assignment.instructions || [],
          dueDate: newLesson.assignment.dueDate || '',
          maxScore: newLesson.assignment.maxScore || 100,
          submissionType: newLesson.assignment.submissionType || 'both',
          resources: newLesson.assignment.resources || [],
          rubric: newLesson.assignment.rubric || {}
        };
      }

      if (lessonWithId.type === 'text') {
        lessonWithId.content = newLesson.content || '';
      }

      setCourseData(prev => ({
        ...prev,
        modules: prev.modules.map((module, index) => 
          index === moduleIndex 
            ? { ...module, lessons: [...module.lessons, lessonWithId] }
            : module
        )
      }));

      // Reset lesson form
      setNewLesson({
        title: '',
        description: '',
        type: 'video',
        videoUrl: '',
        videoDuration: 0,
        content: '',
        resources: [],
        quiz: { questions: [], timeLimit: 300, passingScore: 70 },
        assignment: { title: '', description: '', instructions: [], maxScore: 100, dueDate: '', submissionType: 'both' }
      });

      setShowLessonModal(false);
      setCurrentModuleIndex(null);
      toast.success('Lesson added successfully');
    }
  };

  const removeLessonFromModule = (moduleIndex, lessonId) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, index) => 
        index === moduleIndex
          ? { ...module, lessons: module.lessons.filter(lesson => lesson._id !== lessonId) }
          : module
      )
    }));
  };

  // File upload handlers
  const handleThumbnailUpload = async (file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // For now, create a local URL - in production you'd upload to cloud storage
    const imageUrl = URL.createObjectURL(file);
    setCourseData(prev => ({ ...prev, thumbnail: imageUrl }));
    toast.success('Thumbnail uploaded successfully');
  };

  const handleVideoUpload = async (file, field) => {
    if (!file) return;
    
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }

    // For now, create a local URL - in production you'd upload to cloud storage
    const videoUrl = URL.createObjectURL(file);
    
    if (field === 'preview') {
      setCourseData(prev => ({ ...prev, previewVideo: videoUrl }));
    } else {
      setNewLesson(prev => ({ ...prev, videoUrl }));
    }
    
    toast.success('Video uploaded successfully');
  };

  // Submit course
  const handleSubmit = async () => {
    // Basic validation
    if (!courseData.title.trim()) {
      toast.error('Course title is required');
      return;
    }

    if (!courseData.description.trim()) {
      toast.error('Course description is required');
      return;
    }

    if (courseData.modules.length === 0) {
      toast.error('At least one module is required');
      return;
    }

    const hasLessons = courseData.modules.some(module => module.lessons.length > 0);
    if (!hasLessons) {
      toast.error('At least one lesson is required');
      return;
    }

    setLoading(true);

    try {
      // Calculate total duration
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
        requirements: courseData.requirements.filter(req => req.trim()),
        targetAudience: courseData.targetAudience.filter(audience => audience.trim()),
        status: 'draft',
        isPublished: false
      };

      console.log('Creating course with payload:', coursePayload);

      const response = await axios.post('/api/courses', coursePayload, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        toast.success('Course created successfully!');
        navigate(`/instructor/courses`);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/instructor/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
          <p className="text-gray-600 mt-2">Build an engaging course that matches our platform's structure</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Course Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={courseData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Complete React Development Masterclass 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Description *
                  </label>
                  <textarea
                    value={courseData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what students will learn and achieve..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={courseData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level *
                    </label>
                    <select
                      value={courseData.level}
                      onChange={(e) => handleInputChange('level', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add a tag..."
                    />
                    <button
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {courseData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Learning Outcomes</h2>
              <p className="text-gray-600 mb-4">What will students learn from this course?</p>
              
              <div className="space-y-3">
                {courseData.learningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => handleArrayInputChange('learningOutcomes', index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Students will be able to..."
                    />
                    {courseData.learningOutcomes.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('learningOutcomes', index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => addArrayItem('learningOutcomes')}
                className="mt-3 flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Learning Outcome</span>
              </button>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Requirements</h2>
              <p className="text-gray-600 mb-4">What should students know before taking this course?</p>
              
              <div className="space-y-3">
                {courseData.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => handleArrayInputChange('requirements', index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Basic knowledge of..."
                    />
                    {courseData.requirements.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('requirements', index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => addArrayItem('requirements')}
                className="mt-3 flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Requirement</span>
              </button>
            </div>

            {/* Target Audience */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Target Audience</h2>
              <p className="text-gray-600 mb-4">Who is this course for?</p>
              
              <div className="space-y-3">
                {courseData.targetAudience.map((audience, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={audience}
                      onChange={(e) => handleArrayInputChange('targetAudience', index, e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Frontend developers wanting to..."
                    />
                    {courseData.targetAudience.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('targetAudience', index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={() => addArrayItem('targetAudience')}
                className="mt-3 flex items-center space-x-2 text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Target Audience</span>
              </button>
            </div>

            {/* Course Media */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Course Media</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Thumbnail
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleThumbnailUpload(e.target.files[0])}
                      className="hidden"
                      id="thumbnail-upload"
                    />
                    <label htmlFor="thumbnail-upload" className="cursor-pointer">
                      {courseData.thumbnail ? (
                        <img src={courseData.thumbnail} alt="Thumbnail" className="w-full h-32 object-cover rounded" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Image className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-600">Upload thumbnail</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Preview Video */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview Video
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleVideoUpload(e.target.files[0], 'preview')}
                      className="hidden"
                      id="preview-upload"
                    />
                    <label htmlFor="preview-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <PlayCircle className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Upload preview</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Structure */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Course Structure</h2>
                  <p className="text-gray-600">Organize your content into modules and lessons</p>
                </div>
                <button
                  onClick={() => setShowModuleModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Module</span>
                </button>
              </div>

              {courseData.modules.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h3>
                  <p className="text-gray-500 mb-4">Start by adding your first module</p>
                  <button
                    onClick={() => setShowModuleModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add First Module
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {courseData.modules.map((module, moduleIndex) => (
                    <div key={module._id} className="border border-gray-200 rounded-lg">
                      <div className="bg-gray-50 px-4 py-3 rounded-t-lg flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{module.title}</h3>
                          <p className="text-sm text-gray-600">{module.description}</p>
                          <p className="text-xs text-gray-500">{module.lessons.length} lessons</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setCurrentModuleIndex(moduleIndex);
                              setShowLessonModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeModule(module._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {module.lessons.length > 0 && (
                        <div className="p-4 space-y-3">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div key={lesson._id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg">
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
                                  <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                                  <p className="text-sm text-gray-600">{lesson.description}</p>
                                  <div className="flex items-center space-x-3 mt-1">
                                    <span className="text-xs text-gray-500 capitalize">{lesson.type}</span>
                                    {lesson.type === 'video' && lesson.videoDuration && (
                                      <span className="text-xs text-gray-500">
                                        {formatTime(lesson.videoDuration)}
                                      </span>
                                    )}
                                    {lesson.quiz && lesson.quiz.questions.length > 0 && (
                                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                                        Quiz ({lesson.quiz.questions.length} Q)
                                      </span>
                                    )}
                                    {lesson.assignment && lesson.assignment.title && (
                                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                                        Assignment
                                      </span>
                                    )}
                                    {lesson.resources && lesson.resources.length > 0 && (
                                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                        {lesson.resources.length} Resource{lesson.resources.length !== 1 ? 's' : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => removeLessonFromModule(moduleIndex, lesson._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => navigate('/instructor/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </div>

          {/* Sidebar Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Course Preview</h3>
                
                <div className="space-y-4">
                  <div>
                    <img 
                      src={courseData.thumbnail || 'https://via.placeholder.com/300x200?text=Course+Thumbnail'} 
                      alt="Course thumbnail" 
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">{courseData.title || 'Course Title'}</h4>
                    <p className="text-sm text-gray-600 mt-1">{courseData.description || 'Course description will appear here...'}</p>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{courseData.modules.length} modules</span>
                    <span className="mx-2">•</span>
                    <span>{courseData.modules.reduce((total, module) => total + module.lessons.length, 0)} lessons</span>
                  </div>
                  
                  <div>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      courseData.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                      courseData.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {courseData.level}
                    </span>
                  </div>
                  
                  {courseData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {courseData.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {tag}
                        </span>
                      ))}
                      {courseData.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{courseData.tags.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Module Creation Modal */}
        <AnimatePresence>
          {showModuleModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              >
                <h3 className="text-lg font-semibold mb-4">Add New Module</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Module Title</label>
                    <input
                      type="text"
                      value={newModule.title}
                      onChange={(e) => setNewModule(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Getting Started with React"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newModule.description}
                      onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of this module..."
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
        </AnimatePresence>

        {/* Lesson Creation Modal */}
        <AnimatePresence>
          {showLessonModal && currentModuleIndex !== null && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              >
                <h3 className="text-lg font-semibold mb-4">Add New Lesson</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Title</label>
                    <input
                      type="text"
                      value={newLesson.title}
                      onChange={(e) => setNewLesson(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., What is React and Why Use It?"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newLesson.description}
                      onChange={(e) => setNewLesson(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description of this lesson..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Type</label>
                    <select
                      value={newLesson.type}
                      onChange={(e) => setNewLesson(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="video">Video Lesson</option>
                      <option value="quiz">Quiz</option>
                      <option value="assignment">Assignment</option>
                      <option value="text">Text/Reading</option>
                    </select>
                  </div>

                  {/* Video specific fields */}
                  {newLesson.type === 'video' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Video Upload</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleVideoUpload(e.target.files[0], 'lesson')}
                            className="hidden"
                            id="lesson-video-upload"
                          />
                          <label htmlFor="lesson-video-upload" className="cursor-pointer">
                            <div className="flex flex-col items-center">
                              <Video className="w-8 h-8 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-600">Upload lesson video</span>
                            </div>
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Video Duration (seconds)</label>
                        <input
                          type="number"
                          value={newLesson.videoDuration}
                          onChange={(e) => setNewLesson(prev => ({ ...prev, videoDuration: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="900"
                        />
                      </div>
                    </div>
                  )}

                  {/* Quiz specific fields */}
                  {newLesson.type === 'quiz' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Time Limit (seconds)</label>
                          <input
                            type="number"
                            value={newLesson.quiz.timeLimit}
                            onChange={(e) => setNewLesson(prev => ({ 
                              ...prev, 
                              quiz: { ...prev.quiz, timeLimit: parseInt(e.target.value) || 300 }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Passing Score (%)</label>
                          <input
                            type="number"
                            value={newLesson.quiz.passingScore}
                            onChange={(e) => setNewLesson(prev => ({ 
                              ...prev, 
                              quiz: { ...prev.quiz, passingScore: parseInt(e.target.value) || 70 }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <label className="block text-sm font-medium text-gray-700">Quiz Questions</label>
                          <button
                            onClick={() => {
                              const newQuestion = {
                                id: Date.now(),
                                question: '',
                                options: ['', '', '', ''],
                                correctAnswer: 0
                              };
                              setNewLesson(prev => ({
                                ...prev,
                                quiz: {
                                  ...prev.quiz,
                                  questions: [...prev.quiz.questions, newQuestion]
                                }
                              }));
                            }}
                            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                          >
                            Add Question
                          </button>
                        </div>
                        
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {newLesson.quiz.questions.map((question, qIndex) => (
                            <div key={question.id} className="border border-gray-200 rounded p-3">
                              <input
                                type="text"
                                value={question.question}
                                onChange={(e) => {
                                  const updatedQuestions = [...newLesson.quiz.questions];
                                  updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], question: e.target.value };
                                  setNewLesson(prev => ({
                                    ...prev,
                                    quiz: { ...prev.quiz, questions: updatedQuestions }
                                  }));
                                }}
                                placeholder="Enter your question"
                                className="w-full px-3 py-2 border border-gray-300 rounded mb-2 text-sm"
                              />
                              
                              {question.options.map((option, oIndex) => (
                                <div key={oIndex} className="flex items-center space-x-2 mb-1">
                                  <input
                                    type="radio"
                                    name={`question-${qIndex}`}
                                    checked={question.correctAnswer === oIndex}
                                    onChange={() => {
                                      const updatedQuestions = [...newLesson.quiz.questions];
                                      updatedQuestions[qIndex] = { ...updatedQuestions[qIndex], correctAnswer: oIndex };
                                      setNewLesson(prev => ({
                                        ...prev,
                                        quiz: { ...prev.quiz, questions: updatedQuestions }
                                      }));
                                    }}
                                  />
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const updatedQuestions = [...newLesson.quiz.questions];
                                      updatedQuestions[qIndex].options[oIndex] = e.target.value;
                                      setNewLesson(prev => ({
                                        ...prev,
                                        quiz: { ...prev.quiz, questions: updatedQuestions }
                                      }));
                                    }}
                                    placeholder={`Option ${oIndex + 1}`}
                                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Assignment specific fields */}
                  {newLesson.type === 'assignment' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title</label>
                        <input
                          type="text"
                          value={newLesson.assignment.title}
                          onChange={(e) => setNewLesson(prev => ({ 
                            ...prev, 
                            assignment: { ...prev.assignment, title: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Create a Profile Card Component"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Description</label>
                        <textarea
                          value={newLesson.assignment.description}
                          onChange={(e) => setNewLesson(prev => ({ 
                            ...prev, 
                            assignment: { ...prev.assignment, description: e.target.value }
                          }))}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Detailed assignment requirements..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Max Score</label>
                          <input
                            type="number"
                            value={newLesson.assignment.maxScore}
                            onChange={(e) => setNewLesson(prev => ({ 
                              ...prev, 
                              assignment: { ...prev.assignment, maxScore: parseInt(e.target.value) || 100 }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                          <input
                            type="date"
                            value={newLesson.assignment.dueDate}
                            onChange={(e) => setNewLesson(prev => ({ 
                              ...prev, 
                              assignment: { ...prev.assignment, dueDate: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Text specific fields */}
                  {newLesson.type === 'text' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                      <textarea
                        value={newLesson.content}
                        onChange={(e) => setNewLesson(prev => ({ ...prev, content: e.target.value }))}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter lesson content..."
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowLessonModal(false);
                      setCurrentModuleIndex(null);
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => addLessonToModule(currentModuleIndex)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add Lesson
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CourseCreateStreamlined;
