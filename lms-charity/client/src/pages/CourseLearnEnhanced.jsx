import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  SkipBack,
  SkipForward,
  BookOpen,
  CheckCircle,
  Clock,
  Download,
  MessageSquare,
  FileText,
  Brain,
  Target,
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Star,
  Flag,
  Share2,
  Bookmark,
  Eye,
  EyeOff,
  RotateCcw,
  FastForward,
  Rewind,
  HelpCircle,
  Send,
  ThumbsUp,
  ThumbsDown,
  Lock,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CourseLearnEnhanced = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef(null);
  
  // State management
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [lessonProgress, setLessonProgress] = useState({});
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [showDiscussion, setShowDiscussion] = useState(false);
  const [discussionMessages, setDiscussionMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [quizData, setQuizData] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [assignmentData, setAssignmentData] = useState(null);

  // Mock data - replace with API calls
  useEffect(() => {
    setTimeout(() => {
      const mockCourse = {
        _id: courseId,
        title: 'Complete React Development Masterclass 2024',
        description: 'Master React from beginner to advanced level',
        instructor: {
          name: 'John Smith',
          avatar: ''
        },
        progress: 45,
        modules: [
          {
            _id: 'mod1',
            title: 'Getting Started with React',
            order: 1,
            lessons: [
              {
                _id: 'lesson1',
                title: 'What is React and Why Use It?',
                description: 'Understanding React fundamentals and its ecosystem',
                type: 'video',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                videoDuration: 900,
                order: 1,
                isCompleted: true,
                resources: [
                  { title: 'React Official Documentation', url: '#', type: 'link' },
                  { title: 'Course Slides PDF', url: '#', type: 'pdf' }
                ]
              },
              {
                _id: 'lesson2',
                title: 'Setting Up Development Environment',
                description: 'Install Node.js, Create React App, and essential tools',
                type: 'video',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                videoDuration: 720,
                order: 2,
                isCompleted: false,
                resources: []
              },
              {
                _id: 'lesson3',
                title: 'React Fundamentals Quiz',
                description: 'Test your understanding of React basics',
                type: 'quiz',
                order: 3,
                isCompleted: false,
                quiz: {
                  questions: [
                    {
                      id: 1,
                      question: 'What is React?',
                      options: [
                        'A JavaScript library for building user interfaces',
                        'A database management system',
                        'A CSS framework',
                        'A web server'
                      ],
                      correctAnswer: 0
                    },
                    {
                      id: 2,
                      question: 'Which method is used to render React components?',
                      options: ['render()', 'display()', 'show()', 'create()'],
                      correctAnswer: 0
                    }
                  ],
                  timeLimit: 300,
                  passingScore: 70
                }
              }
            ]
          },
          {
            _id: 'mod2',
            title: 'JSX and Components',
            order: 2,
            lessons: [
              {
                _id: 'lesson4',
                title: 'Understanding JSX',
                description: 'Learn JSX syntax and best practices',
                type: 'video',
                videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                videoDuration: 1080,
                order: 1,
                isCompleted: false,
                resources: []
              },
              {
                _id: 'lesson5',
                title: 'Component Assignment',
                description: 'Build your first React component',
                type: 'assignment',
                order: 2,
                isCompleted: false,
                assignment: {
                  title: 'Create a Profile Card Component',
                  description: 'Build a reusable profile card component that displays user information including name, avatar, bio, and social links.',
                  instructions: [
                    'Create a new React component called ProfileCard',
                    'Accept props for name, avatar, bio, and social links',
                    'Style the component using CSS modules or styled-components',
                    'Make the component responsive',
                    'Add hover effects and animations'
                  ],
                  dueDate: '2024-02-01',
                  maxScore: 100,
                  submissionType: 'both'
                }
              }
            ]
          }
        ]
      };

      setCourse(mockCourse);
      setCurrentModule(mockCourse.modules[0]);
      setCurrentLesson(mockCourse.modules[0].lessons[0]);
      setCompletedLessons(['lesson1']);
      setLoading(false);
    }, 1000);
  }, [courseId]);

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoMuted;
      setVideoMuted(!videoMuted);
    }
  };

  const handleProgressChange = (e) => {
    const video = videoRef.current;
    if (video) {
      const clickX = e.nativeEvent.offsetX;
      const width = e.target.offsetWidth;
      const newTime = (clickX / width) * videoDuration;
      video.currentTime = newTime;
      setVideoProgress(newTime);
    }
  };

  const changePlaybackSpeed = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  const markLessonComplete = () => {
    if (currentLesson && !completedLessons.includes(currentLesson._id)) {
      setCompletedLessons([...completedLessons, currentLesson._id]);
      toast.success('Lesson marked as complete!');
      
      // Auto-advance to next lesson
      setTimeout(() => {
        goToNextLesson();
      }, 1000);
    }
  };

  const goToNextLesson = () => {
    if (!currentModule || !currentLesson) return;

    const currentLessonIndex = currentModule.lessons.findIndex(l => l._id === currentLesson._id);
    
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      // Next lesson in same module
      setCurrentLesson(currentModule.lessons[currentLessonIndex + 1]);
    } else {
      // Next module
      const currentModuleIndex = course.modules.findIndex(m => m._id === currentModule._id);
      if (currentModuleIndex < course.modules.length - 1) {
        const nextModule = course.modules[currentModuleIndex + 1];
        setCurrentModule(nextModule);
        setCurrentLesson(nextModule.lessons[0]);
      } else {
        toast.success('Congratulations! You\'ve completed all lessons.');
      }
    }
  };

  const goToPreviousLesson = () => {
    if (!currentModule || !currentLesson) return;

    const currentLessonIndex = currentModule.lessons.findIndex(l => l._id === currentLesson._id);
    
    if (currentLessonIndex > 0) {
      // Previous lesson in same module
      setCurrentLesson(currentModule.lessons[currentLessonIndex - 1]);
    } else {
      // Previous module
      const currentModuleIndex = course.modules.findIndex(m => m._id === currentModule._id);
      if (currentModuleIndex > 0) {
        const prevModule = course.modules[currentModuleIndex - 1];
        setCurrentModule(prevModule);
        setCurrentLesson(prevModule.lessons[prevModule.lessons.length - 1]);
      }
    }
  };

  const selectLesson = (module, lesson) => {
    setCurrentModule(module);
    setCurrentLesson(lesson);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const submitQuiz = () => {
    if (!quizData) return;

    let score = 0;
    quizData.questions.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        score++;
      }
    });

    const percentage = (score / quizData.questions.length) * 100;
    setQuizSubmitted(true);
    
    if (percentage >= quizData.passingScore) {
      toast.success(`Quiz passed! Score: ${percentage.toFixed(1)}%`);
      markLessonComplete();
    } else {
      toast.error(`Quiz failed. Score: ${percentage.toFixed(1)}%. Passing score: ${quizData.passingScore}%`);
    }
  };

  const sendDiscussionMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        user: user.name,
        message: newMessage,
        timestamp: new Date().toLocaleTimeString(),
        likes: 0
      };
      setDiscussionMessages([...discussionMessages, message]);
      setNewMessage('');
      toast.success('Message sent!');
    }
  };

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setVideoProgress(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration);
    };

    const handleEnded = () => {
      setVideoPlaying(false);
      markLessonComplete();
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentLesson]);

  // Set quiz data when quiz lesson is selected
  useEffect(() => {
    if (currentLesson && currentLesson.type === 'quiz') {
      setQuizData(currentLesson.quiz);
      setQuizAnswers({});
      setQuizSubmitted(false);
    } else {
      setQuizData(null);
    }

    if (currentLesson && currentLesson.type === 'assignment') {
      setAssignmentData(currentLesson.assignment);
    } else {
      setAssignmentData(null);
    }
  }, [currentLesson]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto"
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  Back to Dashboard
                </button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mt-4">
                <h2 className="font-semibold text-white mb-1 line-clamp-2">
                  {course.title}
                </h2>
                <div className="flex items-center text-sm text-gray-400">
                  <span>{completedLessons.length}/{course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0)} lessons</span>
                  <span className="mx-2">•</span>
                  <span>{course.progress}% complete</span>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="p-4">
              {course.modules.map((module) => (
                <div key={module._id} className="mb-6">
                  <h3 className="font-semibold text-white mb-3 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    {module.title}
                  </h3>
                  
                  <div className="space-y-2">
                    {module.lessons.map((lesson) => {
                      const isCompleted = completedLessons.includes(lesson._id);
                      const isCurrent = currentLesson && currentLesson._id === lesson._id;
                      
                      return (
                        <button
                          key={lesson._id}
                          onClick={() => selectLesson(module, lesson)}
                          className={`w-full text-left p-3 rounded-lg transition-all ${
                            isCurrent 
                              ? 'bg-blue-600 text-white' 
                              : 'hover:bg-gray-700 text-gray-300'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-3">
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-green-400" />
                              ) : lesson.type === 'video' ? (
                                <Play className="h-5 w-5" />
                              ) : lesson.type === 'quiz' ? (
                                <Brain className="h-5 w-5" />
                              ) : lesson.type === 'assignment' ? (
                                <FileText className="h-5 w-5" />
                              ) : (
                                <BookOpen className="h-5 w-5" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {lesson.title}
                              </p>
                              <div className="flex items-center text-sm opacity-75">
                                <span className="capitalize">{lesson.type}</span>
                                {lesson.videoDuration && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <span>{formatTime(lesson.videoDuration)}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <div className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-700 transition-colors mr-4"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div>
                <h1 className="font-semibold text-white">
                  {currentLesson ? currentLesson.title : 'Select a lesson'}
                </h1>
                <p className="text-sm text-gray-400">
                  {currentModule ? currentModule.title : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notes Toggle */}
              <button
                onClick={() => setShowNotes(!showNotes)}
                className={`p-2 rounded-lg transition-colors ${
                  showNotes ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400'
                }`}
              >
                <BookOpen className="h-5 w-5" />
              </button>

              {/* Discussion Toggle */}
              <button
                onClick={() => setShowDiscussion(!showDiscussion)}
                className={`p-2 rounded-lg transition-colors ${
                  showDiscussion ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-400'
                }`}
              >
                <MessageSquare className="h-5 w-5" />
              </button>

              {/* Lesson Navigation */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToPreviousLesson}
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <button
                  onClick={goToNextLesson}
                  className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Content Area */}
          <div className="flex-1 p-6">
            {currentLesson ? (
              <div className="max-w-4xl mx-auto">
                {/* Video Lesson */}
                {currentLesson.type === 'video' && (
                  <div className="mb-6">
                    {/* Video Player */}
                    <div className="relative bg-black rounded-lg overflow-hidden group">
                      <video
                        ref={videoRef}
                        src={currentLesson.videoUrl}
                        className="w-full aspect-video"
                        onClick={togglePlay}
                      />

                      {/* Video Controls Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button
                            onClick={togglePlay}
                            className="bg-white/20 backdrop-blur-sm rounded-full p-4 hover:bg-white/30 transition-colors"
                          >
                            {videoPlaying ? (
                              <Pause className="h-8 w-8" />
                            ) : (
                              <Play className="h-8 w-8 ml-1" />
                            )}
                          </button>
                        </div>

                        {/* Bottom Controls */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          {/* Progress Bar */}
                          <div
                            className="w-full bg-white/20 rounded-full h-1 mb-4 cursor-pointer"
                            onClick={handleProgressChange}
                          >
                            <div
                              className="bg-blue-500 h-1 rounded-full transition-all"
                              style={{ width: `${(videoProgress / videoDuration) * 100}%` }}
                            />
                          </div>

                          {/* Control Buttons */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <button onClick={togglePlay}>
                                {videoPlaying ? (
                                  <Pause className="h-5 w-5" />
                                ) : (
                                  <Play className="h-5 w-5" />
                                )}
                              </button>

                              <button onClick={toggleMute}>
                                {videoMuted ? (
                                  <VolumeX className="h-5 w-5" />
                                ) : (
                                  <Volume2 className="h-5 w-5" />
                                )}
                              </button>

                              <div className="text-sm">
                                {formatTime(videoProgress)} / {formatTime(videoDuration)}
                              </div>
                            </div>

                            <div className="flex items-center space-x-4">
                              {/* Speed Control */}
                              <div className="relative">
                                <button
                                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                                  className="text-sm px-2 py-1 rounded hover:bg-white/20 transition-colors"
                                >
                                  {playbackSpeed}x
                                </button>
                                
                                {showSpeedMenu && (
                                  <div className="absolute bottom-full mb-2 right-0 bg-gray-800 rounded-lg shadow-lg py-2 min-w-[80px]">
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                      <button
                                        key={speed}
                                        onClick={() => changePlaybackSpeed(speed)}
                                        className="block w-full text-left px-3 py-1 hover:bg-gray-700 transition-colors"
                                      >
                                        {speed}x
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <button>
                                <Settings className="h-5 w-5" />
                              </button>

                              <button>
                                <Maximize className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Lesson Info */}
                    <div className="mt-6 bg-gray-800 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-semibold text-white mb-2">
                            {currentLesson.title}
                          </h2>
                          <p className="text-gray-300">
                            {currentLesson.description}
                          </p>
                        </div>

                        <button
                          onClick={markLessonComplete}
                          disabled={completedLessons.includes(currentLesson._id)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            completedLessons.includes(currentLesson._id)
                              ? 'bg-green-600 text-white cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          {completedLessons.includes(currentLesson._id) ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2 inline" />
                              Completed
                            </>
                          ) : (
                            'Mark Complete'
                          )}
                        </button>
                      </div>

                      {/* Resources */}
                      {currentLesson.resources && currentLesson.resources.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-white mb-3">Resources</h3>
                          <div className="space-y-2">
                            {currentLesson.resources.map((resource, index) => (
                              <a
                                key={index}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                              >
                                <FileText className="h-5 w-5 mr-3 text-blue-400" />
                                <span className="text-white">{resource.title}</span>
                                <Download className="h-4 w-4 ml-auto text-gray-400" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quiz Lesson */}
                {currentLesson.type === 'quiz' && quizData && (
                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-white mb-2">
                        {currentLesson.title}
                      </h2>
                      <p className="text-gray-300 mb-4">
                        {currentLesson.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{quizData.questions.length} questions</span>
                        <span>•</span>
                        <span>{quizData.timeLimit / 60} minutes</span>
                        <span>•</span>
                        <span>Passing score: {quizData.passingScore}%</span>
                      </div>
                    </div>

                    {!quizSubmitted ? (
                      <div className="space-y-6">
                        {quizData.questions.map((question, questionIndex) => (
                          <div key={question.id} className="bg-gray-700 rounded-lg p-4">
                            <h3 className="font-semibold text-white mb-4">
                              {questionIndex + 1}. {question.question}
                            </h3>
                            
                            <div className="space-y-2">
                              {question.options.map((option, optionIndex) => (
                                <label
                                  key={optionIndex}
                                  className="flex items-center p-3 bg-gray-600 rounded-lg cursor-pointer hover:bg-gray-500 transition-colors"
                                >
                                  <input
                                    type="radio"
                                    name={`question-${questionIndex}`}
                                    value={optionIndex}
                                    checked={quizAnswers[questionIndex] === optionIndex}
                                    onChange={(e) => setQuizAnswers({
                                      ...quizAnswers,
                                      [questionIndex]: parseInt(e.target.value)
                                    })}
                                    className="mr-3"
                                  />
                                  <span className="text-white">{option}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={submitQuiz}
                          disabled={Object.keys(quizAnswers).length !== quizData.questions.length}
                          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                        >
                          Submit Quiz
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Quiz Completed!
                        </h3>
                        <p className="text-gray-300">
                          Check your results above and continue to the next lesson.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Assignment Lesson */}
                {currentLesson.type === 'assignment' && assignmentData && (
                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-white mb-2">
                        {assignmentData.title}
                      </h2>
                      <p className="text-gray-300 mb-4">
                        {assignmentData.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                        <span>Due: {assignmentData.dueDate}</span>
                        <span>•</span>
                        <span>Max Score: {assignmentData.maxScore} points</span>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-white mb-3">Instructions</h3>
                      <ul className="space-y-2">
                        {assignmentData.instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start">
                            <CheckSquare className="h-5 w-5 mr-3 mt-0.5 text-blue-400 flex-shrink-0" />
                            <span className="text-gray-300">{instruction}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Submission Area */}
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="font-semibold text-white mb-4">Submit Assignment</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Text Submission
                          </label>
                          <textarea
                            placeholder="Enter your submission text here..."
                            rows={6}
                            className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            File Upload
                          </label>
                          <div className="border-2 border-dashed border-gray-500 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-300">
                              Drop files here or click to browse
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              Supports: .pdf, .doc, .docx, .zip
                            </p>
                          </div>
                        </div>

                        <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                          Submit Assignment
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Select a lesson to begin
                </h3>
                <p className="text-gray-400">
                  Choose a lesson from the sidebar to start learning
                </p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Notes & Discussion */}
          <AnimatePresence>
            {(showNotes || showDiscussion) && (
              <motion.div
                initial={{ x: 400 }}
                animate={{ x: 0 }}
                exit={{ x: 400 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-80 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto"
              >
                {showNotes && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-white mb-3">My Notes</h3>
                    <textarea
                      placeholder="Take notes while learning..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={10}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <button className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                      Save Notes
                    </button>
                  </div>
                )}

                {showDiscussion && (
                  <div>
                    <h3 className="font-semibold text-white mb-3">Discussion</h3>
                    
                    {/* Messages */}
                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                      {discussionMessages.map((message) => (
                        <div key={message.id} className="bg-gray-700 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-white text-sm">
                              {message.user}
                            </span>
                            <span className="text-xs text-gray-400">
                              {message.timestamp}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm">
                            {message.message}
                          </p>
                        </div>
                      ))}
                      
                      {discussionMessages.length === 0 && (
                        <p className="text-gray-400 text-center py-4">
                          No messages yet. Start the discussion!
                        </p>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Ask a question..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendDiscussionMessage()}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={sendDiscussionMessage}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CourseLearnEnhanced;
