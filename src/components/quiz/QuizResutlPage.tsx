import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GetUserPackageInfoByUserId } from '../../services/authService';
import { getExamInfoByExamId } from '../../services/examService';
import { useLoader } from '../../provider/LoaderProvider';

export interface QuizResultProps {
  examId?: number;
  userId?: number;
  userPackageId?: number;
  examName: string;
  totalQuestions: number;
  answered: number;
  skipped: number;
  notAnswered: number;
  timeTaken: number; // in seconds
  onReturnToQuizPage: () => void;

}

const QuizResult: React.FC<QuizResultProps> = ({
  examId,
  userId,
   userPackageId: userPackageId,
  examName,
  totalQuestions,
  answered,
  skipped,
  notAnswered,
  timeTaken,
  onReturnToQuizPage,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  // Use examId and userId from props or fallback to location.state
  const currentExamId = examId ?? location.state?.examId;
  const currentUserId = userId ?? location.state?.userId;
  const [nextExam, setNextExam] = useState<any>(null);
  const [currentPackageId, setCurrentPackageId] = useState<number | null>(null);
  const { setLoading } = useLoader();
  // Convert seconds to minutes and seconds format
  const formatTimeTaken = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  useEffect(() => {
    const fetchNextExam = async () => {
      setLoading(true);
      try {
        if (!currentUserId || !currentExamId) return;
        const packages = await GetUserPackageInfoByUserId(currentUserId);
        if (!packages || packages.length === 0) { return }
        // Determine the current package. Prefer the one explicitly in progress if status is available,
        // otherwise fall back to the package that contains the current exam.
        const currentPackage = packages.find(pkg => pkg.status === "In Progress (0% completed)") ||
          packages.find(pkg => pkg.exams?.some((exam: any) => exam.examId === currentExamId));
        if (!currentPackage) {
          setCurrentPackageId(null);
          return;
        }
        setCurrentPackageId(currentPackage.id);
        
        console.log("This is the current package",currentPackage);
        if (!currentPackage) return;
        // Find any other available exam in the same package
        const availableExams = currentPackage.exams.filter(
          exam => !exam.isCompleted && exam.examId !== currentExamId
        );
        if (availableExams.length > 0) {
          const next = availableExams[0];

          // Find selectedExam and package info as in QuizPage
          let selectedExam: any = null;
          let userPackageId: number = 0;
          let packageId: number = 0;
          let examProgressId: number = 0;

          const foundExam = currentPackage.exams.find(exam => exam.examId === next.examId);
          if (foundExam) {
            selectedExam = foundExam;
            userPackageId = currentPackage.userPackageId;
            packageId = currentPackage.packageId;
            examProgressId = foundExam.examProgressId;
          }

          // Fetch exam questions
          let examQuestions: any[] = [];
          const fetchedExam = await getExamInfoByExamId(next.examId);
          examQuestions = fetchedExam?.sections?.flatMap(section => section.questions) || [];

          setNextExam({
            userId: currentUserId,
            examId: selectedExam.examId,
            examName: selectedExam.examName,
            timeLimit: selectedExam.timeLimit,
            userExamProgressId: examProgressId,
            userPackageId: userPackageId,
            packageId: packageId,
            examQuestions: examQuestions,
          });
        } else {
          setNextExam(null);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchNextExam();
  }, [currentUserId, currentExamId]);

  const handleNextExam = () => {
    if (nextExam) {
      navigate('/quiz', { state: { ...nextExam } });
    }
  };

  return (
    <div className="flex justify-center items-center p-4 min-h-screen bg-gray-100">
      <div className="p-6 w-full max-w-md bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-semibold text-gray-800">🎉 Exam Completed!</h2>
          <h3 className="mb-4 text-xl font-medium text-gray-700">{examName}</h3>

          <div className="p-4 mb-4 bg-gray-50 rounded-lg">
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
            {/* <button
              onClick={onReturnToQuizPage}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600"
            >
              Home
            </button> */}

            <Link to="/">
              <button className="px-4 py-2 w-full text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600">
                Home
              </button>
            </Link>
            {nextExam && (
              <button onClick={handleNextExam} className="px-4 py-2 w-full text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600">
                Next Exam
              </button>
            )}
            {!nextExam && currentPackageId && (
              <Link
                to={`/resultnew`} state={{ packageId: currentPackageId }}

                className="px-4 py-2 w-full text-sm text-center text-blue-500 rounded border border-blue-500 hover:bg-blue-500 hover:text-white"
              >
                View Result
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;

