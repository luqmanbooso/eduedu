import React, { useState } from 'react';
import { Upload, File, Trash2, Download, Eye, X } from 'lucide-react';

const FileUploadResource = React.memo(({ 
  resources = [], 
  onResourcesChange, 
  allowedTypes = "all",
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📽️';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📁';
  };

  const validateFile = (file) => {
    if (file.size > maxFileSize) {
      return `File size must be less than ${formatFileSize(maxFileSize)}`;
    }
    
    if (allowedTypes !== "all") {
      const allowedTypesArray = allowedTypes.split(',').map(t => t.trim());
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const isAllowed = allowedTypesArray.some(type => 
        file.type.includes(type) || fileExtension === type
      );
      
      if (!isAllowed) {
        return `File type not allowed. Allowed types: ${allowedTypes}`;
      }
    }
    
    if (resources.length >= maxFiles) {
      return `Maximum ${maxFiles} files allowed`;
    }
    
    return null;
  };

  const handleFileUpload = async (files) => {
    setUploading(true);
    const newResources = [];
    
    for (let file of files) {
      const error = validateFile(file);
      if (error) {
        alert(error);
        continue;
      }
      
      // Create object URL for preview (in real app, upload to server)
      const url = URL.createObjectURL(file);
      
      // Map file type to backend enum values
      const getResourceType = (mimeType) => {
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType === 'application/pdf') return 'pdf';
        if (mimeType.startsWith('image/')) return 'image';
        return 'document';
      };
      
      const resource = {
        id: Date.now() + Math.random(),
        title: file.name, // Backend expects 'title', not 'name'
        url: url,
        type: getResourceType(file.type), // Map to backend enum values
        size: file.size,
        uploadedAt: new Date().toISOString(),
        file: file // Keep reference for actual upload
      };
      
      newResources.push(resource);
    }
    
    if (newResources.length > 0) {
      onResourcesChange([...resources, ...newResources]);
    }
    
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFileUpload(files);
    e.target.value = ''; // Reset input
  };

  const removeResource = (id) => {
    const updatedResources = resources.filter(resource => resource.id !== id);
    onResourcesChange(updatedResources);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          type="file"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload-input"
          multiple
          disabled={uploading || resources.length >= maxFiles}
        />
        
        {uploading ? (
          <div className="py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Uploading files...</p>
          </div>
        ) : (
          <label htmlFor="file-upload-input" className="cursor-pointer block">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm text-gray-500">
              {allowedTypes === "all" ? "Any file type" : `Allowed: ${allowedTypes}`}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Max {formatFileSize(maxFileSize)} per file, {maxFiles} files total
            </p>
          </label>
        )}
      </div>

      {/* Uploaded Files List */}
      {resources.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Resources ({resources.length}/{maxFiles})
          </h4>
          
          <div className="space-y-2">
            {resources.map((resource) => (
              <div key={resource.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(resource.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {resource.title || resource.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(resource.size)} • {resource.type || 'Unknown type'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Preview for images */}
                  {resource.type && resource.type.includes('image') && (
                    <button
                      onClick={() => window.open(resource.url, '_blank')}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* Download */}
                  <a
                    href={resource.url}
                    download={resource.title || resource.name}
                    className="p-1 text-green-600 hover:text-green-800"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  
                  {/* Remove */}
                  <button
                    onClick={() => removeResource(resource.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Upload Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h5 className="text-sm font-medium text-blue-900 mb-1">Upload Tips:</h5>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Upload reference materials, templates, or example files</li>
          <li>• Students will be able to download these resources</li>
          <li>• Supported: Documents, images, videos, code files, archives</li>
          <li>• Keep file names descriptive and organized</li>
        </ul>
      </div>
    </div>
  );
});

FileUploadResource.displayName = 'FileUploadResource';

export default FileUploadResource;
