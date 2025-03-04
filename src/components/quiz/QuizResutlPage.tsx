import React from 'react';
import { Link } from 'react-router-dom';

interface QuizResultProps {
  examName: string;
  totalQuestions: number;
  answered: number;
  skipped: number;
  notAnswered: number;
  timeTaken: number; // in seconds
  onReturnToQuizPage: () => void;
  hasNextExam: boolean;
  onNextExam?: () => void;
}

const QuizResult: React.FC<QuizResultProps> = ({
  examName,
  totalQuestions,
  answered,
  skipped,
  notAnswered,
  timeTaken,
  onReturnToQuizPage,
  hasNextExam,
  onNextExam
}) => {

  // Convert seconds to minutes and seconds format
  const formatTimeTaken = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-semibold text-gray-800">🎉 Exam Completed!</h2>
          <h3 className="mb-4 text-xl font-medium text-gray-700">{examName}</h3>
          
          <div className="p-4 mb-4 rounded-lg bg-gray-50">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Answered:</span>
              <span className="font-semibold">{answered} / {totalQuestions}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Skipped:</span>
              <span className="font-semibold">{skipped} / {totalQuestions}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Not Answered:</span>
              <span className="font-semibold">{notAnswered} / {totalQuestions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time Taken:</span>
              <span className="font-semibold">{formatTimeTaken(timeTaken)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={onReturnToQuizPage}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600"
            >
              Back to Exams
            </button>
            
            <Link to="/">
              <button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600">
                Home
              </button>
            </Link>
          </div>

          {/* Show Next Exam Button Only if there's another exam */}
          {hasNextExam && onNextExam && (
            <button
              onClick={onNextExam}
              className="w-full px-4 py-2 mt-3 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
            >
              Start Next Exam
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
