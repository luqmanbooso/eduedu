import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Star, Users, Clock } from 'lucide-react';
import axios from 'axios';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/courses');
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Programming', 'Design', 'Business', 'Marketing', 'Science', 'Language'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Explore Courses
        </h1>
        <p className="text-gray-600">
          Discover thousands of free courses from expert instructors
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4 sm:space-y-0 sm:flex sm:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 input-field"
          />
        </div>
        
        <div className="sm:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(9)].map((_, index) => (
            <div key={index} className="card animate-pulse">
              <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-4 text-gray-600">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No courses found matching your search.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const CourseCard = ({ course }) => {
  return (
    <Link to={`/courses/${course._id}`} className="card hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-4 flex items-center justify-center text-white text-lg font-semibold">
        {course.title}
      </div>
      
      <div className="mb-2">
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          {course.category || 'General'}
        </span>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
        {course.title}
      </h3>
      
      <p className="text-gray-600 mb-4 line-clamp-3">
        {course.description}
      </p>
      
      <div className="text-sm text-gray-500 mb-3">
        by {course.instructor?.name || 'Anonymous'}
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {course.enrolledStudents || 0}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {course.lessons?.length || 0} lessons
          </div>
        </div>
        <div className="flex items-center">
          <Star className="h-4 w-4 mr-1 text-yellow-400" />
          {course.rating || '4.5'}
        </div>
      </div>
    </Link>
  );
};

export default CourseList;
