import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Download, 
  Star, 
  Clock, 
  Users, 
  Award, 
  BookOpen,
  CheckCircle,
  Heart,
  Share2,
  Video,
  Calendar,
  Eye,
  Camera,
  X,
  User,
  Globe,
  Target,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import VideoPlayer from '../components/VideoPlayer';
import CommentSection from '../components/CommentSection';
import { LoadingSpinner } from '../components/LoadingComponents';
import { courseAPI, enrollmentAPI, enhancedCourseAPI, wishlistAPI, progressAPI } from '../services/api';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [showPreviewVideo, setShowPreviewVideo] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourse();
      checkWishlistStatus();
    }
  }, [id, user]);

  const checkWishlistStatus = async () => {
    if (!user || !id) return;
    
    try {
      const response = await wishlistAPI.checkWishlist(id);
      setIsInWishlist(response.isInWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      // If there's an error checking, default to false
      setIsInWishlist(false);
    }
  };

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await enhancedCourseAPI.getCourseWithEnrollment(id);
      setCourse(response.course || response);
      setEnrolled(response.enrollment?.isEnrolled || false);
      
      if (response.course?.lessons && response.course.lessons.length > 0) {
        setCurrentLesson(response.course.lessons[0]);
      } else if (response.lessons && response.lessons.length > 0) {
        setCurrentLesson(response.lessons[0]);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Course not found or failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please login to enroll in this course');
      return;
    }

    try {
      setEnrolling(true);
      const response = await enrollmentAPI.enrollInCourse(id);
      if (response.success) {
        setEnrolled(true);
        toast.success('Successfully enrolled in course!');
        // Refresh course data to get updated enrollment status
        await fetchCourse();
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      const errorMessage = error.response?.data?.message || 'Failed to enroll in course';
      toast.error(errorMessage);
    } finally {
      setEnrolling(false);
    }
  };

  const markLessonComplete = async (lessonId) => {
    try {
      const response = await progressAPI.markLessonComplete(id, lessonId, 30); // 30 minutes default
      
      if (response) {
        // Update progress state
        setProgress(prev => ({
          ...prev,
          progressPercentage: response.progress,
          isCompleted: response.isCompleted
        }));
        
        // Refresh course data to get updated progress
        await fetchCourse();
        
        toast.success('Lesson marked as complete!');
        
        // If course is completed, show completion message
        if (response.isCompleted) {
          toast.success('🎉 Congratulations! You have completed the course!');
        }
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      toast.error('Failed to update progress');
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add courses to your wishlist');
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        // Remove from wishlist
        await wishlistAPI.removeFromWishlist(id);
        setIsInWishlist(false);
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
        await wishlistAPI.addToWishlist(id);
        setIsInWishlist(true);
        toast.success('Added to wishlist!');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      toast.error(error.response?.data?.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: course.title,
      text: `Check out this course: ${course.title}`,
      url: window.location.href,
    };

    try {
      // Check if native sharing is available
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Course shared successfully!');
      } else {
        // Fallback to clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Course link copied to clipboard!');
        } catch (clipboardError) {
          // Final fallback - show share modal
          setShowShareModal(true);
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        // User cancelled sharing, try clipboard
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast.success('Course link copied to clipboard!');
        } catch (clipboardError) {
          // Final fallback - show share modal
          setShowShareModal(true);
        }
      }
    }
  };

  const handlePreviewClick = () => {
    if (course.previewVideo?.url) {
      setShowPreviewVideo(true);
    }
  };

  const isLessonCompleted = (lessonId) => {
    return progress?.completedLessons?.includes(lessonId) || false;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-2">
            Course Not Found
          </h2>
          <p className="text-gray-600">
            The course you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Preview Section */}
            {!enrolled && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {/* Preview Video or Image */}
                <div className="relative">
                  {course.previewVideo?.url ? (
                    <VideoPlayer
                      src={course.previewVideo.url}
                      poster={course.thumbnail?.url || '/api/placeholder/800/450'}
                      title={`${course.title} - Course Preview`}
                    />
                  ) : course.thumbnail?.url ? (
                    <div className="relative group cursor-pointer" onClick={() => setShowPreviewModal(true)}>
                      <img
                        src={course.thumbnail.url}
                        alt={`${course.title} preview`}
                        className="w-full h-96 object-cover"
                      />
                      {/* Overlay for image preview */}
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="text-center">
                          <div className="bg-white bg-opacity-90 rounded-full p-4 mb-4">
                            <Eye className="w-8 h-8 text-purple-600 mx-auto" />
                          </div>
                          <p className="text-white font-medium">Click to view full preview</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-96 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                        <p className="text-purple-600 font-medium">Course Preview Coming Soon</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Preview Section Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-black font-serif">
                      {course.previewVideo?.url ? 'Course Preview Video' : 'Course Preview'}
                    </h2>
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 text-sm font-medium">
                      FREE PREVIEW
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2 font-serif">
                    {course.previewVideo?.url 
                      ? 'Watch this preview to get a taste of what you\'ll learn in this course. This preview gives you an overview of the content and teaching style.'
                      : 'This preview image gives you a glimpse of the course content and style. Click to view the full preview.'
                    }
                  </p>
                  
                  {/* Preview Stats */}
                  <div className="flex items-center space-x-6 mt-4 text-sm text-gray-500">
                    {course.previewVideo?.duration && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{Math.round(course.previewVideo.duration / 60)} min preview</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      <span>Free to watch</span>
                    </div>
                    <div className="flex items-center">
                      <Play className="w-4 h-4 mr-1" />
                      <span>HD Quality</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Current Lesson Video Player */}
            {enrolled && currentLesson && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <VideoPlayer
                  src={currentLesson.videoUrl}
                  poster={course.thumbnail?.url || '/api/placeholder/800/450'}
                  title={currentLesson.title}
                />
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-black font-serif">
                      {currentLesson.title}
                    </h2>
                    {enrolled && !isLessonCompleted(currentLesson._id) && (
                      <motion.button
                        onClick={() => markLessonComplete(currentLesson._id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 flex items-center space-x-2 transition-colors font-serif font-semibold"
                      >
                        <CheckCircle size={16} />
                        <span>Mark Complete</span>
                      </motion.button>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2 font-serif">
                    {currentLesson.description}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Course Hero Image for non-enrolled users without preview video */}
            {!enrolled && !course.previewVideo?.url && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="relative">
                  <img 
                    src={course.thumbnail?.url || '/api/placeholder/800/450'} 
                    alt={course.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-white text-2xl font-bold font-serif mb-2">
                      {course.title}
                    </h2>
                    <p className="text-white/90 text-sm font-serif">
                      {course.shortDescription}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Course Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <h1 className="text-3xl font-bold text-black mb-4 font-serif">
                {course.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                  <span className="text-gray-600 font-serif">
                    {typeof course.rating?.average === 'number' ? course.rating.average.toFixed(1) : 'No ratings'}
                    ({course.rating?.count || 0} reviews)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600 font-serif">
                    {course.enrolledStudents?.length || 0} students
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600 font-serif">
                    {course.duration || course.estimatedDuration || 0} hours total
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600 font-serif">
                    {course.level || 'All levels'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600 font-serif">
                    {course.language || 'English'}
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-6 font-serif">
                {course.description}
              </p>

              {/* Course Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 border border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 font-serif">
                    {course.modules?.length || course.lessons?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600 font-serif">
                    {course.modules?.length ? 'Modules' : 'Lessons'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 font-serif">
                    {course.estimatedCompletionTime || `${course.duration || 0}h`}
                  </div>
                  <div className="text-sm text-gray-600 font-serif">
                    Duration
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 font-serif">
                    {course.certificate?.isAvailable ? 'Yes' : 'No'}
                  </div>
                  <div className="text-sm text-gray-600 font-serif">
                    Certificate
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 font-serif">
                    {course.liveSessions?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600 font-serif">
                    Live Sessions
                  </div>
                </div>
              </div>

              {/* Instructor Info */}
              <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-serif font-bold text-lg">
                  {course.instructor?.name?.charAt(0)?.toUpperCase() || 'I'}
                </div>
                <div>
                  <h3 className="font-semibold text-black font-serif">
                    {course.instructor?.name}
                  </h3>
                  <p className="text-gray-600 text-sm font-serif">
                    Course Instructor
                  </p>
                </div>
              </div>

              {/* Learning Outcomes */}
              {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black mb-3 font-serif">
                    What you'll learn
                  </h3>
                  <ul className="space-y-2">
                    {course.learningOutcomes.map((outcome, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 font-serif">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Course Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black mb-3 font-serif">
                    Requirements
                  </h3>
                  <ul className="space-y-2">
                    {course.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600 font-serif">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Target Audience */}
              {course.targetAudience && course.targetAudience.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black mb-3 font-serif">
                    Who this course is for
                  </h3>
                  <ul className="space-y-2">
                    {course.targetAudience.map((audience, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600 font-serif">{audience}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Course Curriculum/Modules */}
              {course.modules && course.modules.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-black mb-3 font-serif">
                    Course Curriculum
                  </h3>
                  <div className="space-y-4">
                    {course.modules.map((module, moduleIndex) => (
                      <div key={module._id || moduleIndex} className="border border-gray-200 rounded-lg">
                        <div className="p-4 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-black font-serif">
                              Module {moduleIndex + 1}: {module.title}
                            </h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="font-serif">
                                {module.lessons?.length || 0} lessons
                              </span>
                              {module.estimatedDuration && (
                                <span className="font-serif">
                                  {module.estimatedDuration}h
                                </span>
                              )}
                            </div>
                          </div>
                          {module.description && (
                            <p className="text-gray-600 mt-2 font-serif">
                              {module.description}
                            </p>
                          )}
                        </div>
                        {module.lessons && module.lessons.length > 0 && (
                          <div className="p-4 space-y-2">
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div key={lesson._id || lessonIndex} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                                <Play className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-700 font-serif flex-1">
                                  {lesson.title}
                                </span>
                                <span className="text-sm text-gray-500 font-serif">
                                  {lesson.duration || 0} min
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificate Information */}
              {course.certificate?.isAvailable && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Award className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-semibold text-black font-serif">
                      Certificate of Completion
                    </h3>
                  </div>
                  <p className="text-gray-600 font-serif mb-2">
                    Earn a certificate upon successful completion of this course.
                  </p>
                  <div className="text-sm text-gray-600 font-serif">
                    <p>Requirements:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Complete {course.certificate.requirements?.completionPercentage || 100}% of course content</li>
                      <li>Achieve minimum score of {course.certificate.requirements?.minimumScore || 70}% on assessments</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Tags */}
              {course.tags && course.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-serif"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Comments Section */}
            <CommentSection courseId={id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Preview Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 sticky top-4"
            >
              {/* Course Thumbnail */}
              <div 
                className="relative group cursor-pointer"
                onClick={course.previewVideo?.url ? handlePreviewClick : () => setShowPreviewModal(true)}
              >
                <img 
                  src={course.thumbnail?.url || '/api/placeholder/400/225'} 
                  alt={course.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {course.previewVideo?.url ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 group-hover:bg-opacity-60 transition-all duration-300">
                    <div className="bg-white bg-opacity-90 hover:bg-opacity-100 transition-all duration-300 p-4 rounded-full">
                      <Play className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all duration-300 opacity-0 group-hover:opacity-100">
                    <div className="bg-white bg-opacity-90 hover:bg-opacity-100 transition-all duration-300 p-3 rounded-full">
                      <Eye className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                )}
                {course.previewVideo?.url && (
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 text-xs font-medium rounded">
                    Video Preview
                  </div>
                )}
                {!course.previewVideo?.url && course.thumbnail?.url && (
                  <div className="absolute bottom-2 left-2 bg-purple-600 text-white px-2 py-1 text-xs font-medium rounded">
                    Click to Enlarge
                  </div>
                )}
                {!course.thumbnail?.url && (
                  <div className="absolute bottom-2 left-2 bg-gray-600 text-white px-2 py-1 text-xs font-medium rounded">
                    No Preview
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="text-center mb-6">
                  <span className="text-3xl font-bold text-purple-600 font-serif">FREE</span>
                  <p className="text-gray-600 text-sm font-serif">
                    Full lifetime access
                  </p>
                </div>

                {!enrolled ? (
                  <motion.button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-purple-600 text-white py-3 px-4 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-serif font-semibold mb-4"
                  >
                    {enrolling ? 'Enrolling...' : 'Enroll Now'}
                  </motion.button>
                ) : (
                  <div className="space-y-4 mb-4">
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                      <p className="text-purple-600 font-semibold font-serif">You're enrolled!</p>
                    </div>
                    
                    {progress && (
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-serif">Progress</span>
                          <span className="font-serif">{progress.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2">
                          <div
                            className="bg-purple-600 h-2 transition-all duration-500"
                            style={{ width: `${progress.progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-2 mb-4">
                  <motion.button 
                    onClick={handleWishlist}
                    disabled={wishlistLoading}
                    whileHover={{ scale: 1.02 }}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 border transition-colors font-serif disabled:opacity-50 disabled:cursor-not-allowed ${
                      isInWishlist 
                        ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Heart 
                      size={16} 
                      className={isInWishlist ? 'fill-current' : ''} 
                    />
                    <span>{wishlistLoading ? 'Loading...' : (isInWishlist ? 'In Wishlist' : 'Add to Wishlist')}</span>
                  </motion.button>
                  <motion.button 
                    onClick={handleShare}
                    whileHover={{ scale: 1.02 }}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 hover:bg-gray-50 transition-colors font-serif"
                  >
                    <Share2 size={16} />
                    <span>Share</span>
                  </motion.button>
                </div>

                {/* Course Features */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-black mb-3 font-serif">This course includes:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center space-x-2">
                      <Video className="w-4 h-4 text-gray-500" />
                      <span className="font-serif">
                        {course.duration || course.estimatedDuration || 0} hours on-demand video
                      </span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      <span className="font-serif">
                        {course.modules?.length || course.lessons?.length || 0} {course.modules?.length ? 'modules' : 'lessons'}
                      </span>
                    </li>
                    {course.certificate?.isAvailable && (
                      <li className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-gray-500" />
                        <span className="font-serif">Certificate of completion</span>
                      </li>
                    )}
                    <li className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-serif">Full lifetime access</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="font-serif">Access on mobile and desktop</span>
                    </li>
                    {course.liveSessions && course.liveSessions.length > 0 && (
                      <li className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-serif">{course.liveSessions.length} live sessions</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Preview Video Modal */}
      <AnimatePresence>
        {showPreviewVideo && course.previewVideo?.url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreviewVideo(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <VideoPlayer
                  src={course.previewVideo.url}
                  poster={course.thumbnail?.url || '/api/placeholder/800/450'}
                  title={`${course.title} - Preview`}
                  autoPlay={true}
                />
                <button
                  onClick={() => setShowPreviewVideo(false)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Course Preview: {course.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {course.shortDescription}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {course.estimatedDuration || 'Duration not specified'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {course.enrolledStudents?.length || 0} students
                      </span>
                    </div>
                  </div>
                  {!enrolled && (
                    <motion.button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Now'}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Preview Image Modal */}
        {showPreviewModal && course.thumbnail?.url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={course.thumbnail.url}
                  alt={`${course.title} preview`}
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                >
                  <span className="sr-only">Close</span>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Course Preview: {course.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {course.shortDescription}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {course.estimatedDuration || 'Duration not specified'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {course.enrolledStudents?.length || 0} students
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">
                        {course.level || 'All Levels'}
                      </span>
                    </div>
                  </div>
                  {!enrolled && (
                    <motion.button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                      {enrolling ? 'Enrolling...' : 'Enroll Now'}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseDetail;
