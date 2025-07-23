import React from 'react';
import { useParams } from 'react-router-dom';

const CourseEditPlaceholder = () => {
  const { id } = useParams();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Edit Course</h1>
      <p className="text-gray-600">Course ID: {id}</p>
      <p className="mt-4 text-purple-600">(This is a placeholder. Implement the real edit page here.)</p>
    </div>
  );
};

export default CourseEditPlaceholder; 