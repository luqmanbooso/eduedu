import React from 'react';
import { Plus, Trash2, FileText, Calendar, Clock, Upload, File } from 'lucide-react';

const AssignmentLessonForm = React.memo(({ lessonData, onUpdate }) => {
  const addRubricCriteria = () => {
    const newCriteria = [...(lessonData.assignment?.rubric || []), {
      id: Date.now(),
      criteria: '',
      maxPoints: 10,
      description: ''
    }];
    
    onUpdate({
      ...lessonData,
      assignment: {
        ...lessonData.assignment,
        rubric: newCriteria
      }
    });
  };

  const updateRubricCriteria = (index, field, value) => {
    const newCriteria = [...(lessonData.assignment?.rubric || [])];
    newCriteria[index] = {
      ...newCriteria[index],
      [field]: value
    };
    
    onUpdate({
      ...lessonData,
      assignment: {
        ...lessonData.assignment,
        rubric: newCriteria
      }
    });
  };

  const removeCriteria = (index) => {
    const newCriteria = (lessonData.assignment?.rubric || []).filter((_, i) => i !== index);
    onUpdate({
      ...lessonData,
      assignment: {
        ...lessonData.assignment,
        rubric: newCriteria
      }
    });
  };

  const handleResourceUpload = (file) => {
    if (!file) return;
    
    // In a real app, upload to server
    const resourceUrl = URL.createObjectURL(file);
    const newResources = [...(lessonData.assignment?.resources || []), {
      id: Date.now(),
      name: file.name,
      url: resourceUrl,
      type: file.type,
      size: file.size
    }];
    
    onUpdate({
      ...lessonData,
      assignment: {
        ...lessonData.assignment,
        resources: newResources
      }
    });
  };

  const removeResource = (index) => {
    const newResources = (lessonData.assignment?.resources || []).filter((_, i) => i !== index);
    onUpdate({
      ...lessonData,
      assignment: {
        ...lessonData.assignment,
        resources: newResources
      }
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Assignment Details */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h4 className="font-medium text-gray-900">Assignment Details</h4>
        
        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assignment Instructions
          </label>
          <textarea
            value={lessonData.assignment?.instructions || ''}
            onChange={(e) => onUpdate({
              ...lessonData,
              assignment: {
                ...lessonData.assignment,
                instructions: e.target.value
              }
            })}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Provide detailed instructions for this assignment..."
          />
        </div>

        {/* Assignment Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date (Days from start)
            </label>
            <input
              type="number"
              value={lessonData.assignment?.dueDays || 7}
              onChange={(e) => onUpdate({
                ...lessonData,
                assignment: {
                  ...lessonData.assignment,
                  dueDays: parseInt(e.target.value) || 7
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Points
            </label>
            <input
              type="number"
              value={lessonData.assignment?.maxPoints || 100}
              onChange={(e) => onUpdate({
                ...lessonData,
                assignment: {
                  ...lessonData.assignment,
                  maxPoints: parseInt(e.target.value) || 100
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Submission Type
            </label>
            <select
              value={lessonData.assignment?.submissionType || 'file'}
              onChange={(e) => onUpdate({
                ...lessonData,
                assignment: {
                  ...lessonData.assignment,
                  submissionType: e.target.value
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="file">File Upload</option>
              <option value="text">Text Entry</option>
              <option value="url">URL Submission</option>
              <option value="both">File + Text</option>
            </select>
          </div>
        </div>

        {/* Additional Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={lessonData.assignment?.allowLateSubmission || false}
              onChange={(e) => onUpdate({
                ...lessonData,
                assignment: {
                  ...lessonData.assignment,
                  allowLateSubmission: e.target.checked
                }
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Allow late submissions</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={lessonData.assignment?.requirePeerReview || false}
              onChange={(e) => onUpdate({
                ...lessonData,
                assignment: {
                  ...lessonData.assignment,
                  requirePeerReview: e.target.checked
                }
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Require peer review</span>
          </label>
        </div>
      </div>

      {/* Grading Rubric */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Grading Rubric</h4>
          <button
            onClick={addRubricCriteria}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Criteria</span>
          </button>
        </div>

        {!lessonData.assignment?.rubric?.length ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No grading criteria yet</p>
            <button
              onClick={addRubricCriteria}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add First Criteria
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {lessonData.assignment.rubric.map((criteria, index) => (
              <div key={criteria.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-3">
                  <h5 className="font-medium text-gray-900">Criteria {index + 1}</h5>
                  <button
                    onClick={() => removeCriteria(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Criteria Name
                    </label>
                    <input
                      type="text"
                      value={criteria.criteria}
                      onChange={(e) => updateRubricCriteria(index, 'criteria', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Code Quality, Documentation, Functionality"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Points
                    </label>
                    <input
                      type="number"
                      value={criteria.maxPoints}
                      onChange={(e) => updateRubricCriteria(index, 'maxPoints', parseInt(e.target.value) || 10)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={criteria.description}
                    onChange={(e) => updateRubricCriteria(index, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what students need to do to earn full points for this criteria..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignment Resources */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Assignment Resources</h4>
          <div>
            <input
              type="file"
              onChange={(e) => handleResourceUpload(e.target.files[0])}
              className="hidden"
              id="assignment-resource-upload"
              multiple
            />
            <label
              htmlFor="assignment-resource-upload"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Resource</span>
            </label>
          </div>
        </div>

        {!lessonData.assignment?.resources?.length ? (
          <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
            <File className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No resources uploaded yet</p>
            <p className="text-xs text-gray-500 mt-1">Upload files, templates, or examples for students</p>
          </div>
        ) : (
          <div className="space-y-2">
            {lessonData.assignment.resources.map((resource, index) => (
              <div key={resource.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <File className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{resource.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(resource.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <a
                    href={resource.url}
                    download={resource.name}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Download
                  </a>
                  <button
                    onClick={() => removeResource(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

AssignmentLessonForm.displayName = 'AssignmentLessonForm';

export default AssignmentLessonForm;
