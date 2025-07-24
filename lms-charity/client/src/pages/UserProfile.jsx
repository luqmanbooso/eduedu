import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit3, 
  Save, 
  X, 
  Camera,
  Linkedin,
  Twitter,
  Github,
  Globe,
  Award,
  BookOpen,
  Clock,
  BarChart3
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import FileUpload from '../components/FileUpload';
import CertificateManager from '../components/CertificateManager';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    location: '',
    phoneNumber: '',
    dateOfBirth: '',
    skills: [],
    socialLinks: {
      linkedin: '',
      twitter: '',
      github: '',
      website: ''
    }
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      setProfileData(response.data);
      setEditForm({
        name: response.data.name || '',
        bio: response.data.bio || '',
        location: response.data.location || '',
        phoneNumber: response.data.phoneNumber || '',
        dateOfBirth: response.data.dateOfBirth ? response.data.dateOfBirth.split('T')[0] : '',
        skills: response.data.skills || [],
        socialLinks: response.data.socialLinks || {
          linkedin: '',
          twitter: '',
          github: '',
          website: ''
        }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('Fetching stats from:', '/profile/stats');
      const response = await api.get('/profile/stats');
      console.log('Stats response:', response.data);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      console.error('Request URL:', error.config?.url);
      // Set default stats if API fails
      setStats({
        general: {
          totalCourses: 0,
          completedCourses: 0,
          certificatesEarned: 0,
          totalLearningTime: 0
        },
        progress: {
          averageProgress: 0,
          currentStreak: 0,
          lastActivity: 'No recent activity'
        }
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await api.put('/profile', editForm);
      setProfileData(response.data.user);
      updateUser(response.data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const uploadResponse = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const avatarResponse = await api.put('/profile/avatar', {
        avatar: uploadResponse.data.url
      });

      setProfileData(prev => ({ ...prev, avatar: avatarResponse.data.avatar }));
      updateUser({ ...user, avatar: avatarResponse.data.avatar });
      toast.success('Avatar updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const addSkill = (skill) => {
    if (skill && !editForm.skills.includes(skill)) {
      setEditForm(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="bg-gradient-to-r from-purple-600 to-black h-32"></div>
          <div className="px-6 pb-6">
            <div className="flex items-end space-x-6 -mt-16">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={profileData?.avatar || '/api/placeholder/128/128'}
                  alt={profileData?.name}
                  className="w-32 h-32 border-4 border-white shadow-lg object-cover"
                />
                <label className="absolute bottom-2 right-2 bg-purple-600 p-2 cursor-pointer hover:bg-purple-700 transition-colors">
                  <Camera size={16} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && handleAvatarUpload(e.target.files[0])}
                    disabled={uploading}
                  />
                </label>
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-black font-serif">
                      {profileData?.name}
                    </h1>
                    <p className="text-gray-600 capitalize">
                      {profileData?.role}
                    </p>
                    {profileData?.location && (
                      <p className="text-gray-500 flex items-center mt-1">
                        <MapPin size={16} className="mr-1" />
                        {profileData.location}
                      </p>
                    )}
                  </div>
                  <motion.button
                    onClick={() => setIsEditing(!isEditing)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 flex items-center space-x-2 transition-colors ${
                      isEditing 
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {isEditing ? <X size={16} /> : <Edit3 size={16} />}
                    <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                  </motion.button>
                </div>

                {/* Stats */}
                {stats && (
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{stats.general.coursesCompleted}</p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-black">{stats.general.certificatesEarned}</p>
                      <p className="text-sm text-gray-600">Certificates</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-500">
                        {Math.round(stats.general.totalLearningTime / 60)}h
                      </p>
                      <p className="text-sm text-gray-600">Learning Time</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mt-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </motion.button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Edit Form */}
              {isEditing ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Edit Profile
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editForm.phoneNumber}
                        onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={editForm.dateOfBirth}
                        onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  {/* Skills */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Skills
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {editForm.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center space-x-1"
                        >
                          <span>{skill}</span>
                          <button
                            onClick={() => removeSkill(skill)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add a skill and press Enter"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill(e.target.value.trim());
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>

                  {/* Social Links */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Social Links
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(editForm.socialLinks).map(([platform, url]) => (
                        <div key={platform}>
                          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1 capitalize">
                            {platform}
                          </label>
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => setEditForm({
                              ...editForm,
                              socialLinks: {
                                ...editForm.socialLinks,
                                [platform]: e.target.value
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder={`https://${platform}.com/username`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
                    >
                      <Save size={16} />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Profile Display */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Info */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* About */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        About
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {profileData?.bio || 'No bio provided yet.'}
                      </p>
                    </div>

                    {/* Skills */}
                    {profileData?.skills && profileData.skills.length > 0 && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {profileData.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-sm"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Contact Info
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Mail size={16} className="text-gray-500" />
                          <span className="text-gray-600 dark:text-gray-400">{profileData?.email}</span>
                        </div>
                        {profileData?.phoneNumber && (
                          <div className="flex items-center space-x-3">
                            <Phone size={16} className="text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">{profileData.phoneNumber}</span>
                          </div>
                        )}
                        {profileData?.dateOfBirth && (
                          <div className="flex items-center space-x-3">
                            <Calendar size={16} className="text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {new Date(profileData.dateOfBirth).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Social Links */}
                    {profileData?.socialLinks && Object.values(profileData.socialLinks).some(link => link) && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Social Links
                        </h3>
                        <div className="space-y-3">
                          {profileData.socialLinks.linkedin && (
                            <a
                              href={profileData.socialLinks.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-3 text-blue-600 hover:text-blue-800"
                            >
                              <Linkedin size={16} />
                              <span>LinkedIn</span>
                            </a>
                          )}
                          {profileData.socialLinks.twitter && (
                            <a
                              href={profileData.socialLinks.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-3 text-blue-400 hover:text-blue-600"
                            >
                              <Twitter size={16} />
                              <span>Twitter</span>
                            </a>
                          )}
                          {profileData.socialLinks.github && (
                            <a
                              href={profileData.socialLinks.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-3 text-gray-800 hover:text-gray-600 dark:text-gray-300"
                            >
                              <Github size={16} />
                              <span>GitHub</span>
                            </a>
                          )}
                          {profileData.socialLinks.website && (
                            <a
                              href={profileData.socialLinks.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-3 text-green-600 hover:text-green-800"
                            >
                              <Globe size={16} />
                              <span>Website</span>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'certificates' && <CertificateManager />}
          {activeTab === 'analytics' && <AnalyticsDashboard type="student" />}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
