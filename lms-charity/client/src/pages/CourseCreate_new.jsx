import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
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
  Rocket
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
    requirements: [''],
    targetAudience: [''],
    modules: []
  });

  // Form states
  const [newTag, setNewTag] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Modal states
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(null);

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
    content: ''
  });

  const steps = [
    { id: 1, title: 'Course Basics', icon: BookOpen },
    { id: 2, title: 'Learning Goals', icon: Target },
    { id: 3, title: 'Course Media', icon: Camera },
    { id: 4, title: 'Course Content', icon: Video },
    { id: 5, title: 'Publish', icon: Rocket }
  ];

  const categories = [
    'Programming', 'Web Development', 'Mobile Development', 'Data Science',
    'Machine Learning', 'DevOps', 'Cybersecurity', 'Cloud Computing',
    'Game Development', 'UI/UX Design', 'Business', 'Marketing',
    'Photography', 'Music', 'Art & Design', 'Health & Fitness'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

  // Step validation
  const isStepValid = (stepId) => {
    switch (stepId) {
      case 1:
        return courseData.title.trim() && courseData.description.trim();
      case 2:
        return courseData.learningOutcomes.some(o => o.trim()) && 
               courseData.requirements.some(r => r.trim()) && 
               courseData.targetAudience.some(a => a.trim());
      case 3:
        return courseData.thumbnail;
      case 4:
        return courseData.modules.length > 0 && courseData.modules.some(m => m.lessons.length > 0);
      case 5:
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
  const handleInputChange = (field, value) => {
    setCourseData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, value) => {
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

  // File upload
  const handleFileUpload = async (file, type) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const url = URL.createObjectURL(file);
      
      setTimeout(() => {
        setUploadProgress(100);
        
        if (type === 'thumbnail') {
          setCourseData(prev => ({ ...prev, thumbnail: url }));
          toast.success('Thumbnail uploaded!');
        } else if (type === 'preview') {
          setCourseData(prev => ({ ...prev, previewVideo: url }));
          toast.success('Preview video uploaded!');
        }
        
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      toast.error('Upload failed. Please try again.');
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
    if (workingLesson.title.trim() && currentModuleIndex !== null) {
      const newLesson = {
        _id: Date.now().toString(),
        title: workingLesson.title,
        description: workingLesson.description,
        type: workingLesson.type,
        order: courseData.modules[currentModuleIndex].lessons.length + 1,
        isCompleted: false
      };

      if (newLesson.type === 'video') {
        newLesson.videoDuration = workingLesson.videoDuration;
      } else if (newLesson.type === 'text') {
        newLesson.content = workingLesson.content;
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
        videoDuration: 0,
        content: ''
      });

      setShowLessonModal(false);
      setCurrentModuleIndex(null);
      toast.success('Lesson added!');
    }
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
        requirements: courseData.requirements.filter(req => req.trim()),
        targetAudience: courseData.targetAudience.filter(audience => audience.trim()),
        status: 'draft',
        isPublished: false
      };

      const response = await axios.post('/api/courses', coursePayload, {
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

  // Step components
  const StepBasics = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's start with the basics</h2>
        <p className="text-gray-600">Give your course a compelling title and description</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Course Title</label>
          <input
            type="text"
            value={courseData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            placeholder="e.g., Complete React Development Masterclass 2024"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Course Description</label>
          <textarea
            value={courseData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe what students will learn and achieve in this course..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
            <select
              value={courseData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Level</label>
            <select
              value={courseData.level}
              onChange={(e) => handleInputChange('level', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Tags</label>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
  );

  const StepLearningGoals = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Define your learning goals</h2>
        <p className="text-gray-600">Help students understand what they'll gain from your course</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Learning Outcomes */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Outcomes</h3>
          <p className="text-gray-600 mb-4">What will students be able to do after completing this course?</p>
          <div className="space-y-3">
            {courseData.learningOutcomes.map((outcome, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={outcome}
                  onChange={(e) => handleArrayChange('learningOutcomes', index, e.target.value)}
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
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
          <p className="text-gray-600 mb-4">What should students know before taking this course?</p>
          <div className="space-y-3">
            {courseData.requirements.map((requirement, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={requirement}
                  onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
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
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Audience</h3>
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
                  onChange={(e) => handleArrayChange('targetAudience', index, e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Developers wanting to..."
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
      </div>
    </div>
  );

  const StepMedia = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add course media</h2>
        <p className="text-gray-600">Upload a thumbnail and preview video to showcase your course</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Thumbnail */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Thumbnail</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files[0], 'thumbnail')}
              className="hidden"
              id="thumbnail-upload"
            />
            <label htmlFor="thumbnail-upload" className="cursor-pointer block">
              {courseData.thumbnail ? (
                <img src={courseData.thumbnail} alt="Thumbnail" className="w-full h-48 object-cover rounded-lg mb-4" />
              ) : (
                <div className="mb-4">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Click to upload thumbnail</p>
                  <p className="text-sm text-gray-500 mt-2">Recommended: 1920x1080 pixels</p>
                </div>
              )}
              {isUploading && (
                <div className="mt-4">
                  <div className="bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Preview Video */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview Video (Optional)</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleFileUpload(e.target.files[0], 'preview')}
              className="hidden"
              id="preview-upload"
            />
            <label htmlFor="preview-upload" className="cursor-pointer block">
              {courseData.previewVideo ? (
                <div className="mb-4">
                  <video src={courseData.previewVideo} className="w-full h-48 object-cover rounded-lg" controls />
                </div>
              ) : (
                <div className="mb-4">
                  <PlayCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Click to upload preview video</p>
                  <p className="text-sm text-gray-500 mt-2">Keep it under 2 minutes</p>
                </div>
              )}
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const StepContent = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create your course content</h2>
        <p className="text-gray-600">Organize your content into modules and lessons</p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Course Modules</h3>
          <button
            onClick={() => setShowModuleModal(true)}
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
              onClick={() => setShowModuleModal(true)}
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
                        setCurrentModuleIndex(moduleIndex);
                        setShowLessonModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeModule(module._id)}
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
                          onClick={() => removeLesson(moduleIndex, lesson._id)}
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

  const StepReview = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to publish?</h2>
        <p className="text-gray-600">Review your course details and publish when ready</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Course Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Title:</span>
              <span className="font-medium">{courseData.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Category:</span>
              <span className="font-medium">{courseData.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Level:</span>
              <span className="font-medium">{courseData.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Modules:</span>
              <span className="font-medium">{courseData.modules.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Lessons:</span>
              <span className="font-medium">{courseData.modules.reduce((total, module) => total + module.lessons.length, 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Publishing Guidelines</h4>
              <p className="text-blue-700 text-sm mt-1">
                Your course will be saved as a draft. You can edit it anytime before publishing to students.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <StepBasics />;
      case 2: return <StepLearningGoals />;
      case 3: return <StepMedia />;
      case 4: return <StepContent />;
      case 5: return <StepReview />;
      default: return <StepBasics />;
    }
  };

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
              className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-semibold mb-4">Add New Lesson</h3>
              
              <div className="space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={workingLesson.description}
                    onChange={(e) => setWorkingLesson(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of this lesson..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lesson Type</label>
                  <select
                    value={workingLesson.type}
                    onChange={(e) => setWorkingLesson(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="video">Video Lesson</option>
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                    <option value="text">Text/Reading</option>
                  </select>
                </div>

                {workingLesson.type === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Video Duration (seconds)</label>
                    <input
                      type="number"
                      value={workingLesson.videoDuration}
                      onChange={(e) => setWorkingLesson(prev => ({ ...prev, videoDuration: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="900"
                    />
                  </div>
                )}

                {workingLesson.type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <textarea
                      value={workingLesson.content}
                      onChange={(e) => setWorkingLesson(prev => ({ ...prev, content: e.target.value }))}
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
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addLesson}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
