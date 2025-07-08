import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
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
  ExternalLink,
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
  CheckSquare,
  Image
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  const [courseProgress, setCourseProgress] = useState(0);
  const [userProgressData, setUserProgressData] = useState(null);
  const [progressLoading, setProgressLoading] = useState(true);
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
  
  // Course completion states
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [certificateGenerated, setCertificateGenerated] = useState(false);

  // Fetch course data from API
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await axios.get(`/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const courseData = response.data;
        
        // Process the course data to ensure it matches the expected structure
        const processedCourse = {
          ...courseData,
          modules: courseData.modules?.map(module => ({
            ...module,
            lessons: module.lessons?.map(lesson => ({
              ...lesson,
              isCompleted: false, // Will be updated after fetching progress
              resources: lesson.resources || [],
              // Preserve all lesson-specific data (quiz, assignment, etc.)
              quiz: lesson.quiz,
              assignment: lesson.assignment,
              content: lesson.content // for text lessons
            })) || []
          })) || []
        };
        
        setCourse(processedCourse);
        
        // Set initial lesson
        if (processedCourse.modules.length > 0 && processedCourse.modules[0].lessons.length > 0) {
          setCurrentModule(processedCourse.modules[0]);
          setCurrentLesson(processedCourse.modules[0].lessons[0]);
        }
        
        // Fetch user progress for this course
        await fetchUserProgress(courseId);
        
      } catch (error) {
        console.error('Error fetching course data:', error);
        toast.error('Failed to load course data. Using sample data.');
        
        // Comprehensive sample data with proper structure
        const sampleCourse = {
          _id: courseId,
          title: 'Complete React Development Masterclass 2024',
          description: 'Master React from beginner to advanced level with hands-on projects, quizzes, and assignments',
          instructor: {
            name: 'John Smith',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            bio: 'Senior React Developer with 8+ years experience',
            rating: 4.8,
            studentsCount: 45000
          },
          progress: 0, // Will be updated from progress API
          totalDuration: 1200, // minutes
          level: 'Intermediate',
          category: 'Programming',
          tags: ['React', 'JavaScript', 'Web Development', 'Frontend'],
          learningOutcomes: [
            'Build modern React applications from scratch',
            'Master React Hooks and Context API',
            'Implement state management with Redux',
            'Create reusable components and custom hooks',
            'Deploy React apps to production'
          ],
          requirements: [
            'Basic knowledge of HTML, CSS, and JavaScript',
            'Familiarity with ES6+ features',
            'Node.js installed on your computer',
            'Text editor (VS Code recommended)'
          ],
          targetAudience: [
            'Frontend developers wanting to learn React',
            'JavaScript developers looking to upgrade skills',
            'Web developers transitioning to modern frameworks',
            'Computer science students'
          ],
          modules: [
            {
              _id: 'mod1',
              title: 'Getting Started with React',
              description: 'Learn the fundamentals of React and set up your development environment',
              order: 1,
              duration: 180, // minutes
              lessons: [
                {
                  _id: 'lesson1',
                  title: 'What is React and Why Use It?',
                  description: 'Understanding React fundamentals, virtual DOM, and its ecosystem',
                  type: 'video',
                  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                  videoDuration: 900, // 15 minutes
                  order: 1,
                  isCompleted: true,
                  resources: [
                    { 
                      title: 'React Official Documentation', 
                      url: 'https://reactjs.org/docs/getting-started.html', 
                      type: 'link',
                      description: 'Official React documentation and guides'
                    },
                    { 
                      title: 'Course Slides - React Introduction', 
                      url: '#', 
                      type: 'pdf',
                      description: 'PDF slides covering React basics and concepts'
                    },
                    {
                      title: 'React Cheat Sheet',
                      url: '#',
                      type: 'pdf',
                      description: 'Quick reference guide for React syntax and patterns'
                    }
                  ],
                  transcript: 'In this lesson, we will explore what React is and why it has become one of the most popular JavaScript libraries...',
                  notes: 'Key takeaways: React is a library for building user interfaces, it uses a virtual DOM for performance, and has a component-based architecture.'
                },
                {
                  _id: 'lesson2',
                  title: 'Setting Up Development Environment',
                  description: 'Install Node.js, Create React App, and essential development tools',
                  type: 'video',
                  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                  videoDuration: 720, // 12 minutes
                  order: 2,
                  isCompleted: false,
                  resources: [
                    {
                      title: 'Node.js Download',
                      url: 'https://nodejs.org/',
                      type: 'link',
                      description: 'Download and install Node.js'
                    },
                    {
                      title: 'VS Code Extensions Guide',
                      url: '#',
                      type: 'pdf',
                      description: 'Recommended VS Code extensions for React development'
                    }
                  ],
                  transcript: 'Let\'s set up our development environment for React development...',
                  notes: 'Make sure to install Node.js version 14 or higher. Create React App is the recommended way to start a new React project.'
                },
                {
                  _id: 'lesson3',
                  title: 'React Fundamentals Quiz',
                  description: 'Test your understanding of React basics and development setup',
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
                        correctAnswer: 0,
                        explanation: 'React is a JavaScript library developed by Facebook for building user interfaces, particularly for web applications.'
                      },
                      {
                        id: 2,
                        question: 'What is the Virtual DOM?',
                        options: [
                          'A backup of the real DOM',
                          'A JavaScript representation of the real DOM',
                          'A new version of HTML',
                          'A CSS framework'
                        ],
                        correctAnswer: 1,
                        explanation: 'The Virtual DOM is a JavaScript representation of the real DOM that React uses to optimize rendering performance.'
                      },
                      {
                        id: 3,
                        question: 'Which command creates a new React app?',
                        options: [
                          'npm install react',
                          'npx create-react-app my-app',
                          'npm start react',
                          'react new app'
                        ],
                        correctAnswer: 1,
                        explanation: 'npx create-react-app is the standard way to create a new React application with all necessary build tools configured.'
                      }
                    ],
                    timeLimit: 300, // 5 minutes
                    passingScore: 70,
                    attemptsAllowed: 3,
                    instructions: 'Answer all questions to test your understanding of React fundamentals. You need 70% to pass.'
                  }
                }
              ]
            },
            {
              _id: 'mod2',
              title: 'JSX and Components',
              description: 'Master JSX syntax and learn to create reusable React components',
              order: 2,
              duration: 240, // minutes
              lessons: [
                {
                  _id: 'lesson4',
                  title: 'Understanding JSX',
                  description: 'Learn JSX syntax, expressions, and best practices',
                  type: 'video',
                  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                  videoDuration: 1080, // 18 minutes
                  order: 1,
                  isCompleted: false,
                  resources: [
                    {
                      title: 'JSX Documentation',
                      url: 'https://reactjs.org/docs/introducing-jsx.html',
                      type: 'link',
                      description: 'Official JSX documentation'
                    },
                    {
                      title: 'JSX Examples',
                      url: '#',
                      type: 'document',
                      description: 'Code examples demonstrating JSX patterns'
                    }
                  ],
                  transcript: 'JSX is a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files...',
                  notes: 'Remember: JSX is not HTML! It\'s JavaScript that looks like HTML. Always use camelCase for attributes.'
                },
                {
                  _id: 'lesson5',
                  title: 'Creating Your First Component',
                  description: 'Learn to create and use React components',
                  type: 'video',
                  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
                  videoDuration: 960, // 16 minutes
                  order: 2,
                  isCompleted: false,
                  resources: [
                    {
                      title: 'Component Starter Template',
                      url: '#',
                      type: 'document',
                      description: 'Template for creating new React components'
                    }
                  ]
                },
                {
                  _id: 'lesson6',
                  title: 'Build a Profile Card Component',
                  description: 'Apply your knowledge by building a reusable profile card component',
                  type: 'assignment',
                  order: 3,
                  isCompleted: false,
                  assignment: {
                    title: 'Create a Profile Card Component',
                    description: 'Build a reusable profile card component that displays user information including name, avatar, bio, and social links. This assignment will help you practice component creation, props, and styling.',
                    instructions: [
                      'Create a new React component called ProfileCard',
                      'Accept props for name, avatar, bio, and social links',
                      'Style the component using CSS modules or styled-components',
                      'Make the component responsive for mobile and desktop',
                      'Add hover effects and smooth animations',
                      'Include prop validation using PropTypes',
                      'Export the component for use in other files'
                    ],
                    dueDate: '2024-02-15',
                    maxScore: 100,
                    submissionType: 'both',
                    resources: [
                      {
                        title: 'Assignment Requirements',
                        url: '#',
                        type: 'pdf',
                        description: 'Detailed requirements and grading rubric'
                      },
                      {
                        title: 'Sample Profile Data',
                        url: '#',
                        type: 'document',
                        description: 'JSON file with sample user data for testing'
                      }
                    ],
                    rubric: {
                      functionality: 40,
                      codeQuality: 25,
                      styling: 20,
                      responsiveness: 15
                    }
                  }
                }
              ]
            },
            {
              _id: 'mod3',
              title: 'State Management and Hooks',
              description: 'Master React state management using hooks and learn advanced patterns',
              order: 3,
              duration: 300, // minutes
              lessons: [
                {
                  _id: 'lesson7',
                  title: 'Introduction to React Hooks',
                  description: 'Learn about useState, useEffect, and other built-in hooks',
                  type: 'video',
                  videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
                  videoDuration: 1200, // 20 minutes
                  order: 1,
                  isCompleted: false,
                  resources: [
                    {
                      title: 'Hooks API Reference',
                      url: 'https://reactjs.org/docs/hooks-reference.html',
                      type: 'link',
                      description: 'Complete reference for all React hooks'
                    },
                    {
                      title: 'Hooks Examples',
                      url: '#',
                      type: 'document',
                      description: 'Code examples for common hook patterns'
                    }
                  ]
                },
                {
                  _id: 'lesson8',
                  title: 'State Management Quiz',
                  description: 'Test your knowledge of React state and hooks',
                  type: 'quiz',
                  order: 2,
                  isCompleted: false,
                  quiz: {
                    questions: [
                      {
                        id: 1,
                        question: 'Which hook is used to add state to functional components?',
                        options: ['useEffect', 'useState', 'useContext', 'useReducer'],
                        correctAnswer: 1,
                        explanation: 'useState is the hook used to add state to functional components in React.'
                      },
                      {
                        id: 2,
                        question: 'When does useEffect run by default?',
                        options: [
                          'Only on mount',
                          'Only on unmount',
                          'After every render',
                          'Never'
                        ],
                        correctAnswer: 2,
                        explanation: 'useEffect runs after every render by default, unless you provide a dependency array.'
                      }
                    ],
                    timeLimit: 180,
                    passingScore: 80
                  }
                },
                {
                  _id: 'lesson9',
                  title: 'Build a Todo App with Hooks',
                  description: 'Create a complete todo application using React hooks',
                  type: 'assignment',
                  order: 3,
                  isCompleted: false,
                  assignment: {
                    title: 'Todo App with React Hooks',
                    description: 'Build a fully functional todo application using React hooks for state management. This project will demonstrate your understanding of useState, useEffect, and component lifecycle.',
                    instructions: [
                      'Create a TodoApp component with add, edit, delete functionality',
                      'Use useState for managing todo list state',
                      'Use useEffect for local storage persistence',
                      'Implement filtering (all, active, completed)',
                      'Add proper error handling and validation',
                      'Include unit tests for key functionality',
                      'Style the app with CSS or a UI library'
                    ],
                    dueDate: '2024-02-20',
                    maxScore: 150,
                    submissionType: 'both',
                    resources: [
                      {
                        title: 'Project Requirements',
                        url: '#',
                        type: 'pdf',
                        description: 'Detailed project requirements and specifications'
                      },
                      {
                        title: 'UI Mockups',
                        url: '#',
                        type: 'image',
                        description: 'Visual mockups for the todo app interface'
                      }
                    ]
                  }
                }
              ]
            }
          ]
        };

        setCourse(sampleCourse);
        setCurrentModule(sampleCourse.modules[0]);
        setCurrentLesson(sampleCourse.modules[0].lessons[0]);
        setCompletedLessons(['lesson1']);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // Check for course completion on progress update
  useEffect(() => {
    if (course && completedLessons.length > 0) {
      const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);
      const progress = Math.round((completedLessons.length / totalLessons) * 100);
      setCourseProgress(progress);
      
      // Set completion state if course is fully completed
      if (progress >= 100 && !courseCompleted) {
        setCourseCompleted(true);
      }
    }
  }, [course, completedLessons, courseCompleted]);

  // Update quiz and assignment data when lesson changes
  useEffect(() => {
    if (currentLesson) {
      if (currentLesson.type === 'quiz' && currentLesson.quiz) {
        setQuizData(currentLesson.quiz);
        setQuizAnswers({});
        setQuizSubmitted(false);
      } else {
        setQuizData(null);
      }
      
      if (currentLesson.type === 'assignment' && currentLesson.assignment) {
        setAssignmentData(currentLesson.assignment);
      } else {
        setAssignmentData(null);
      }
    }
  }, [currentLesson]);

  // Progress tracking functions
  const fetchUserProgress = async (courseId) => {
    try {
      setProgressLoading(true);
      const response = await axios.get(`/progress/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const progressData = response.data;
      setUserProgressData(progressData);
      setCompletedLessons(progressData.completedLessons || []);
      setCourseProgress(progressData.progressPercentage || 0);
      
      return progressData;
    } catch (error) {
      console.error('Error fetching progress:', error);
      // If no progress found, initialize it
      if (error.response?.status === 404) {
        await initializeCourseProgress(courseId);
      }
      return null;
    } finally {
      setProgressLoading(false);
    }
  };

  const initializeCourseProgress = async (courseId) => {
    try {
      const response = await axios.post(`/progress/start/${courseId}`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const progressData = response.data;
      setUserProgressData(progressData);
      setCourseProgress(0);
      
      return progressData;
    } catch (error) {
      console.error('Error initializing progress:', error);
      return null;
    }
  };

  const updateLessonProgress = async (courseId, lessonId, timeSpent = 0, quizScore = null) => {
    try {
      const response = await axios.post('/progress/complete-lesson', {
        courseId,
        lessonId,
        timeSpent,
        quizScore
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = response.data;
      setCourseProgress(result.progress);
      
      // Update the course progress in the UI
      if (course) {
        setCourse(prev => ({
          ...prev,
          progress: result.progress
        }));
      }
      
      return result;
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      toast.error('Failed to save progress');
      return null;
    }
  };

  // Update lesson completion status based on progress data
  const updateLessonCompletionStatus = () => {
    if (!course || !completedLessons.length) return;
    
    setCourse(prevCourse => ({
      ...prevCourse,
      modules: prevCourse.modules.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson => ({
          ...lesson,
          isCompleted: completedLessons.includes(lesson._id)
        }))
      }))
    }));
  };

  // Update lesson completion status when completedLessons changes
  useEffect(() => {
    updateLessonCompletionStatus();
  }, [completedLessons]);

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

  const markLessonComplete = async () => {
    if (currentLesson && !completedLessons.includes(currentLesson._id)) {
      // Update local state immediately for better UX
      const newCompletedLessons = [...completedLessons, currentLesson._id];
      setCompletedLessons(newCompletedLessons);
      
      // Calculate progress locally
      const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);
      const newProgress = Math.round((newCompletedLessons.length / totalLessons) * 100);
      setCourseProgress(newProgress);
      
      toast.success('Lesson marked as complete!');
      
      // Check if course is completed
      if (newCompletedLessons.length === totalLessons) {
        setCourseCompleted(true);
        setShowCompletionModal(true);
        toast.success('🎉 Congratulations! You completed the entire course!');
        
        // Try to update backend course completion
        try {
          await axios.post('/progress/complete-course', {
            courseId: course._id
          }, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
        } catch (error) {
          console.warn('Backend course completion update failed:', error);
        }
      }
      
      // Try to update backend, but don't block if it fails
      try {
        const timeSpent = currentLesson.type === 'video' ? (currentLesson.videoDuration || 0) : 300;
        await updateLessonProgress(course._id, currentLesson._id, timeSpent);
      } catch (error) {
        console.warn('Backend progress update failed, but local progress saved:', error);
      }
      
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

  const submitQuiz = async () => {
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
      
      // Mark lesson complete with quiz score
      if (currentLesson && !completedLessons.includes(currentLesson._id)) {
        const timeSpent = 300; // 5 minutes default for quiz
        const result = await updateLessonProgress(course._id, currentLesson._id, timeSpent, percentage);
        
        if (result) {
          setCompletedLessons([...completedLessons, currentLesson._id]);
          toast.success('Quiz lesson completed!');
          
          if (result.isCompleted) {
            toast.success('🎉 Congratulations! You completed the entire course!');
          }
          
          setTimeout(() => {
            goToNextLesson();
          }, 2000);
        }
      }
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

  // Course completion functions
  const submitRating = async () => {
    try {
      await axios.post(`/courses/${courseId}/rate`, {
        rating: userRating,
        review: userReview
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success('Thank you for your rating and review!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  const generateCertificate = async () => {
    try {
      const response = await axios.post(`/certificates/generate`, {
        courseId: course._id,
        courseName: course.title,
        studentName: user.name,
        completionDate: new Date().toISOString(),
        instructorName: course.instructor.name
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setCertificateGenerated(true);
      toast.success('Certificate generated successfully!');
      
      // Download certificate
      const link = document.createElement('a');
      link.href = response.data.certificateUrl;
      link.download = `${course.title}_Certificate.pdf`;
      link.click();
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast.error('Failed to generate certificate');
    }
  };

  const shareCourse = async (platform) => {
    const shareText = `I just completed "${course.title}" on our LMS platform! 🎉`;
    const shareUrl = window.location.origin + `/courses/${courseId}`;
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        toast.success('Link copied to clipboard!');
        break;
      default:
        break;
    }
  };

  const continueLearning = () => {
    setShowCompletionModal(false);
    // Navigate to courses or dashboard
    navigate('/dashboard');
  };

  const reviewCourse = () => {
    setShowCompletionModal(false);
    // Stay on course page but allow re-viewing
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
                  <span>{courseProgress}% complete</span>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${courseProgress}%` }}
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
              {/* Course Completion Status */}
              {courseProgress >= 100 && (
                <div className="flex items-center space-x-2 bg-green-600 px-3 py-1 rounded-lg">
                  <Award className="h-4 w-4 text-white" />
                  <span className="text-white text-sm font-medium">Completed</span>
                  <button
                    onClick={() => setShowCompletionModal(true)}
                    className="text-white hover:text-green-200 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              )}
              
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
                          
                          {/* Lesson Resources */}
                          {currentLesson.resources && currentLesson.resources.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-400 mb-2">Resources</h4>
                              <div className="space-y-2">
                                {currentLesson.resources.map((resource, index) => (
                                  <a
                                    key={index}
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors group"
                                  >
                                    <div className="flex-shrink-0">
                                      {resource.type === 'pdf' ? (
                                        <FileText className="h-5 w-5 text-red-400" />
                                      ) : resource.type === 'video' ? (
                                        <Play className="h-5 w-5 text-blue-400" />
                                      ) : resource.type === 'image' ? (
                                        <Image className="h-5 w-5 text-green-400" />
                                      ) : (
                                        <Download className="h-5 w-5 text-purple-400" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-white font-medium truncate group-hover:text-blue-300">
                                        {resource.title}
                                      </p>
                                      {resource.description && (
                                        <p className="text-sm text-gray-400 truncate">
                                          {resource.description}
                                        </p>
                                      )}
                                    </div>
                                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-300" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
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

                {/* Text/Reading Lesson */}
                {currentLesson.type === 'text' && (
                  <div className="mb-6">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                      {/* Header */}
                      <div className="bg-gray-800 text-white p-6">
                        <h2 className="text-2xl font-bold mb-2">
                          {currentLesson.title}
                        </h2>
                        <p className="text-gray-300">
                          {currentLesson.description}
                        </p>
                      </div>

                      {/* Reading Content */}
                      <div className="p-8">
                        <div className="prose prose-lg max-w-none">
                          {currentLesson.content ? (
                            <div 
                              className="whitespace-pre-wrap text-gray-800 leading-relaxed text-lg"
                              style={{ lineHeight: '1.8' }}
                            >
                              {currentLesson.content}
                            </div>
                          ) : (
                            <div className="text-center py-12 text-gray-500">
                              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>No reading content available for this lesson.</p>
                            </div>
                          )}
                        </div>

                        {/* Mark Complete Button */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                          <button
                            onClick={markLessonComplete}
                            disabled={completedLessons.includes(currentLesson._id)}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                              completedLessons.includes(currentLesson._id)
                                ? 'bg-green-600 text-white cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {completedLessons.includes(currentLesson._id) ? (
                              <>
                                <CheckCircle className="h-5 w-5 mr-2 inline" />
                                Completed
                              </>
                            ) : (
                              <>
                                <BookOpen className="h-5 w-5 mr-2 inline" />
                                Mark as Read
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Resources Section */}
                      {currentLesson.resources && currentLesson.resources.length > 0 && (
                        <div className="bg-gray-50 p-6 border-t border-gray-200">
                          <h3 className="font-semibold text-gray-800 mb-4">Resources</h3>
                          <div className="space-y-2">
                            {currentLesson.resources.map((resource, index) => (
                              <a
                                key={index}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                              >
                                <div className="flex-shrink-0 mr-3">
                                  {resource.type === 'pdf' ? (
                                    <FileText className="h-5 w-5 text-red-500" />
                                  ) : resource.type === 'video' ? (
                                    <Play className="h-5 w-5 text-blue-500" />
                                  ) : resource.type === 'image' ? (
                                    <Image className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <Download className="h-5 w-5 text-purple-500" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-gray-800 font-medium truncate hover:text-blue-600">
                                    {resource.title}
                                  </p>
                                  {resource.description && (
                                    <p className="text-sm text-gray-600 truncate">
                                      {resource.description}
                                    </p>
                                  )}
                                </div>
                                <ExternalLink className="h-4 w-4 text-gray-400" />
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
                {currentLesson.type === 'assignment' && (
                  <div className="bg-gray-800 rounded-lg p-6">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-white mb-2">
                        {currentLesson.title}
                      </h2>
                      <p className="text-gray-300 mb-4">
                        {currentLesson.description}
                      </p>
                      
                      {assignmentData && (
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                          <span>Due: {
                            assignmentData.dueDate ? 
                              new Date(assignmentData.dueDate).toLocaleDateString() : 
                              `${assignmentData.dueDays || 7} days from start`
                          }</span>
                          <span>•</span>
                          <span>Max Score: {assignmentData.maxScore || assignmentData.maxPoints || 100} points</span>
                        </div>
                      )}
                    </div>

                    {assignmentData ? (
                      <>
                        {/* Instructions */}
                        <div className="mb-6">
                          <h3 className="font-semibold text-white mb-3">Instructions</h3>
                          <div className="bg-gray-700 rounded-lg p-4">
                            {assignmentData.instructions ? (
                              Array.isArray(assignmentData.instructions) ? (
                                <div className="space-y-2">
                                  {assignmentData.instructions.map((instruction, index) => (
                                    <div key={index} className="flex items-start">
                                      <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5 flex-shrink-0">
                                        {index + 1}
                                      </span>
                                      <p className="text-gray-300">{instruction}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : typeof assignmentData.instructions === 'string' && assignmentData.instructions.trim() ? (
                                <p className="text-gray-300 whitespace-pre-wrap">
                                  {assignmentData.instructions}
                                </p>
                              ) : (
                                <div className="text-center py-4">
                                  <p className="text-gray-400 mb-2">No specific instructions provided for this assignment.</p>
                                  <p className="text-gray-500 text-sm">Please check the lesson description above for guidance.</p>
                                </div>
                              )
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-gray-400 mb-2">No specific instructions provided for this assignment.</p>
                                <p className="text-gray-500 text-sm">Please check the lesson description above for guidance.</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Resources (if any) */}
                        {((currentLesson.resources && currentLesson.resources.length > 0) || 
                          (assignmentData.resources && assignmentData.resources.length > 0)) && (
                          <div className="mb-6">
                            <h3 className="font-semibold text-white mb-3">Assignment Resources</h3>
                            <div className="space-y-2">
                              {/* Check lesson resources first, then assignment resources */}
                              {(currentLesson.resources || assignmentData.resources || []).map((resource, index) => (
                                <a
                                  key={index}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                  <FileText className="h-5 w-5 mr-3 text-blue-400" />
                                  <span className="text-white">{resource.title || resource.name}</span>
                                  <ExternalLink className="h-4 w-4 ml-auto text-gray-400" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rubric (if any) */}
                        {assignmentData.rubric && (
                          <div className="mb-6">
                            <h3 className="font-semibold text-white mb-3">Grading Rubric</h3>
                            <div className="space-y-3">
                              {Array.isArray(assignmentData.rubric) ? (
                                assignmentData.rubric.map((criteria, index) => (
                                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-medium text-white">{criteria.criteria}</h4>
                                      <span className="text-blue-400 font-medium">{criteria.maxPoints} pts</span>
                                    </div>
                                    {criteria.description && (
                                      <p className="text-gray-300 text-sm">{criteria.description}</p>
                                    )}
                                  </div>
                                ))
                              ) : typeof assignmentData.rubric === 'object' ? (
                                Object.entries(assignmentData.rubric).map(([criteria, points], index) => (
                                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-medium text-white">{criteria.charAt(0).toUpperCase() + criteria.slice(1)}</h4>
                                      <span className="text-blue-400 font-medium">{points} pts</span>
                                    </div>
                                  </div>
                                ))
                              ) : null}
                            </div>
                          </div>
                        )}

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

                            <div className="space-y-3">
                              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                                Submit Assignment
                              </button>
                              
                              {/* Mark Complete Button for assignments */}
                              {!completedLessons.includes(currentLesson._id) && (
                                <button
                                  onClick={markLessonComplete}
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                                >
                                  <CheckCircle className="h-5 w-5" />
                                  <span>Mark Assignment Complete</span>
                                </button>
                              )}
                              
                              {completedLessons.includes(currentLesson._id) && (
                                <div className="w-full bg-green-500 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2">
                                  <CheckCircle className="h-5 w-5" />
                                  <span>Assignment Completed</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Fallback when assignment data is not available */
                      <div className="text-center py-8">
                        <div className="bg-gray-700 rounded-lg p-6 mb-6">
                          <Target className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-white mb-2">
                            Assignment Ready
                          </h3>
                          <p className="text-gray-300 mb-4">
                            Assignment details are being loaded. You can still mark this lesson as complete to continue your progress.
                          </p>
                          <p className="text-gray-400 text-sm">
                            Check back later for detailed assignment instructions and submission guidelines.
                          </p>
                        </div>
                        
                        {/* Always show completion button for assignments */}
                        {!completedLessons.includes(currentLesson._id) ? (
                          <button
                            onClick={markLessonComplete}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center justify-center space-x-2 mx-auto"
                          >
                            <CheckCircle className="h-5 w-5" />
                            <span>Mark Assignment Complete</span>
                          </button>
                        ) : (
                          <div className="bg-green-500 text-white font-semibold py-3 px-8 rounded-lg flex items-center justify-center space-x-2 mx-auto">
                            <CheckCircle className="h-5 w-5" />
                            <span>Assignment Completed</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Text/Reading Lesson */}
                {currentLesson.type === 'text' && (
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      {currentLesson.title}
                    </h2>
                    <p className="text-gray-300 mb-6">
                      {currentLesson.description}
                    </p>
                    
                    {currentLesson.content ? (
                      <div 
                        className="prose prose-invert max-w-none text-gray-300"
                        dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">
                          This is a reading lesson. The content will be displayed here.
                        </p>
                      </div>
                    )}
                    
                    {/* Mark Complete Button */}
                    {!completedLessons.includes(currentLesson._id) && (
                      <button
                        onClick={markLessonComplete}
                        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="h-5 w-5" />
                        <span>Mark Complete</span>
                      </button>
                    )}
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

      {/* Course Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  🎉 Congratulations!
                </h2>
                <p className="text-xl text-gray-600">
                  You've successfully completed
                </p>
                <h3 className="text-2xl font-semibold text-gray-900 mt-2">
                  {course?.title}
                </h3>
              </div>

              {/* Course Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {course?.modules?.reduce((total, module) => total + module.lessons.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Lessons</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-sm text-gray-600">Complete</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round((course?.modules?.reduce((total, module) => total + module.lessons.length, 0) || 1) * 15 / 60)}h
                  </div>
                  <div className="text-sm text-gray-600">Studied</div>
                </div>
              </div>

              {/* Certificate Section */}
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Award className="h-5 w-5 mr-2 text-blue-600" />
                  Get Your Certificate
                </h4>
                <p className="text-gray-600 mb-4">
                  Download your completion certificate to showcase your achievement.
                </p>
                <button
                  onClick={generateCertificate}
                  disabled={certificateGenerated}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    certificateGenerated
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {certificateGenerated ? (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Certificate Downloaded
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Download className="h-5 w-5 mr-2" />
                      Download Certificate
                    </div>
                  )}
                </button>
              </div>

              {/* Rating Section */}
              <div className="mb-8 p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-600" />
                  Rate This Course
                </h4>
                <p className="text-gray-600 mb-4">
                  Help other students by sharing your experience.
                </p>
                
                {/* Star Rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setUserRating(star)}
                      className={`p-1 transition-colors ${
                        star <= userRating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      <Star className="h-6 w-6 fill-current" />
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600">
                    {userRating > 0 && `${userRating} star${userRating > 1 ? 's' : ''}`}
                  </span>
                </div>

                {/* Review Text */}
                <textarea
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  placeholder="Write a review... (optional)"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                <button
                  onClick={submitRating}
                  disabled={userRating === 0}
                  className="mt-3 w-full py-2 px-4 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  Submit Rating
                </button>
              </div>

              {/* Share Section */}
              <div className="mb-8 p-6 bg-green-50 rounded-lg border border-green-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Share2 className="h-5 w-5 mr-2 text-green-600" />
                  Share Your Achievement
                </h4>
                <p className="text-gray-600 mb-4">
                  Let others know about your success!
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => shareCourse('twitter')}
                    className="flex items-center justify-center py-2 px-4 bg-blue-400 hover:bg-blue-500 text-white rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Twitter
                  </button>
                  <button
                    onClick={() => shareCourse('linkedin')}
                    className="flex items-center justify-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    LinkedIn
                  </button>
                  <button
                    onClick={() => shareCourse('facebook')}
                    className="flex items-center justify-center py-2 px-4 bg-blue-800 hover:bg-blue-900 text-white rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Facebook
                  </button>
                  <button
                    onClick={() => shareCourse('copy')}
                    className="flex items-center justify-center py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Copy Link
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={reviewCourse}
                  className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  Review Course
                </button>
                <button
                  onClick={continueLearning}
                  className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center"
                >
                  <ChevronRight className="h-5 w-5 mr-2" />
                  Continue Learning
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseLearnEnhanced;
