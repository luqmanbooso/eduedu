import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BookOpen, PlayCircle, FileText, Video, HelpCircle, FileQuestion } from 'lucide-react';
import axios from 'axios';

const getLessonIcon = (type) => {
  switch (type) {
    case 'video': return <Video className="w-4 h-4" />;
    case 'quiz': return <HelpCircle className="w-4 h-4" />;
    case 'assignment': return <FileQuestion className="w-4 h-4" />;
    case 'text': return <FileText className="w-4 h-4" />;
    default: return <BookOpen className="w-4 h-4" />;
  }
};

const CoursePreviewPlaceholder = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLesson, setSelectedLesson] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`/courses/${id}`);
        const courseData = res.data.course || res.data;
        setCourse(courseData);
        // Auto-select first previewable lesson if available
        const previewLesson = courseData.modules?.flatMap(m => m.lessons || []).find(l => l.isPreview);
        setSelectedLesson(previewLesson || null);
      } catch (err) {
        setError('Failed to load course.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!course) return <div className="min-h-screen flex items-center justify-center text-gray-600">Course not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Course Info */}
          <div className="md:w-2/3">
            <img
              src={course.thumbnail?.url || course.thumbnail || '/educharity-logo.svg'}
              alt={course.title}
              className="w-full h-56 object-cover rounded-xl mb-4"
            />
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Curriculum</h2>
              {course.modules && course.modules.length > 0 ? (
                <div className="space-y-4">
                  {course.modules.map((module, mIdx) => (
                    <div key={module._id || `module-${mIdx}`} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="font-semibold text-purple-700 mb-2">{module.title}</div>
                      {module.lessons && module.lessons.length > 0 ? (
                        <ul className="space-y-1">
                          {module.lessons.map((lesson, lIdx) => (
                            <li key={lesson._id || `lesson-${lIdx}`}
                                className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-purple-50 ${selectedLesson && selectedLesson._id === lesson._id ? 'bg-purple-100' : ''}`}
                                onClick={() => setSelectedLesson(lesson)}
                            >
                              <span>{getLessonIcon(lesson.type)}</span>
                              <span className="text-sm font-medium text-gray-800">{lesson.title}</span>
                              {lesson.isPreview && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Preview</span>}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-xs text-gray-400 italic">No lessons yet</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-400 italic">No modules yet</div>
              )}
            </div>
          </div>
          {/* Right: Lesson Preview */}
          <div className="md:w-1/3 bg-gray-50 rounded-xl p-6 border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
            {selectedLesson ? (
              <div className="w-full">
                <div className="flex items-center gap-2 mb-2">
                  {getLessonIcon(selectedLesson.type)}
                  <span className="font-semibold text-gray-800">{selectedLesson.title}</span>
                </div>
                <div className="mb-2 text-xs text-gray-500 capitalize">{selectedLesson.type}</div>
                {selectedLesson.type === 'video' && selectedLesson.videoUrl ? (
                  <video src={selectedLesson.videoUrl} controls className="w-full rounded-lg mb-2" />
                ) : null}
                {(selectedLesson.type === 'text' || selectedLesson.type === 'assignment') && (
                  <div className="bg-white border border-gray-100 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line">
                    {selectedLesson.content}
                  </div>
                )}
                {selectedLesson.type === 'quiz' && (
                  <div className="bg-white border border-gray-100 rounded-lg p-4 text-sm text-gray-700">
                    <em>Quiz preview not implemented.</em>
                  </div>
                )}
                <div className="mt-4 text-xs text-gray-400">(Preview mode: students will see this lesson as a free preview)</div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <PlayCircle className="w-12 h-12 mx-auto mb-2" />
                <div className="font-medium">Select a lesson to preview</div>
                <div className="text-xs">Only lessons marked as preview are available here.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePreviewPlaceholder; 