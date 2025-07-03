import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  Share2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import VideoPlayer from '../components/VideoPlayer';
import CommentSection from '../components/CommentSection';
import { LoadingSpinner } from '../components/LoadingComponents';
import { courseAPI, enrollmentAPI, enhancedCourseAPI } from '../services/api';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [progress, setProgress] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

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
      const response = await enrollmentAPI.updateLessonProgress(id, lessonId, {
        timeSpent: 30, // You can track actual time spent
        completed: true
      });
      
      if (response.success) {
        setProgress(response.data.progress);
        toast.success('Lesson marked as complete!');
      }
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      toast.error('Failed to update progress');
    }
  };

  const handleWishlist = () => {
    toast.success('Added to wishlist!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course.title,
        text: course.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Course link copied to clipboard!');
    }
  };

  const isLessonCompleted = (lessonId) => {
    return progress?.completedLessons?.some(
      completion => completion.lesson === lessonId
    );
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
            {/* Video Player */}
            {currentLesson && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <VideoPlayer
                  src={currentLesson.videoUrl}
                  poster={course.thumbnail}
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
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                  <span className="text-gray-600 font-serif">
                    {course.rating?.average?.toFixed(1) || 'No ratings'} 
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
                    {course.totalDuration || 0} minutes
                  </span>
                </div>
              </div>

              <p className="text-gray-600 mb-6 font-serif">
                {course.description}
              </p>

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
            {/* Enrollment Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 sticky top-4"
            >
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
                  className="w-full bg-purple-600 text-white py-3 px-4 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-serif font-semibold"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </motion.button>
              ) : (
                <div className="space-y-4">
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

              <div className="flex space-x-2 mt-4">
                <motion.button 
                  onClick={handleWishlist}
                  whileHover={{ scale: 1.02 }}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 hover:bg-gray-50 transition-colors font-serif"
                >
                  <Heart size={16} />
                  <span>Wishlist</span>
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
            </motion.div>

            {/* Course Content */}
            {course.lessons && course.lessons.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <h3 className="text-lg font-semibold text-black mb-4 font-serif">
                  Course Content
                </h3>
                <div className="space-y-2">
                  {course.lessons.map((lesson, index) => (
                    <button
                      key={lesson._id}
                      onClick={() => setCurrentLesson(lesson)}
                      className={`w-full text-left p-3 border transition-colors font-serif ${
                        currentLesson?._id === lesson._id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {isLessonCompleted(lesson._id) ? (
                          <CheckCircle className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Play className="w-5 h-5 text-gray-400" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-black font-serif">
                            {index + 1}. {lesson.title}
                          </h4>
                          <p className="text-sm text-gray-600 font-serif">
                            {lesson.duration} minutes
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
