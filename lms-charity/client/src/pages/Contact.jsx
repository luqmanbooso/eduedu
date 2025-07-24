import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { contactAPI } from '../services/api';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle, Star, Globe, Users, Heart } from 'lucide-react';

const Contact = () => {
  const { user, loading } = useAuth();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    type: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [adminMessages, setAdminMessages] = useState([]);
  const [fetchingMessages, setFetchingMessages] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.role === 'admin') {
      setFetchingMessages(true);
      contactAPI.getContactMessages()
        .then(setAdminMessages)
        .catch(() => setError('Failed to fetch messages.'))
        .finally(() => setFetchingMessages(false));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await contactAPI.sendContactMessage(formData);
      setIsSubmitted(true);
      setFormData({ subject: '', message: '', type: 'general' });
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to reject/delete this message?')) return;
    await contactAPI.deleteContactMessage(id);
    setAdminMessages((msgs) => msgs.filter((msg) => msg._id !== id));
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      content: "hello@educharity.com",
      description: "Send us an email anytime",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      content: "+1 (555) 123-4567",
      description: "Mon-Fri 9AM-6PM EST",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Visit Us",
      content: "123 Education St, Learning City, LC 12345",
      description: "Our headquarters",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  const faqs = [
    {
      question: "How do course donations work?",
      answer: "Every time you complete a course, we automatically donate a portion of our revenue to verified charitable organizations. You can track your impact through your dashboard."
    },
    {
      question: "Are the courses really free?",
      answer: "Yes! All our basic courses are completely free. We offer premium features and advanced courses through our subscription plans, but core learning remains accessible to everyone."
    },
    {
      question: "How do I become an instructor?",
      answer: "You can apply to become an instructor through our platform. We review applications based on expertise, teaching experience, and content quality. Approved instructors receive support and resources to create engaging courses."
    },
    {
      question: "Can I get certificates for completed courses?",
      answer: "Absolutely! You receive digital certificates for all completed courses, which you can share on professional networks like LinkedIn or download for your portfolio."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full mb-8"
            >
              <MessageCircle className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Get in Touch</span>
            </motion.div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              We'd Love to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                {" "}Hear From You
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Have questions, suggestions, or want to partner with us? 
              Our team is here to help you make the most of your learning journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group relative bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${info.gradient} text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                    {info.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{info.title}</h3>
                  <p className="text-lg font-semibold text-indigo-600 mb-2">{info.content}</p>
                  <p className="text-gray-600">{info.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Fill out the form below and we'll get back to you as soon as possible. 
                We typically respond within 24 hours.
              </p>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading...</p>
                </div>
              ) : user ? (
                <>
                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center"
                    >
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-green-800 mb-2">Message Sent!</h3>
                      <p className="text-green-600">Thank you for reaching out. We'll get back to you soon.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                            Your Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-900"
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-900"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="type" className="block text-sm font-semibold text-gray-900 mb-2">
                          Inquiry Type
                        </label>
                        <select
                          id="type"
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-900"
                        >
                          <option value="general">General Inquiry</option>
                          <option value="technical">Technical Support</option>
                          <option value="partnership">Partnership</option>
                          <option value="instructor">Become an Instructor</option>
                          <option value="feedback">Feedback</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-semibold text-gray-900 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-900"
                          placeholder="How can we help you?"
                        />
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                          Message
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          rows={6}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-900 resize-none"
                          placeholder="Tell us more about your inquiry..."
                        />
                      </div>

                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 w-5 h-5" />
                            Send Message
                          </>
                        )}
                      </motion.button>
                    </form>
                  )}
                </>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
                  <h3 className="text-2xl font-bold text-yellow-800 mb-2">Please Log In</h3>
                  <p className="text-yellow-600">You must be logged in to send a message.</p>
                  <a
                    href="/login"
                    className="mt-4 inline-flex items-center px-6 py-3 text-lg font-semibold text-indigo-600 bg-white rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl"
                  >
                    Log In
                    <Star className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                  </a>
                </div>
              )}

              {error && (
                <div className="mt-6 text-center text-red-600">
                  {error}
                </div>
              )}
            </motion.div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Quick answers to common questions about our platform and services.
              </p>

              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
                <p className="text-gray-600 mb-4">
                  Can't find what you're looking for? Our support team is here to help!
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>24/7 Support</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>4.9/5 Rating</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex justify-center space-x-4 mb-8">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-100" />
                <span className="text-purple-100">50k+ Happy Learners</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-purple-100" />
                <span className="text-purple-100">180+ Countries</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-purple-100" />
                <span className="text-purple-100">$2M+ Donated</span>
              </div>
            </div>

            <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              Ready to Start Learning?
            </h2>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto leading-relaxed">
              Join our community of learners making a difference. 
              Start your educational journey today and contribute to positive change.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a
                  href="/register"
                  className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  Get Started Free
                  <Star className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                </a>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <a
                  href="/courses"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-2xl hover:border-white/50 hover:bg-white/10 transition-all duration-300"
                >
                  Browse Courses
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {user && user.role === 'admin' && (
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Contact Messages</h2>
          {fetchingMessages ? (
            <div className="text-center py-8">Loading messages...</div>
          ) : adminMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No messages found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-xl">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">User</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Subject</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Message</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {adminMessages.map((msg) => (
                    <tr key={msg._id} className="border-t">
                      <td className="px-4 py-2">{msg.name || msg.user?.name}</td>
                      <td className="px-4 py-2">{msg.email || msg.user?.email}</td>
                      <td className="px-4 py-2">{msg.subject}</td>
                      <td className="px-4 py-2">{msg.type}</td>
                      <td className="px-4 py-2 max-w-xs truncate" title={msg.message}>{msg.message}</td>
                      <td className="px-4 py-2">{new Date(msg.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-2">
                        <button onClick={() => handleDelete(msg._id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition">Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Contact;
