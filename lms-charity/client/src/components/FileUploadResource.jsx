import React, { useState, useEffect } from 'react';
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

  // Cleanup is no longer needed for blob URLs since we use server URLs
  useEffect(() => {
    // No cleanup needed for server-hosted files
  }, []);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type, mimeType = '') => {
    // Use mime type if available, otherwise use our mapped type
    const checkType = mimeType || type;
    
    if (checkType.startsWith('image/') || type === 'image') return '🖼️';
    if (checkType.startsWith('video/') || type === 'video') return '🎥';
    if (checkType.startsWith('audio/')) return '🎵';
    if (checkType.includes('pdf') || type === 'pdf') return '📄';
    if (checkType.includes('word') || checkType.includes('document') || type === 'document') return '📝';
    if (checkType.includes('excel') || checkType.includes('spreadsheet')) return '📊';
    if (checkType.includes('powerpoint') || checkType.includes('presentation')) return '📽️';
    if (checkType.includes('zip') || checkType.includes('rar')) return '📦';
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
      
      try {
        // Upload file to server
        const uploadedResource = await uploadFileToServer(file);
        
        if (uploadedResource) {
          newResources.push(uploadedResource);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert(`Failed to upload ${file.name}: ${error.message}`);
      }
    }
    
    if (newResources.length > 0) {
      onResourcesChange([...resources, ...newResources]);
    }
    
    setUploading(false);
  };

  const uploadFileToServer = async (file) => {
    const formData = new FormData();
    
    // Map file type to backend enum values
    const getResourceType = (mimeType) => {
      if (mimeType.startsWith('video/')) return 'video';
      if (mimeType === 'application/pdf') return 'pdf';
      if (mimeType.startsWith('image/')) return 'image';
      return 'document';
    };

    const resourceType = getResourceType(file.type);
    
    // Determine the upload endpoint based on file type
    let uploadEndpoint;
    let fieldName;
    
    if (file.type.startsWith('image/')) {
      uploadEndpoint = '/api/upload/image';
      fieldName = 'image';
    } else if (file.type.startsWith('video/')) {
      uploadEndpoint = '/api/upload/video';
      fieldName = 'video';
    } else {
      uploadEndpoint = '/api/upload/document';
      fieldName = 'document';
    }
    
    formData.append(fieldName, file);
    
    const response = await fetch(`http://localhost:5000${uploadEndpoint}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Upload failed');
    }
    
    const data = await response.json();
    
    // Return resource object with server URL
    return {
      id: Date.now() + Math.random(),
      title: file.name,
      url: `http://localhost:5000${data.url}`, // Full server URL
      type: resourceType,
      mimeType: file.type,
      size: data.size || file.size,
      uploadedAt: new Date().toISOString(),
      filename: data.filename,
      originalName: data.originalName
    };
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
    // Just remove from the list - server files remain on server
    // In a production app, you might want to call a delete endpoint
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
                  <span className="text-2xl">{getFileIcon(resource.type, resource.mimeType)}</span>
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
                  {((resource.mimeType && resource.mimeType.startsWith('image/')) || resource.type === 'image') && (
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
