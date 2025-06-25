import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Users, Clock, ArrowRight } from 'lucide-react';
import axios from 'axios';

const HomePage = () => {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      const response = await axios.get('/courses?featured=true&limit=6');
      setFeaturedCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching featured courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Learn Without Limits
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Access thousands of free courses from expert instructors worldwide
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/courses" className="btn-secondary inline-flex items-center justify-center">
                Browse Courses
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/register" className="btn-outline bg-white text-blue-600 border-white hover:bg-blue-50">
                Start Learning Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-500 mb-2">10,000+</div>
              <div className="text-gray-600">Students Learning</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-500 mb-2">500+</div>
              <div className="text-gray-600">Free Courses</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-500 mb-2">100+</div>
              <div className="text-gray-600">Expert Instructors</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Courses
            </h2>
            <p className="text-lg text-gray-600">
              Start your learning journey with our most popular courses
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="card animate-pulse">
                  <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.length > 0 ? (
                featuredCourses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">No featured courses available yet.</p>
                  <Link to="/courses" className="btn-primary mt-4 inline-block">
                    Browse All Courses
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/courses" className="btn-outline">
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Teaching?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Share your knowledge with learners around the world
          </p>
          <Link to="/register" className="btn-secondary">
            Become an Instructor
          </Link>
        </div>
      </section>
    </div>
  );
};

const CourseCard = ({ course }) => {
  return (
    <Link to={`/courses/${course._id}`} className="card hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg mb-4 flex items-center justify-center text-white text-lg font-semibold">
        {course.title}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
        {course.title}
      </h3>
      <p className="text-gray-600 mb-4 line-clamp-3">
        {course.description}
      </p>
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

export default HomePage;
