import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  FileText, 
  Upload, 
  ChevronDown, 
  ChevronRight,
  BookOpen,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Save,
  X,
  GripVertical,
  Video,
  HelpCircle,
  FileQuestion,
  Link,
  Image,
  File
} from 'lucide-react';
import axios from 'axios';

const CourseContentManager = ({ courseId, isOpen, onClose }) => {
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchCourseContent();
    }
  }, [isOpen, courseId]);

  const fetchCourseContent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/courses/${courseId}`);
      // Defensive: handle both {course: ...} and direct course object
      const courseData = response.data.course || response.data;
      if (!courseData) {
        console.warn('No course data found in response:', response.data);
        setCourse(null);
        setModules([]);
        return;
      }
      setCourse(courseData);
      setModules(courseData.modules || []);
    } catch (error) {
      console.error('Error fetching course content:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModuleExpansion = (moduleId) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleAddModule = () => {
    setSelectedModule(null);
    setShowModuleModal(true);
  };

  const handleEditModule = (module) => {
    setSelectedModule(module);
    setShowModuleModal(true);
  };

  const handleAddLesson = (moduleId) => {
    setSelectedModule({ _id: moduleId });
    setSelectedLesson(null);
    setShowLessonModal(true);
  };

  const handleEditLesson = (moduleId, lesson) => {
    setSelectedModule({ _id: moduleId });
    setSelectedLesson(lesson);
    setShowLessonModal(true);
  };

  const getLessonIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'quiz': return <HelpCircle className="w-4 h-4" />;
      case 'assignment': return <FileQuestion className="w-4 h-4" />;
      case 'text': return <FileText className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'video': return 'text-blue-600 bg-blue-50';
      case 'quiz': return 'text-purple-600 bg-purple-50';
      case 'assignment': return 'text-orange-600 bg-orange-50';
      case 'text': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl rounded-2xl border border-gray-100"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Course Content Manager</h2>
                  <p className="text-purple-100 mt-1">
                    {course?.title || 'Loading...'}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="flex h-[calc(95vh-120px)]">
            {/* Left Panel: Udemy-style curriculum tree */}
            <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight">Course Structure</h3>
                  <button
                    onClick={handleAddModule}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-full shadow hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Module</span>
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modules.map((module, moduleIndex) => (
                      <motion.div
                        key={module._id || `module-${moduleIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: moduleIndex * 0.1 }}
                        className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden"
                      >
                        {/* Module Header */}
                        <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-purple-50 group transition-colors">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleModuleExpansion(module._id)}
                              className="text-gray-400 hover:text-purple-600 transition-colors focus:outline-none"
                              title={expandedModules.has(module._id) ? 'Collapse' : 'Expand'}
                            >
                              {expandedModules.has(module._id) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                            <span className="text-xs font-semibold text-purple-600 bg-purple-50 rounded px-2 py-0.5">{moduleIndex + 1}</span>
                            <span className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">{module.title}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-400">{module.lessons?.length || 0} lessons</span>
                            <button
                              onClick={() => handleEditModule(module)}
                              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-purple-600 transition-colors"
                              title="Edit Module"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleAddLesson(module._id)}
                              className="p-1 rounded-full hover:bg-purple-100 text-purple-600 transition-colors"
                              title="Add Lesson"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {/* Module Content */}
                        <AnimatePresence>
                          {expandedModules.has(module._id) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="bg-gray-50 border-t border-gray-100"
                            >
                              {module.description && (
                                <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100 italic">{module.description}</div>
                              )}
                              {/* Lessons */}
                              <div className="px-2 py-2">
                                {module.lessons && module.lessons.length > 0 ? (
                                  <div className="space-y-1">
                                    {module.lessons.map((lesson, lessonIndex) => {
                                      if (!lesson._id) {
                                        console.warn('Lesson missing _id, using index as key:', lesson);
                                      }
                                      return (
                                        <div
                                          key={lesson._id || `lesson-${lessonIndex}`}
                                          className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-white border border-transparent hover:border-purple-200 cursor-pointer transition-colors group"
                                          onClick={() => handleEditLesson(module._id, lesson)}
                                        >
                                          <div className="flex items-center space-x-3">
                                            <div className={`p-1.5 rounded-lg ${getTypeColor(lesson.type)} shadow-sm`} title={lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}>
                                              {getLessonIcon(lesson.type)}
                                            </div>
                                            <div>
                                              <h4 className="font-medium text-gray-900 text-sm group-hover:text-purple-700 transition-colors">{lesson.title}</h4>
                                              <div className="flex items-center space-x-2 mt-0.5">
                                                <span className="text-xs text-gray-400 capitalize">{lesson.type}</span>
                                                {lesson.videoDuration && (
                                                  <span className="text-xs text-gray-400 flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {Math.floor(lesson.videoDuration / 60)}m
                                                  </span>
                                                )}
                                                {lesson.isPreview && (
                                                  <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">Preview</span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                            {lesson.isPublished ? (
                                              <CheckCircle className="w-4 h-4 text-green-500" title="Published" />
                                            ) : (
                                              <AlertCircle className="w-4 h-4 text-orange-500" title="Draft" />
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-center py-6 text-gray-400">
                                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-xs">No lessons yet</p>
                                    <button
                                      onClick={() => handleAddLesson(module._id)}
                                      className="text-purple-600 hover:text-purple-700 text-xs mt-2 transition-colors"
                                    >
                                      Add your first lesson
                                    </button>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                    {modules.length === 0 && (
                      <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No modules yet</h3>
                        <p className="text-gray-400 mb-4">Start building your course by adding your first module</p>
                        <button
                          onClick={handleAddModule}
                          className="inline-flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-full shadow hover:bg-purple-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Create First Module</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Udemy-style content editor/preview */}
            <div className="w-1/2 overflow-y-auto bg-gray-50 flex flex-col items-center justify-center">
              <div className="w-full max-w-xl p-8">
                <div className="bg-white rounded-2xl border border-gray-200 shadow p-8 min-h-[400px] flex flex-col items-center justify-center">
                  <FileText className="w-16 h-16 mb-4 text-gray-200" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select content to edit</h3>
                  <p className="text-gray-400 text-center">
                    Choose a module or lesson from the left panel to start editing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Modals */}
      <ModuleModal
        isOpen={showModuleModal}
        onClose={() => setShowModuleModal(false)}
        module={selectedModule}
        courseId={courseId}
        onSuccess={fetchCourseContent}
      />

      <LessonModal
        isOpen={showLessonModal}
        onClose={() => setShowLessonModal(false)}
        lesson={selectedLesson}
        moduleId={selectedModule?._id}
        courseId={courseId}
        onSuccess={fetchCourseContent}
      />
    </AnimatePresence>
  );
};

// Module Creation/Edit Modal
const ModuleModal = ({ isOpen, onClose, module, courseId, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    estimatedDuration: '',
    learningObjectives: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (module) {
      setFormData({
        title: module.title || '',
        description: module.description || '',
        estimatedDuration: module.estimatedDuration || '',
        learningObjectives: module.learningObjectives || []
      });
    } else {
      setFormData({
        title: '',
        description: '',
        estimatedDuration: '',
        learningObjectives: []
      });
    }
  }, [module]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = module 
        ? `/courses/${courseId}/modules/${module._id}`
        : `/courses/${courseId}/modules`;
      
      const method = module ? 'put' : 'post';
      
      await axios[method](url, formData);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving module:', error);
      setError(error.response?.data?.message || 'Failed to save module');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl rounded-2xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {module ? 'Edit Module' : 'Create New Module'}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Module Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter module title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Describe what students will learn in this module"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration (hours)
                </label>
                <input
                  type="number"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., 2.5"
                  min="0"
                  step="0.5"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    module ? 'Update Module' : 'Create Module'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Lesson Creation/Edit Modal
const LessonModal = ({ isOpen, onClose, lesson, moduleId, courseId, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    type: 'video',
    videoUrl: '',
    videoDuration: '',
    isPreview: false,
    isPublished: false
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title || '',
        description: lesson.description || '',
        content: lesson.content || '',
        type: lesson.type || 'video',
        videoUrl: lesson.videoUrl || '',
        videoDuration: lesson.videoDuration || '',
        isPreview: lesson.isPreview || false,
        isPublished: lesson.isPublished || false
      });
    } else {
      setFormData({
        title: '',
        description: '',
        content: '',
        type: 'video',
        videoUrl: '',
        videoDuration: '',
        isPreview: false,
        isPublished: false
      });
    }
  }, [lesson]);

  const handleVideoUpload = async (file) => {
    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('type', 'video');

      const response = await axios.post('/courses/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFormData({
        ...formData,
        videoUrl: response.data.data.url,
        videoDuration: response.data.data.duration || 0
      });
    } catch (error) {
      console.error('Video upload error:', error);
      setError('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = lesson 
        ? `/courses/${courseId}/modules/${moduleId}/lessons/${lesson._id}`
        : `/courses/${courseId}/modules/${moduleId}/lessons`;
      
      const method = lesson ? 'put' : 'post';
      
      await axios[method](url, formData);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving lesson:', error);
      setError(error.response?.data?.message || 'Failed to save lesson');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl rounded-2xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {lesson ? 'Edit Lesson' : 'Create New Lesson'}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter lesson title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="video">Video</option>
                    <option value="text">Text/Article</option>
                    <option value="quiz">Quiz</option>
                    <option value="assignment">Assignment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Describe what students will learn in this lesson"
                  required
                />
              </div>

              {formData.type === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video Content
                  </label>
                  {formData.videoUrl ? (
                    <div className="space-y-4">
                      <video 
                        src={formData.videoUrl} 
                        controls 
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, videoUrl: '', videoDuration: '' })}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove video
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Upload lesson video</p>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => e.target.files[0] && handleVideoUpload(e.target.files[0])}
                        className="hidden"
                        id="video-upload"
                        disabled={uploading}
                      />
                      <label
                        htmlFor="video-upload"
                        className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {uploading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Video
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>
              )}

              {(formData.type === 'text' || formData.type === 'assignment') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    placeholder="Enter lesson content, instructions, or assignment details"
                  />
                </div>
              )}

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPreview}
                    onChange={(e) => setFormData({ ...formData, isPreview: e.target.checked })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Free preview lesson</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Publish lesson</span>
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    lesson ? 'Update Lesson' : 'Create Lesson'
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CourseContentManager;
