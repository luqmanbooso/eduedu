import React, { useState, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

const CourseBasicsForm = ({ courseData, onCourseDataChange, categories, levels }) => {
  const [newTag, setNewTag] = useState('');
  
  // Use refs to maintain input references
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);

  const handleTitleChange = useCallback((e) => {
    onCourseDataChange('title', e.target.value);
  }, [onCourseDataChange]);

  const handleDescriptionChange = useCallback((e) => {
    onCourseDataChange('description', e.target.value);
  }, [onCourseDataChange]);

  const handleCategoryChange = useCallback((e) => {
    onCourseDataChange('category', e.target.value);
  }, [onCourseDataChange]);

  const handleLevelChange = useCallback((e) => {
    onCourseDataChange('level', e.target.value);
  }, [onCourseDataChange]);

  const addTag = useCallback(() => {
    if (newTag.trim() && !courseData.tags.includes(newTag.trim())) {
      const updatedTags = [...courseData.tags, newTag.trim()];
      onCourseDataChange('tags', updatedTags);
      setNewTag('');
    }
  }, [newTag, courseData.tags, onCourseDataChange]);

  const removeTag = useCallback((tagToRemove) => {
    const updatedTags = courseData.tags.filter(tag => tag !== tagToRemove);
    onCourseDataChange('tags', updatedTags);
  }, [courseData.tags, onCourseDataChange]);

  const handleTagKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }, [addTag]);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's start with the basics</h2>
        <p className="text-gray-600">Give your course a compelling title and description</p>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Course Title</label>
          <input
            ref={titleRef}
            type="text"
            value={courseData.title}
            onChange={handleTitleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            placeholder="e.g., Complete React Development Masterclass 2024"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Course Description</label>
          <textarea
            ref={descriptionRef}
            value={courseData.description}
            onChange={handleDescriptionChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe what students will learn and achieve in this course..."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
            <select
              value={courseData.category}
              onChange={handleCategoryChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Level</label>
            <select
              value={courseData.level}
              onChange={handleLevelChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {levels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Tags</label>
          <div className="flex items-center space-x-2 mb-3">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleTagKeyPress}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a tag..."
            />
            <button
              onClick={addTag}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {courseData.tags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CourseBasicsForm);
