import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp, 
  Star, 
  ArrowRight, 
  Play, 
  CheckCircle,
  Sparkles,
  Target,
  Globe,
  Zap,
  Heart,
  Shield,
  Clock
} from 'lucide-react';

const HomePage = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero slides with clean background images and content
  const heroSlides = [
    {
      id: 1,
      title: "Transform Your Future",
      subtitle: "Learn. Impact. Succeed.",
      description: "Join thousands of learners making a difference through education while contributing to charitable causes worldwide.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop&crop=center"
    },
    {
      id: 2,
      title: "Master In-Demand Skills",
      subtitle: "Code. Design. Innovate.",
      description: "Access expert-led courses in technology, design, and business. Build projects that matter and advance your career.",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1920&h=1080&fit=crop&crop=center"
    },
    {
      id: 3,
      title: "Join a Global Community",
      subtitle: "Connect. Collaborate. Create.",
      description: "Learn alongside motivated individuals from around the world. Work on projects that create real social impact.",
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1920&h=1080&fit=crop&crop=center"
    }
  ];

  // Auto-advance slides with faster transitions
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500); // Change slide every 4.5 seconds

    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "AI-Powered Learning",
      description: "Experience personalized learning paths powered by advanced AI algorithms that adapt to your pace."
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Community",
      description: "Connect with learners worldwide and collaborate on projects that make a real difference."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Feedback",
      description: "Get real-time feedback and suggestions to accelerate your learning journey."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Impact Learning",
      description: "Every course you complete contributes to charitable causes around the world."
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Learners", icon: <Users className="w-6 h-6" /> },
    { number: "1,200+", label: "Expert Courses", icon: <BookOpen className="w-6 h-6" /> },
    { number: "98%", label: "Success Rate", icon: <Target className="w-6 h-6" /> },
    { number: "$2M+", label: "Donated to Charity", icon: <Heart className="w-6 h-6" /> }
  ];

  const testimonials = [
    {
      name: "Emma Rodriguez",
      role: "UX Designer",
      content: "This platform didn't just teach me skills—it changed my entire career trajectory. The personalized approach is incredible.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      company: "Google"
    },
    {
      name: "James Chen",
      role: "Software Engineer",
      content: "The combination of top-tier education and social impact made this the perfect choice for my professional development.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      company: "Microsoft"
    },
    {
      name: "Sophia Williams",
      role: "Data Scientist",
      content: "The interactive projects and real-world applications helped me land my dream job. Plus, I'm helping charity while learning!",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      company: "Netflix"
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Simplified Hero Section with Image Slider */}
      <section className="relative min-h-screen font-serif">
        {/* Background Image Slider */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <div 
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ 
                  backgroundImage: `url(${heroSlides[currentSlide].image})`,
                }}
              />
              {/* Purple and Black Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-purple-900/60 to-black/70" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
          {heroSlides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white' 
                  : 'bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6"
                >
                  {/* Main Title */}
                  <motion.h1 
                    className="text-4xl lg:text-6xl font-bold leading-tight text-white font-serif"
                  >
                    {heroSlides[currentSlide].title}
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.h2
                    className="text-xl lg:text-2xl font-medium text-purple-200 font-serif"
                  >
                    {heroSlides[currentSlide].subtitle}
                  </motion.h2>

                  {/* Description */}
                  <motion.p 
                    className="text-lg text-gray-300 leading-relaxed max-w-lg font-sans"
                  >
                    {heroSlides[currentSlide].description}
                  </motion.p>

                  {/* Simple CTA */}
                  <motion.div className="pt-4">
                    {!user ? (
                      <Link
                        to="/register"
                        className="inline-flex items-center px-8 py-3 text-lg font-medium text-black bg-white hover:bg-gray-100 transition-colors duration-300 font-sans"
                      >
                        Get Started
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                    ) : (
                      <Link
                        to="/dashboard"
                        className="inline-flex items-center px-8 py-3 text-lg font-medium text-black bg-white hover:bg-gray-100 transition-colors duration-300 font-sans"
                      >
                        Continue Learning
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Link>
                    )}
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Stats Section */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="hidden lg:block"
              >
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="text-center p-6 bg-white/10 backdrop-blur-sm border border-white/20"
                    >
                      <div className="text-purple-200 mb-2 flex justify-center">
                        {stat.icon}
                      </div>
                      <div className="text-2xl font-bold text-white font-serif">{stat.number}</div>
                      <div className="text-sm text-gray-300 font-sans">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Why We're Different
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience learning that's designed for the future. Our platform combines cutting-edge technology 
              with social impact to create something truly special.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group relative bg-white p-8 border border-gray-200 hover:border-purple-200 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-white opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white mb-6 group-hover:bg-black transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from learners who've transformed their careers and lives through our platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group bg-gradient-to-br from-white to-gray-50 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 text-lg leading-relaxed mb-8 italic">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-2xl mr-4 object-cover"
                  />
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                    <div className="text-gray-600">{testimonial.role}</div>
                    <div className="text-sm font-medium text-indigo-600">{testimonial.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px'
              }}
            />
          </div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              Ready to Make an Impact?
            </h2>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
              Join thousands of learners who are building skills, advancing careers, 
              and making a positive difference in the world.
            </p>
            
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl"
                  >
                    Start Learning Today
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/courses"
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-2xl hover:border-white/50 hover:bg-white/10 transition-all duration-300"
                  >
                    Explore Free Courses
                  </Link>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
