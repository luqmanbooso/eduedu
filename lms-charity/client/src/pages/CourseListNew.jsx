import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Star, 
  Users, 
  Clock, 
  PlayCircle, 
  BookOpen, 
  TrendingUp,
  Heart,
  ShoppingCart,
  ChevronDown,
  Award,
  Globe,
  Bookmark,
  Eye
} from 'lucide-react';
import { courseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const CourseListNew = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCourses();
  }, [currentPage, selectedCategory, selectedLevel, priceFilter, sortBy, searchTerm]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        category: selectedCategory,
        level: selectedLevel,
        sort: getSortValue(sortBy)
      };

      // Add price filter
      if (priceFilter === 'free') {
        params.price = 0;
      } else if (priceFilter === 'paid') {
        params.minPrice = 0.01;
      }

      const response = await courseAPI.getAllCourses(params);
      setCourses(response.courses || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const getSortValue = (sortBy) => {
    switch (sortBy) {
      case 'newest': return '-createdAt';
      case 'oldest': return 'createdAt';
      case 'price-low': return 'price';
      case 'price-high': return '-price';
      case 'rating': return '-rating.average';
      case 'popularity': return '-enrolledStudents';
      default: return '-createdAt';
    }
  };

  const formatDuration = (hours) => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    return `${Math.round(hours)} ${hours === 1 ? 'hour' : 'hours'}`;
  };

  const formatPrice = (price, discountPrice = null) => {
    if (price === 0) return 'Free';
    
    if (discountPrice && discountPrice < price) {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-gray-900">${discountPrice}</span>
          <span className="text-sm text-gray-500 line-through">${price}</span>
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
            {Math.round(((price - discountPrice) / price) * 100)}% OFF
          </span>
        </div>
      );
    }
    
    return <span className="text-lg font-bold text-gray-900">${price}</span>;
  };

  const toggleWishlist = (courseId) => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }
    
    setWishlist(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
    
    toast.success(wishlist.includes(courseId) ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleEnroll = (courseId, price) => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (price === 0) {
      // Free course - direct enrollment
      enrollInCourse(courseId);
    } else {
      // Paid course - go to checkout
      navigate(`/courses/${courseId}/checkout`);
    }
  };

  const enrollInCourse = async (courseId) => {
    try {
      await courseAPI.enrollInCourse(courseId);
      toast.success('Successfully enrolled!');
      navigate(`/courses/${courseId}/learn`);
    } catch (error) {
      toast.error('Failed to enroll in course');
    }
  };

  const categories = [
    'Programming',
    'Data Science', 
    'AI/ML',
    'Cybersecurity',
    'Design',
    'Business',
    'Marketing',
    'Science',
    'Language',
    'Other'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Premium Courses</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover thousands of expertly crafted courses designed to accelerate your learning journey and advance your career
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for courses, skills, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{courses.length} courses found</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="popularity">Most Popular</option>
                  <option value="newest">Newest</option>
                  <option value="rating">Highest Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Expanded Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-6 pt-6 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                      <select
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">All Levels</option>
                        {levels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                      <select
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">All Prices</option>
                        <option value="free">Free</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setSelectedCategory('');
                          setSelectedLevel('');
                          setPriceFilter('');
                          setSearchTerm('');
                        }}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Course Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {courses.map((course, index) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              {/* Course Image */}
              <div className="relative overflow-hidden">
                <img
                  src={course.thumbnail?.url || course.thumbnail || '/api/placeholder/400/225'}
                  alt={course.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-3">
                    <button
                      onClick={() => toggleWishlist(course._id)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Heart className={`w-5 h-5 ${wishlist.includes(course._id) ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                    </button>
                    {course.previewVideo && (
                      <button className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors">
                        <PlayCircle className="w-5 h-5 text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Price Badge */}
                <div className="absolute top-4 right-4">
                  {course.price === 0 ? (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Free
                    </span>
                  ) : course.discountPrice && course.discountPrice < course.price ? (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {Math.round(((course.price - course.discountPrice) / course.price) * 100)}% OFF
                    </span>
                  ) : null}
                </div>

                {/* Level Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                    course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {course.level}
                  </span>
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                {/* Category */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-purple-600 font-medium">{course.category}</span>
                  {course.rating?.average > 0 && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-gray-600">{course.rating.average.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({course.rating.count})</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                  {course.title}
                </h3>

                {/* Instructor */}
                <p className="text-sm text-gray-600 mb-3">
                  by {course.instructor?.name || 'Unknown Instructor'}
                </p>

                {/* Stats */}
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{course.enrolledStudents || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(course.totalDuration || 0)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.totalLessons || 0} lessons</span>
                  </div>
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between">
                  <div>
                    {formatPrice(course.price, course.discountPrice)}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/courses/${course._id}`}
                      className="px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleEnroll(course._id, course.discountPrice || course.price)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                    >
                      {course.price === 0 ? (
                        <>
                          <BookOpen className="w-4 h-4" />
                          <span>Enroll</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span>Buy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search terms or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setSelectedLevel('');
                setPriceFilter('');
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 flex items-center justify-center space-x-4"
          >
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <div className="flex space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-purple-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CourseListNew;
