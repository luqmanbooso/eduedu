import React, { useState, useCallback, useEffect } from 'react';
import { 
  Video, Upload, Play, Trash2, Plus, FileText, 
  CheckCircle, Clock, AlertCircle, File
} from 'lucide-react';

const VideoLessonForm = React.memo(({ lessonData, onUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Cleanup blob URLs when component unmounts or video changes
  useEffect(() => {
    return () => {
      if (lessonData.videoUrl && lessonData.videoUrl.startsWith('blob:')) {
        URL.revokeObjectURL(lessonData.videoUrl);
      }
    };
  }, []);

  const handleVideoRemove = useCallback(() => {
    // No need to clean up server URLs
    onUpdate({ 
      ...lessonData, 
      videoUrl: '', 
      videoDuration: 0, 
      videoFile: null 
    });
  }, [lessonData, onUpdate]);

  const handleVideoUpload = useCallback(async (file) => {
    if (!file) return;
    
    // Clean up previous video URL if it exists and it's a blob URL
    if (lessonData.videoUrl && lessonData.videoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(lessonData.videoUrl);
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Upload to server
      const formData = new FormData();
      formData.append('video', file);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);
      
      const response = await fetch('http://localhost:5000/api/upload/video', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      const data = await response.json();
      const videoUrl = `http://localhost:5000${data.url}`;
      
      // Get video duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        const duration = Math.round(video.duration);
        
        setUploadProgress(100);
        onUpdate({
          ...lessonData,
          videoUrl,
          videoDuration: duration,
          videoFile: null // Remove file reference since it's uploaded
        });
        setUploading(false);
      };
      
      video.onerror = () => {
        // If we can't get duration, just proceed without it
        setUploadProgress(100);
        onUpdate({
          ...lessonData,
          videoUrl,
          videoDuration: 0,
          videoFile: null
        });
        setUploading(false);
      };
      
      video.src = videoUrl;
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload video: ${error.message}`);
      setUploading(false);
      setUploadProgress(0);
    }
  }, [lessonData, onUpdate]);

  return (
    <div className="space-y-4">
      {/* Video Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video File
        </label>
        
        {!lessonData.videoUrl ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => handleVideoUpload(e.target.files[0])}
              className="hidden"
              id="video-upload"
              disabled={uploading}
            />
            <label htmlFor="video-upload" className="cursor-pointer block">
              {uploading ? (
                <div>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Uploading video...</p>
                  <div className="bg-blue-200 rounded-full h-2 mt-2 max-w-xs mx-auto">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{uploadProgress}%</p>
                </div>
              ) : (
                <div>
                  <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Click to upload video</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports MP4, AVI, MOV, WebM
                  </p>
                </div>
              )}
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <video 
                src={lessonData.videoUrl} 
                className="w-full h-48 object-cover rounded-lg"
                controls
                onError={(e) => {
                  console.warn('Video load error:', e);
                  // Don't auto-remove on error as it might be a temporary network issue
                }}
                onLoadStart={() => {
                  // Video is starting to load
                }}
              />
              <button
                onClick={handleVideoRemove}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            {lessonData.videoDuration > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                Duration: {Math.floor(lessonData.videoDuration / 60)}:{String(lessonData.videoDuration % 60).padStart(2, '0')}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Video Description
        </label>
        <textarea
          value={lessonData.videoDescription || ''}
          onChange={(e) => onUpdate({ ...lessonData, videoDescription: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe what students will learn in this video..."
        />
      </div>

      {/* Video Timestamps (optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Key Timestamps (Optional)
        </label>
        {(lessonData.timestamps || []).map((timestamp, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={timestamp.time || ''}
              onChange={(e) => {
                const newTimestamps = [...(lessonData.timestamps || [])];
                newTimestamps[index] = { ...newTimestamps[index], time: e.target.value };
                onUpdate({ ...lessonData, timestamps: newTimestamps });
              }}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="0:00"
            />
            <input
              type="text"
              value={timestamp.description || ''}
              onChange={(e) => {
                const newTimestamps = [...(lessonData.timestamps || [])];
                newTimestamps[index] = { ...newTimestamps[index], description: e.target.value };
                onUpdate({ ...lessonData, timestamps: newTimestamps });
              }}
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="Description of this section..."
            />
            <button
              onClick={() => {
                const newTimestamps = (lessonData.timestamps || []).filter((_, i) => i !== index);
                onUpdate({ ...lessonData, timestamps: newTimestamps });
              }}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() => {
            const newTimestamps = [...(lessonData.timestamps || []), { time: '', description: '' }];
            onUpdate({ ...lessonData, timestamps: newTimestamps });
          }}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Timestamp
        </button>
      </div>
    </div>
  );
});

VideoLessonForm.displayName = 'VideoLessonForm';

export default VideoLessonForm;
