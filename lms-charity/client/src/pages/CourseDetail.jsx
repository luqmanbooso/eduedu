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
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import VideoPlayer from '../components/VideoPlayer';
import CommentSection from '../components/CommentSection';
import { LoadingSpinner } from '../components/LoadingComponents';

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
      if (user) {
        checkEnrollment();
        fetchProgress();
      }
    }
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`/api/courses/${id}`);
      setCourse(response.data);
      if (response.data.lessons && response.data.lessons.length > 0) {
        setCurrentLesson(response.data.lessons[0]);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const response = await axios.get(`/api/courses/${id}/enrollment-status`);
      setEnrolled(response.data.enrolled);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await axios.get(`/api/progress/${id}`);
      setProgress(response.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please login to enroll in this course');
      return;
    }

    try {
      setEnrolling(true);
      await axios.post(`/api/courses/${id}/enroll`);
      setEnrolled(true);
      await fetchProgress();
      toast.success('Successfully enrolled in course!');
    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const markLessonComplete = async (lessonId) => {
    try {
      await axios.post('/api/progress/complete-lesson', {
        courseId: id,
        lessonId: lessonId,
        timeSpent: 30 // Sample time spent
      });
      await fetchProgress();
      toast.success('Lesson marked as complete!');
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      toast.error('Failed to mark lesson as complete');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Course Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The course you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            {currentLesson && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg"
              >
                <VideoPlayer
                  src={currentLesson.videoUrl}
                  poster={course.thumbnail}
                  title={currentLesson.title}
                />
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {currentLesson.title}
                    </h2>
                    {enrolled && !isLessonCompleted(currentLesson._id) && (
                      <button
                        onClick={() => markLessonComplete(currentLesson._id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                      >
                        <CheckCircle size={16} />
                        <span>Mark Complete</span>
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {currentLesson.description}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Course Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {course.title}
              </h1>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {course.rating?.average?.toFixed(1) || 'No ratings'} 
                    ({course.rating?.count || 0} reviews)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {course.enrolledStudents?.length || 0} students
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">
                    {course.totalDuration || 0} minutes
                  </span>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {course.description}
              </p>

              {/* Instructor Info */}
              <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <img
                  src={course.instructor?.avatar || '/api/placeholder/48/48'}
                  alt={course.instructor?.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {course.instructor?.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Course Instructor
                  </p>
                </div>
              </div>

              {/* Learning Outcomes */}
              {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    What you'll learn
                  </h3>
                  <ul className="space-y-2">
                    {course.learningOutcomes.map((outcome, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">{outcome}</span>
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
                      className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-sm"
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
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg sticky top-4"
            >
              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-green-600">FREE</span>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Full lifetime access
                </p>
              </div>

              {!enrolled ? (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                    <p className="text-green-600 font-semibold">You're enrolled!</p>
                  </div>
                  
                  {progress && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{progress.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${progress.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex space-x-2 mt-4">
                <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                  <Heart size={16} />
                  <span>Wishlist</span>
                </button>
                <button className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                  <Share2 size={16} />
                  <span>Share</span>
                </button>
              </div>
            </motion.div>

            {/* Course Content */}
            {course.lessons && course.lessons.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Course Content
                </h3>
                <div className="space-y-2">
                  {course.lessons.map((lesson, index) => (
                    <button
                      key={lesson._id}
                      onClick={() => setCurrentLesson(lesson)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        currentLesson?._id === lesson._id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {isLessonCompleted(lesson._id) ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Play className="w-5 h-5 text-gray-400" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {index + 1}. {lesson.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
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
