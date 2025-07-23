import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, Mail, Phone, MapPin, Edit3, Save, X, Camera } from 'lucide-react';

const InstructorProfile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    location: '',
    phoneNumber: '',
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/profile');
      setProfileData(response.data);
      setEditForm({
        name: response.data.name || '',
        bio: response.data.bio || '',
        location: response.data.location || '',
        phoneNumber: response.data.phoneNumber || '',
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await axios.put('/profile', editForm);
      setProfileData(response.data.user);
      updateUser(response.data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      const uploadResponse = await axios.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const avatarResponse = await axios.put('/profile/avatar', {
        avatar: uploadResponse.data.url
      });
      setProfileData(prev => ({ ...prev, avatar: avatarResponse.data.avatar }));
      updateUser({ ...user, avatar: avatarResponse.data.avatar });
      toast.success('Avatar updated successfully!');
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      await axios.delete('/profile');
      toast.success('Account deleted. Goodbye!');
      // Log out and redirect
      updateUser(null);
      localStorage.removeItem('token');
      window.location.href = '/';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    onChange={e => e.target.files[0] && handleAvatarUpload(e.target.files[0])}
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
                    <p className="text-gray-600 capitalize">Instructor</p>
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
              </div>
            </div>
          </div>
        </motion.div>
        <div className="mt-8">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-white rounded-lg p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={editForm.phoneNumber}
                    onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
              <p className="text-gray-600 mb-4">{profileData?.bio || 'No bio provided yet.'}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contact Info</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Mail size={16} className="text-gray-500" />
                      <span className="text-gray-600">{profileData?.email}</span>
                    </div>
                    {profileData?.phoneNumber && (
                      <div className="flex items-center space-x-2">
                        <Phone size={16} className="text-gray-500" />
                        <span className="text-gray-600">{profileData.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className="text-gray-500" />
                    <span className="text-gray-600">{profileData?.location || 'Not set'}</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorProfile; 