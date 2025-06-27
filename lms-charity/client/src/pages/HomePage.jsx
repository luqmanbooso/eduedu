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
  Clock,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube
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

        {/* Curved Wave Bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg 
            className="relative block w-full h-24 lg:h-32" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{stopColor:'#ffffff', stopOpacity:0.8}} />
                <stop offset="100%" style={{stopColor:'#ffffff', stopOpacity:1}} />
              </linearGradient>
            </defs>
            <path 
              d="M0,60L48,45C96,30,192,0,288,15C384,30,480,90,576,105C672,120,768,90,864,75C960,60,1056,60,1152,45C1248,30,1344,0,1392,0L1440,0L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" 
              fill="url(#waveGradient)"
            ></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, #f3f4f6 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* Why Choose Us Section */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6 font-serif">
              Why Choose EduCharity?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're not just another learning platform. We're a community committed to making education accessible while creating positive social impact.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Award className="w-8 h-8" />,
                title: "Expert-Led Courses",
                description: "Learn from industry professionals with real-world experience and proven track records in their fields."
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Community Driven",
                description: "Join a supportive community of learners, mentors, and instructors who are passionate about growth and impact."
              },
              {
                icon: <Heart className="w-8 h-8" />,
                title: "Social Impact",
                description: "Every course you complete contributes to charitable causes, making your learning journey meaningful beyond personal growth."
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Quality Assured",
                description: "All courses are carefully curated and regularly updated to ensure you receive the highest quality education."
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Flexible Learning",
                description: "Learn at your own pace with lifetime access to course materials and 24/7 support from our community."
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Career Growth",
                description: "Get certificates, portfolio projects, and career guidance to help you advance in your professional journey."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group text-center p-6 border border-gray-100 hover:border-purple-200 transition-all duration-300 hover:shadow-lg"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 group-hover:bg-purple-50 text-purple-600 mb-6 transition-colors duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-semibold text-black mb-4">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Statistics Section */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='30' height='30' viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='M15 0C6.716 0 0 6.716 0 15s6.716 15 15 15 15-6.716 15-15S23.284 0 15 0zm0 2c7.18 0 13 5.82 13 13s-5.82 13-13 13S2 22.18 2 15 7.82 2 15 2z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '30px 30px'
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 font-serif">
              Our Global Impact
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Together, we're creating meaningful change through education and charitable giving
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                number: "50,000+",
                label: "Active Learners",
                icon: <Users className="w-6 h-6" />,
                description: "From 120+ countries"
              },
              {
                number: "$2.5M+",
                label: "Donated to Charity",
                icon: <Heart className="w-6 h-6" />,
                description: "Supporting 50+ causes"
              },
              {
                number: "1,200+",
                label: "Expert Courses",
                icon: <BookOpen className="w-6 h-6" />,
                description: "Across 15+ categories"
              },
              {
                number: "98%",
                label: "Success Rate",
                icon: <Target className="w-6 h-6" />,
                description: "Course completion"
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 group-hover:bg-purple-600 text-white mb-4 transition-all duration-300">
                  {stat.icon}
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-lg font-semibold text-gray-300 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-400">{stat.description}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-24 bg-gray-50 relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fillOpacity='0.05'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6 font-serif">
              Success Stories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real transformations from learners who chose to invest in their future
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group bg-white p-8 border border-gray-200 hover:border-purple-200 transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-purple-500 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 text-base leading-relaxed mb-8">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-gray-100"
                  />
                  <div>
                    <div className="font-semibold text-black text-sm">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                    <div className="text-xs font-medium text-purple-600">{testimonial.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ready to Make an Impact Section */}
      <section className="py-24 bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px'
              }}
            />
          </div>
          {/* Subtle purple gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-transparent"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight font-serif">
              Ready to Make an Impact?
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Join thousands of learners who are building skills, advancing careers, 
              and making a positive difference in the world.
            </p>
            
            {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-black bg-white hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
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
                    className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 hover:border-purple-400 hover:bg-purple-900/20 transition-all duration-300"
                  >
                    Explore Free Courses
                  </Link>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Comprehensive Footer */}
      <footer className="bg-white border-t border-gray-200">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black">EduCharity</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Transforming lives through education while making a positive impact on the world. 
                Join our mission to democratize learning and support charitable causes.
              </p>
              <div className="flex space-x-4">
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href="#"
                  className="w-10 h-10 bg-gray-100 hover:bg-purple-600 text-gray-600 hover:text-white flex items-center justify-center transition-all duration-300"
                >
                  <Facebook className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href="#"
                  className="w-10 h-10 bg-gray-100 hover:bg-purple-600 text-gray-600 hover:text-white flex items-center justify-center transition-all duration-300"
                >
                  <Twitter className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href="#"
                  className="w-10 h-10 bg-gray-100 hover:bg-purple-600 text-gray-600 hover:text-white flex items-center justify-center transition-all duration-300"
                >
                  <Instagram className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href="#"
                  className="w-10 h-10 bg-gray-100 hover:bg-purple-600 text-gray-600 hover:text-white flex items-center justify-center transition-all duration-300"
                >
                  <Linkedin className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  href="#"
                  className="w-10 h-10 bg-gray-100 hover:bg-purple-600 text-gray-600 hover:text-white flex items-center justify-center transition-all duration-300"
                >
                  <Youtube className="w-5 h-5" />
                </motion.a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-black mb-6">Quick Links</h4>
              <ul className="space-y-4">
                {[
                  { name: 'About Us', href: '/about' },
                  { name: 'All Courses', href: '/courses' },
                  { name: 'Success Stories', href: '/testimonials' },
                  { name: 'How It Works', href: '/how-it-works' },
                  { name: 'Impact Reports', href: '/impact' },
                  { name: 'Contact Us', href: '/contact' }
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-600 hover:text-purple-600 transition-colors duration-200 flex items-center group"
                    >
                      <span>{link.name}</span>
                      <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Course Categories */}
            <div>
              <h4 className="text-lg font-semibold text-black mb-6">Popular Categories</h4>
              <ul className="space-y-4">
                {[
                  'Data Science',
                  'Software Engineering',
                  'Digital Marketing',
                  'UI/UX Design',
                  'Business & Management',
                  'IoT & Hardware'
                ].map((category) => (
                  <li key={category}>
                    <Link
                      to={`/courses?category=${category.toLowerCase().replace(/\s+/g, '-')}`}
                      className="text-gray-600 hover:text-purple-600 transition-colors duration-200 flex items-center group"
                    >
                      <span>{category}</span>
                      <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold text-black mb-6">Get in Touch</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-gray-600">
                    <p>123 Education Street</p>
                    <p>Learning City, LC 12345</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <a href="tel:+1234567890" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                    +1 (234) 567-890
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <a href="mailto:hello@educharity.com" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                    hello@educharity.com
                  </a>
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="mt-8">
                <h5 className="text-sm font-semibold text-black mb-4">Stay Updated</h5>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-600 focus:border-purple-600 text-sm"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Get updates on new courses and our impact initiatives.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
                <p className="text-sm text-gray-600">
                  © 2024 EduCharity. All rights reserved.
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <Link to="/privacy" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                    Privacy Policy
                  </Link>
                  <span className="text-gray-400">|</span>
                  <Link to="/terms" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                    Terms of Service
                  </Link>
                  <span className="text-gray-400">|</span>
                  <Link to="/cookies" className="text-gray-600 hover:text-purple-600 transition-colors duration-200">
                    Cookie Policy
                  </Link>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span>$2.5M+ donated to charity</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>50K+ active learners</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
