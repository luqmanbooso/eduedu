import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  Settings
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const CourseCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    thumbnail: '',
    price: 0,
    tags: [],
    learningOutcomes: [''],
    requirements: [''],
    lessons: []
  });

  const [newTag, setNewTag] = useState('');
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    videoUrl: '',
    duration: '',
    resources: []
  });

  const categories = [
    'Data Science',
    'Software Engineering', 
    'IoT & Hardware',
    'Digital Marketing',
    'Design',
    'Business'
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  const steps = [
    { id: 1, title: 'Basic Info', icon: FileText },
    { id: 2, title: 'Content', icon: Video },
    { id: 3, title: 'Media', icon: Image },
    { id: 4, title: 'Settings', icon: Settings }
  ];

  const handleInputChange = (field, value) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value
    }));
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
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

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

  const addLesson = () => {
    if (newLesson.title.trim()) {
      setCourseData(prev => ({
        ...prev,
        lessons: [...prev.lessons, { ...newLesson, id: Date.now() }]
      }));
      setNewLesson({
        title: '',
        description: '',
        videoUrl: '',
        duration: '',
        resources: []
      });
    }
  };

  const removeLesson = (lessonId) => {
    setCourseData(prev => ({
      ...prev,
      lessons: prev.lessons.filter(lesson => lesson.id !== lessonId)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/courses', courseData);
      toast.success('Course created successfully!');
      navigate('/instructor/dashboard');
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (activeStep < steps.length) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/instructor/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </motion.button>
          </div>
          
          <h1 className="text-4xl font-bold text-black mb-2 font-serif">
            Create New Course
          </h1>
          <p className="text-lg text-gray-600">
            Build and publish your course to reach thousands of learners worldwide
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              const isCompleted = activeStep > step.id;
              
              return (
                <div
                  key={step.id}
                  className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 flex items-center justify-center border-2 transition-colors ${
                        isActive
                          ? 'border-purple-600 bg-purple-600 text-white'
                          : isCompleted
                          ? 'border-purple-600 bg-purple-600 text-white'
                          : 'border-gray-300 bg-white text-gray-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="hidden sm:block">
                      <p className={`text-sm font-medium ${isActive || isCompleted ? 'text-purple-600' : 'text-gray-500'}`}>
                        Step {step.id}
                      </p>
                      <p className={`text-xs ${isActive || isCompleted ? 'text-black' : 'text-gray-400'}`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-purple-600' : 'bg-gray-300'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Form Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white border border-gray-200 p-8 shadow-sm"
        >
          {/* Step 1: Basic Info */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-black mb-6">Basic Course Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Title *</label>
                <input
                  type="text"
                  value={courseData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Enter course title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Description *</label>
                <textarea
                  value={courseData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Describe what students will learn in this course"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={courseData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                  <select
                    value={courseData.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  >
                    {difficulties.map(diff => (
                      <option key={diff.value} value={diff.value}>{diff.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Learning Outcomes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Learning Outcomes</label>
                <p className="text-sm text-gray-500 mb-3">What will students learn from this course?</p>
                {courseData.learningOutcomes.map((outcome, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => handleArrayInputChange('learningOutcomes', index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Students will be able to..."
                    />
                    {courseData.learningOutcomes.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('learningOutcomes', index)}
                        className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('learningOutcomes')}
                  className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Learning Outcome</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Content */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-black mb-6">Course Content</h2>
              
              {/* Add Lesson */}
              <div className="bg-gray-50 p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-black mb-4">Add New Lesson</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newLesson.title}
                    onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Lesson title"
                  />
                  <textarea
                    value={newLesson.description}
                    onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Lesson description"
                    rows={3}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={newLesson.videoUrl}
                      onChange={(e) => setNewLesson({...newLesson, videoUrl: e.target.value})}
                      className="px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Video URL"
                    />
                    <input
                      type="text"
                      value={newLesson.duration}
                      onChange={(e) => setNewLesson({...newLesson, duration: e.target.value})}
                      className="px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Duration (e.g., 15 minutes)"
                    />
                  </div>
                  <button
                    onClick={addLesson}
                    className="px-6 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                  >
                    Add Lesson
                  </button>
                </div>
              </div>

              {/* Lessons List */}
              {courseData.lessons.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-black mb-4">Course Lessons</h3>
                  <div className="space-y-3">
                    {courseData.lessons.map((lesson, index) => (
                      <div key={lesson.id} className="flex items-center justify-between p-4 bg-white border border-gray-200">
                        <div>
                          <h4 className="font-medium text-black">{lesson.title}</h4>
                          <p className="text-sm text-gray-600">{lesson.description}</p>
                          <p className="text-xs text-gray-500">{lesson.duration}</p>
                        </div>
                        <button
                          onClick={() => removeLesson(lesson.id)}
                          className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Media */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-black mb-6">Course Media</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Thumbnail URL</label>
                <input
                  type="text"
                  value={courseData.thumbnail}
                  onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Tags</label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Add a tag"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {courseData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-purple-500 hover:text-purple-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Settings */}
          {activeStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-black mb-6">Course Settings</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={courseData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Set to $0 for free courses</p>
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Requirements</label>
                <p className="text-sm text-gray-500 mb-3">What prerequisites should students have?</p>
                {courseData.requirements.map((requirement, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={requirement}
                      onChange={(e) => handleArrayInputChange('requirements', index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                      placeholder="Basic programming knowledge, etc."
                    />
                    {courseData.requirements.length > 1 && (
                      <button
                        onClick={() => removeArrayItem('requirements', index)}
                        className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('requirements')}
                  className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Requirement</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={activeStep === 1}
              className={`px-6 py-3 border border-gray-300 font-medium transition-colors ${
                activeStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>

            <div className="flex space-x-3">
              {activeStep < steps.length ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Creating...' : 'Create Course'}</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CourseCreate;
