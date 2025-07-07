import React, { useState, useEffect } from 'react';
import { Trash2, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { detectFileType, getFileTypeIcon, getFileTypeDisplayName } from '../utils/fileTypeDetection';

const ResourceInput = React.memo(({ 
  resource, 
  index, 
  onUpdate, 
  onRemove, 
  showPreview = true 
}) => {
  const [detectedType, setDetectedType] = useState(resource.type || 'link');
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [showUrlPreview, setShowUrlPreview] = useState(false);

  // Auto-detect file type when URL changes
  useEffect(() => {
    if (resource.url && resource.url.trim()) {
      try {
        // Basic URL validation
        new URL(resource.url);
        setIsValidUrl(true);
        
        const detected = detectFileType(resource.url);
        setDetectedType(detected);
        
        // Auto-update the resource type if it's different
        if (detected !== resource.type) {
          onUpdate(index, { ...resource, type: detected });
        }
      } catch (error) {
        setIsValidUrl(false);
      }
    } else {
      setIsValidUrl(true);
      setDetectedType('link');
    }
  }, [resource.url, resource.type, index, onUpdate]);

  const handleNameChange = (e) => {
    onUpdate(index, { ...resource, name: e.target.value });
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    onUpdate(index, { ...resource, url });
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setDetectedType(newType);
    onUpdate(index, { ...resource, type: newType });
  };

  return (
    <div className="border rounded-lg p-4 mb-3 bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="space-y-3">
        {/* Resource Name */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Resource Name
          </label>
          <input
            type="text"
            value={resource.name}
            onChange={handleNameChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Course Syllabus, Tutorial Video, Code Examples..."
          />
        </div>

        {/* Resource URL */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Resource URL
          </label>
          <div className="relative">
            <input
              type="url"
              value={resource.url}
              onChange={handleUrlChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                !isValidUrl ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="https://example.com/resource"
            />
            {resource.url && (
              <button
                onClick={() => setShowUrlPreview(!showUrlPreview)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title={showUrlPreview ? 'Hide preview' : 'Show preview'}
              >
                {showUrlPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          </div>
          {!isValidUrl && (
            <p className="text-xs text-red-600 mt-1">Please enter a valid URL</p>
          )}
        </div>

        {/* File Type Detection & Manual Override */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getFileTypeIcon(detectedType)}</span>
              <div>
                <p className="text-xs font-medium text-gray-700">
                  {getFileTypeDisplayName(detectedType)}
                </p>
                {detectedType !== 'link' && (
                  <p className="text-xs text-gray-500">Auto-detected</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Manual Type Override */}
            <select
              value={detectedType}
              onChange={handleTypeChange}
              className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              title="Override detected type"
            >
              <option value="link">Website Link</option>
              <option value="pdf">PDF Document</option>
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="image">Image</option>
              <option value="code">Code/Repository</option>
              <option value="tutorial">Tutorial</option>
              <option value="article">Article</option>
              <option value="reference">Reference</option>
              <option value="ebook">E-book</option>
              <option value="spreadsheet">Spreadsheet</option>
              <option value="presentation">Presentation</option>
              <option value="archive">Archive</option>
            </select>

            {/* External Link */}
            {resource.url && isValidUrl && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-blue-600 hover:text-blue-800"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Remove Button */}
            <button
              onClick={() => onRemove(index)}
              className="p-1 text-red-600 hover:text-red-800"
              title="Remove resource"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* URL Preview */}
        {showPreview && showUrlPreview && resource.url && isValidUrl && (
          <div className="mt-2 p-2 bg-white rounded border border-gray-200">
            <p className="text-xs text-gray-600 break-all">{resource.url}</p>
            {resource.url.length > 60 && (
              <p className="text-xs text-gray-500 mt-1">
                Domain: {new URL(resource.url).hostname}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

ResourceInput.displayName = 'ResourceInput';

export default ResourceInput;
