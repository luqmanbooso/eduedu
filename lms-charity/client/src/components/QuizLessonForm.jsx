import React from 'react';
import { Plus, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const QuizLessonForm = React.memo(({ lessonData, onUpdate }) => {
  const addQuestion = () => {
    const newQuestions = [...(lessonData.quiz?.questions || []), {
      id: Date.now(),
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      points: 1
    }];
    
    onUpdate({
      ...lessonData,
      quiz: {
        ...lessonData.quiz,
        questions: newQuestions
      }
    });
  };

  const updateQuestion = (questionIndex, field, value) => {
    const newQuestions = [...(lessonData.quiz?.questions || [])];
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      [field]: value
    };
    
    onUpdate({
      ...lessonData,
      quiz: {
        ...lessonData.quiz,
        questions: newQuestions
      }
    });
  };

  const updateOption = (questionIndex, optionIndex, value) => {
    const newQuestions = [...(lessonData.quiz?.questions || [])];
    const newOptions = [...newQuestions[questionIndex].options];
    newOptions[optionIndex] = value;
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      options: newOptions
    };
    
    onUpdate({
      ...lessonData,
      quiz: {
        ...lessonData.quiz,
        questions: newQuestions
      }
    });
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...(lessonData.quiz?.questions || [])];
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      options: [...newQuestions[questionIndex].options, '']
    };
    
    onUpdate({
      ...lessonData,
      quiz: {
        ...lessonData.quiz,
        questions: newQuestions
      }
    });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const newQuestions = [...(lessonData.quiz?.questions || [])];
    if (newQuestions[questionIndex].options.length > 2) {
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        options: newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex)
      };
      
      // Adjust correct answer if necessary
      if (newQuestions[questionIndex].correctAnswer >= optionIndex) {
        newQuestions[questionIndex].correctAnswer = Math.max(0, newQuestions[questionIndex].correctAnswer - 1);
      }
      
      onUpdate({
        ...lessonData,
        quiz: {
          ...lessonData.quiz,
          questions: newQuestions
        }
      });
    }
  };

  const removeQuestion = (questionIndex) => {
    const newQuestions = (lessonData.quiz?.questions || []).filter((_, i) => i !== questionIndex);
    onUpdate({
      ...lessonData,
      quiz: {
        ...lessonData.quiz,
        questions: newQuestions
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Quiz Settings */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <h4 className="font-medium text-gray-900">Quiz Settings</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Limit (minutes)
            </label>
            <input
              type="number"
              value={lessonData.quiz?.timeLimit || 10}
              onChange={(e) => onUpdate({
                ...lessonData,
                quiz: {
                  ...lessonData.quiz,
                  timeLimit: parseInt(e.target.value) || 10
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passing Score (%)
            </label>
            <input
              type="number"
              value={lessonData.quiz?.passingScore || 70}
              onChange={(e) => onUpdate({
                ...lessonData,
                quiz: {
                  ...lessonData.quiz,
                  passingScore: parseInt(e.target.value) || 70
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1" max="100"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Attempts
            </label>
            <select
              value={lessonData.quiz?.maxAttempts || 3}
              onChange={(e) => onUpdate({
                ...lessonData,
                quiz: {
                  ...lessonData.quiz,
                  maxAttempts: parseInt(e.target.value)
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 attempt</option>
              <option value={2}>2 attempts</option>
              <option value={3}>3 attempts</option>
              <option value={-1}>Unlimited</option>
            </select>
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={lessonData.quiz?.randomizeQuestions || false}
              onChange={(e) => onUpdate({
                ...lessonData,
                quiz: {
                  ...lessonData.quiz,
                  randomizeQuestions: e.target.checked
                }
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Randomize question order</span>
          </label>
        </div>
      </div>

      {/* Questions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Quiz Questions</h4>
          <button
            onClick={addQuestion}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>

        {!lessonData.quiz?.questions?.length ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No questions yet</p>
            <button
              onClick={addQuestion}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add First Question
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {lessonData.quiz.questions.map((question, questionIndex) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-6 bg-white">
                <div className="flex items-start justify-between mb-4">
                  <h5 className="font-medium text-gray-900">Question {questionIndex + 1}</h5>
                  <button
                    onClick={() => removeQuestion(questionIndex)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Question Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question
                    </label>
                    <textarea
                      value={question.question}
                      onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your question here..."
                    />
                  </div>

                  {/* Question Type & Points */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Type
                      </label>
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(questionIndex, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="multiple-choice">Multiple Choice</option>
                        <option value="true-false">True/False</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Points
                      </label>
                      <input
                        type="number"
                        value={question.points}
                        onChange={(e) => updateQuestion(questionIndex, 'points', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Answer Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Options
                    </label>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                            className="text-green-600 focus:ring-green-500"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                          {question.options.length > 2 && (
                            <button
                              onClick={() => removeOption(questionIndex, optionIndex)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {question.options.length < 6 && (
                      <button
                        onClick={() => addOption(questionIndex)}
                        className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Option
                      </button>
                    )}
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Explanation (Optional)
                    </label>
                    <textarea
                      value={question.explanation}
                      onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Explain why this is the correct answer..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

QuizLessonForm.displayName = 'QuizLessonForm';

export default QuizLessonForm;
