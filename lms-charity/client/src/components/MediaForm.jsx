import React from 'react';
import { Image, PlayCircle } from 'lucide-react';

const MediaForm = React.memo(({ 
  courseData, 
  onFileUpload,
  isUploading,
  uploadProgress
}) => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add course media</h2>
        <p className="text-gray-600">Upload a thumbnail and preview video to showcase your course</p>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Thumbnail */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Thumbnail</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => onFileUpload(e.target.files[0], 'thumbnail')}
              className="hidden"
              id="thumbnail-upload"
            />
            <label htmlFor="thumbnail-upload" className="cursor-pointer block">
              {courseData.thumbnail ? (
                <img src={courseData.thumbnail} alt="Thumbnail" className="w-full h-48 object-cover rounded-lg mb-4" />
              ) : (
                <div className="mb-4">
                  <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Click to upload thumbnail</p>
                  <p className="text-sm text-gray-500 mt-2">Recommended: 1920x1080 pixels</p>
                </div>
              )}
              {isUploading && (
                <div className="mt-4">
                  <div className="bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Uploading... {uploadProgress}%</p>
                </div>
              )}
            </label>
          </div>
        </div>
        
        {/* Preview Video */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview Video (Optional)</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => onFileUpload(e.target.files[0], 'preview')}
              className="hidden"
              id="preview-upload"
            />
            <label htmlFor="preview-upload" className="cursor-pointer block">
              {courseData.previewVideo ? (
                <div className="mb-4">
                  <video src={courseData.previewVideo} className="w-full h-48 object-cover rounded-lg" controls />
                </div>
              ) : (
                <div className="mb-4">
                  <PlayCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Click to upload preview video</p>
                  <p className="text-sm text-gray-500 mt-2">Keep it under 2 minutes</p>
                </div>
              )}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
});

MediaForm.displayName = 'MediaForm';

export default MediaForm;
