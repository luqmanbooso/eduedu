import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  Maximize, 
  Settings, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Download, 
  FileText, 
  ExternalLink,
  MessageSquare,
  Star,
  Share2,
  ArrowLeft,
  ArrowRight,
  Clock,
  Users,
  Award,
  Target,
  BarChart3,
  Trophy,
  Bookmark,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  FastForward
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { courseAPI, progressAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const CourseLearnEnhanced = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);
  
  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [lastWatchTime, setLastWatchTime] = useState(0);

  // Notes and bookmarks
  const [notes, setNotes] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [showNotes, setShowNotes] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Completion tracking
  const [lessonProgress, setLessonProgress] = useState({});
  const [watchTime, setWatchTime] = useState(0);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  useEffect(() => {
    if (course && course.modules.length > 0) {
      const lesson = course.modules[currentModuleIndex]?.lessons[currentLessonIndex];
      if (lesson) {
        setCurrentLesson(lesson);
        loadLessonProgress(lesson._id);
      }
    }
  }, [course, currentModuleIndex, currentLessonIndex]);

  useEffect(() => {
    // Auto-save progress every 30 seconds while watching
    const interval = setInterval(() => {
      if (isPlaying && currentLesson && currentTime > 0) {
        saveProgress();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isPlaying, currentLesson, currentTime]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getCourseById(courseId);
      setCourse(response.course);
      
      // Get user's progress for this course
      const progressResponse = await progressAPI.getCourseProgress(courseId);
      setProgress(progressResponse.progress || {});
      
      // Load lesson progress for all lessons
      const lessonProgressData = {};
      response.course.modules.forEach(module => {
        module.lessons.forEach(lesson => {
          lessonProgressData[lesson._id] = progressResponse.lessons?.[lesson._id] || {
            completed: false,
            watchTime: 0,
            lastPosition: 0
          };
        });
      });
      setLessonProgress(lessonProgressData);
      
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast.error('Failed to load course');
      navigate('/my-learning');
    } finally {
      setLoading(false);
    }
  };

  const loadLessonProgress = async (lessonId) => {
    try {
      const response = await progressAPI.getLessonProgress(courseId, lessonId);
      const progressData = response.progress || {};
      
      setIsLessonCompleted(progressData.completed || false);
      setWatchTime(progressData.watchTime || 0);
      setLastWatchTime(progressData.lastPosition || 0);
      
      // Resume from last position if video was previously watched
      if (videoRef.current && progressData.lastPosition > 0) {
        videoRef.current.currentTime = progressData.lastPosition;
      }
    } catch (error) {
      console.error('Error loading lesson progress:', error);
    }
  };

  const saveProgress = async () => {
    if (!currentLesson || !currentTime) return;

    try {
      const progressData = {
        lessonId: currentLesson._id,
        watchTime: currentTime,
        lastPosition: currentTime,
        completed: isLessonCompleted,
        totalDuration: duration
      };

      await progressAPI.updateLessonProgress(courseId, progressData);
      
      // Update local state
      setLessonProgress(prev => ({
        ...prev,
        [currentLesson._id]: {
          ...prev[currentLesson._id],
          ...progressData
        }
      }));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const markLessonComplete = async () => {
    if (!currentLesson) return;

    try {
      await progressAPI.markLessonComplete(courseId, currentLesson._id);
      
      setIsLessonCompleted(true);
      setLessonProgress(prev => ({
        ...prev,
        [currentLesson._id]: {
          ...prev[currentLesson._id],
          completed: true
        }
      }));

      toast.success('Lesson completed!');
      
      // Auto-advance to next lesson
      setTimeout(() => {
        goToNextLesson();
      }, 1500);
      
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      toast.error('Failed to mark lesson as complete');
    }
  };

  const goToNextLesson = () => {
    const currentModule = course.modules[currentModuleIndex];
    const nextLessonIndex = currentLessonIndex + 1;
    
    if (nextLessonIndex < currentModule.lessons.length) {
      setCurrentLessonIndex(nextLessonIndex);
    } else if (currentModuleIndex + 1 < course.modules.length) {
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentLessonIndex(0);
    } else {
      // Course completed!
      handleCourseCompletion();
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    } else if (currentModuleIndex > 0) {
      setCurrentModuleIndex(currentModuleIndex - 1);
      setCurrentLessonIndex(course.modules[currentModuleIndex - 1].lessons.length - 1);
    }
  };

  const handleCourseCompletion = async () => {
    try {
      await progressAPI.completeCourse(courseId);
      toast.success('🎉 Congratulations! You completed the course!');
      
      // Show completion modal or redirect
      navigate('/my-learning?completed=true');
    } catch (error) {
      console.error('Error completing course:', error);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      setCurrentTime(current);
      
      // Check if lesson should be marked as complete (watched 80% or more)
      if (duration > 0 && current / duration >= 0.8 && !isLessonCompleted) {
        markLessonComplete();
      }
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      
      // Resume from last position
      if (lastWatchTime > 0) {
        videoRef.current.currentTime = lastWatchTime;
      }
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateCourseProgress = () => {
    if (!course || !lessonProgress) return 0;
    
    const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);
    const completedLessons = Object.values(lessonProgress).filter(p => p.completed).length;
    
    return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  };

  const addBookmark = async () => {
    if (!currentLesson || !videoRef.current) return;

    try {
      const bookmark = {
        lessonId: currentLesson._id,
        timestamp: currentTime,
        note: `Bookmark at ${formatTime(currentTime)}`
      };

      await progressAPI.addBookmark(courseId, bookmark);
      setBookmarks(prev => [...prev, { ...bookmark, id: Date.now() }]);
      toast.success('Bookmark added!');
    } catch (error) {
      console.error('Error adding bookmark:', error);
      toast.error('Failed to add bookmark');
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !currentLesson) return;

    try {
      const note = {
        lessonId: currentLesson._id,
        timestamp: currentTime,
        content: newNote,
        createdAt: new Date()
      };

      await progressAPI.addNote(courseId, note);
      setNotes(prev => [...prev, { ...note, id: Date.now() }]);
      setNewNote('');
      toast.success('Note added!');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <button
            onClick={() => navigate('/my-learning')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to My Learning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            className="w-96 bg-white border-r border-gray-200 flex flex-col"
          >
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigate('/my-learning')}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to My Learning
                </button>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h1 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h1>
              <p className="text-sm text-gray-600 mb-4">by {course.instructor?.name}</p>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Course Progress</span>
                  <span className="text-sm text-gray-600">{Math.round(calculateCourseProgress())}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateCourseProgress()}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="flex-1 overflow-y-auto">
              {course.modules.map((module, moduleIndex) => (
                <div key={module._id} className="border-b border-gray-200">
                  <div className="p-4 bg-gray-50">
                    <h3 className="font-semibold text-gray-900">{module.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {module.lessons.filter(l => lessonProgress[l._id]?.completed).length} of {module.lessons.length} lessons
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    {module.lessons.map((lesson, lessonIndex) => {
                      const isCurrentLesson = moduleIndex === currentModuleIndex && lessonIndex === currentLessonIndex;
                      const isCompleted = lessonProgress[lesson._id]?.completed;
                      
                      return (
                        <button
                          key={lesson._id}
                          onClick={() => {
                            setCurrentModuleIndex(moduleIndex);
                            setCurrentLessonIndex(lessonIndex);
                          }}
                          className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex items-center space-x-3 ${
                            isCurrentLesson ? 'bg-purple-50 border-r-4 border-purple-500' : ''
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : isCurrentLesson ? (
                              <PlayCircle className="w-5 h-5 text-purple-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${isCurrentLesson ? 'text-purple-700' : 'text-gray-900'}`}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatTime(lesson.videoDuration || 0)}
                              </span>
                              {lesson.type === 'video' && (
                                <span className="text-xs text-blue-600">Video</span>
                              )}
                              {lesson.type === 'text' && (
                                <span className="text-xs text-green-600">Reading</span>
                              )}
                              {lesson.type === 'quiz' && (
                                <span className="text-xs text-orange-600">Quiz</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Actions */}
            <div className="p-4 border-t border-gray-200 space-y-3">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Notes & Bookmarks</span>
              </button>
              
              <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <MessageSquare className="w-4 h-4" />
                <span>Q&A</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            <div>
              <h2 className="font-semibold text-gray-900">{currentLesson?.title}</h2>
              <p className="text-sm text-gray-600">
                Lesson {currentLessonIndex + 1} of {course.modules[currentModuleIndex]?.lessons.length}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={goToPreviousLesson}
              disabled={currentModuleIndex === 0 && currentLessonIndex === 0}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button
              onClick={goToNextLesson}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={addBookmark}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Bookmark className="w-4 h-4" />
              <span>Bookmark</span>
            </button>

            {!isLessonCompleted && (
              <button
                onClick={markLessonComplete}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Complete</span>
              </button>
            )}
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-1 bg-black relative">
          {currentLesson?.type === 'video' && currentLesson.videoUrl ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                src={currentLesson.videoUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedMetadata={handleVideoLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={togglePlayPause}
              />

              {/* Video Controls */}
              <AnimatePresence>
                {showControls && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6"
                  >
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={(e) => handleSeek(parseFloat(e.target.value))}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                      />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button onClick={togglePlayPause} className="text-white hover:text-gray-300 transition-colors">
                          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                        </button>

                        <button
                          onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                          className="text-white hover:text-gray-300 transition-colors"
                        >
                          <RotateCcw className="w-6 h-6" />
                        </button>

                        <button
                          onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
                          className="text-white hover:text-gray-300 transition-colors"
                        >
                          <FastForward className="w-6 h-6" />
                        </button>

                        <div className="text-white text-sm">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <select
                          value={playbackRate}
                          onChange={(e) => {
                            const rate = parseFloat(e.target.value);
                            setPlaybackRate(rate);
                            if (videoRef.current) {
                              videoRef.current.playbackRate = rate;
                            }
                          }}
                          className="bg-transparent text-white text-sm border border-gray-600 rounded px-2 py-1"
                        >
                          <option value="0.5">0.5x</option>
                          <option value="0.75">0.75x</option>
                          <option value="1">1x</option>
                          <option value="1.25">1.25x</option>
                          <option value="1.5">1.5x</option>
                          <option value="2">2x</option>
                        </select>

                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="text-white hover:text-gray-300 transition-colors"
                        >
                          {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                        </button>

                        <button className="text-white hover:text-gray-300 transition-colors">
                          <Settings className="w-6 h-6" />
                        </button>

                        <button className="text-white hover:text-gray-300 transition-colors">
                          <Maximize className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2">{currentLesson?.title}</h3>
                <p className="text-gray-400 mb-6">This lesson contains text content.</p>
                <div className="max-w-2xl mx-auto text-left bg-white text-gray-900 rounded-lg p-8">
                  <div dangerouslySetInnerHTML={{ __html: currentLesson?.content || 'No content available.' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes Panel */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="w-80 bg-white border-l border-gray-200 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Notes & Bookmarks</h3>
                <button
                  onClick={() => setShowNotes(false)}
                  className="p-1 text-gray-600 hover:text-gray-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Add Note */}
              <div className="space-y-3">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note at current timestamp..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                  rows="3"
                />
                <button
                  onClick={addNote}
                  disabled={!newNote.trim()}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add Note
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Bookmarks */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Bookmarks</h4>
                <div className="space-y-2">
                  {bookmarks.map(bookmark => (
                    <div key={bookmark.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-purple-600">
                          {formatTime(bookmark.timestamp)}
                        </span>
                        <button
                          onClick={() => handleSeek(bookmark.timestamp)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Jump to
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">{bookmark.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <div className="space-y-2">
                  {notes.map(note => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-purple-600">
                          {formatTime(note.timestamp)}
                        </span>
                        <button
                          onClick={() => handleSeek(note.timestamp)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Jump to
                        </button>
                      </div>
                      <p className="text-sm text-gray-900">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseLearnEnhanced;
