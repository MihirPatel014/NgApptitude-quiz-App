import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GetUserPackageInfoByUserId } from '../../services/authService';
import { getExamInfoByExamId } from '../../services/examService';
import { useLoader } from '../../provider/LoaderProvider';
import { useQuery } from '@tanstack/react-query';
import { UserPackageInfoModel } from '../../types/user';
import { ExamWithSectionViewModel } from '../../types/exam';

export interface QuizResultProps {
  examId?: number;
  userId?: number;
  userPackageId?: number;
  examName: string;
  examDescription: string;
  totalQuestions: number;
  answered: number;
  skipped: number;
  notAnswered: number;
  timeTaken: number;
  onReturnToQuizPage: () => void;
}

const QuizResult: React.FC<QuizResultProps> = (props) => {
  const {
    examId,
    userId,
    examName,
    examDescription,
    totalQuestions,
    answered,
    skipped,
    notAnswered,
    timeTaken,
  } = props;

  const location = useLocation();
  const navigate = useNavigate();
  const { setLoading } = useLoader();

  const currentExamId = examId ?? location.state?.examId;
  const currentUserId = userId ?? location.state?.userId;

  const [nextExam, setNextExam] = useState<any>(null);
  const [currentPackageId, setCurrentPackageId] = useState<number | null>(null);

  // Fetch user packages
  const {
    data: userPackages,
    isLoading: isLoadingUserPackages,
    isError: isErrorUserPackages,
  } = useQuery<UserPackageInfoModel[]>({
    queryKey: ['userPackages', currentUserId],
    queryFn: async () => {
      if (!currentUserId) throw new Error('User ID is required');
      const result = await GetUserPackageInfoByUserId(currentUserId);
      if (!result) throw new Error('User packages not found');
      return result;
    },
    enabled: !!currentUserId,
  });

  // Fetch exam info for the next exam when available
  const {
    data: fetchedExamData,
    isLoading: isLoadingExamData,
    isError: isErrorExamData,
  } = useQuery<ExamWithSectionViewModel>({
    queryKey: ['examInfo', nextExam?.examId],
    queryFn: async () => {
      if (!nextExam?.examId) throw new Error('Exam ID is required');
      const result = await getExamInfoByExamId(nextExam.examId);
      if (!result) throw new Error('Exam not found');
      return result;
    },
    enabled: !!nextExam?.examId,
  });

  const formatTimeTaken = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const findNextExam = useCallback(
    async (packages: UserPackageInfoModel[]) => {
      if (!currentUserId || !currentExamId) return;
      if (!packages?.length) return;

      const currentPackage =
        packages.find((pkg) => pkg.status === 'In Progress (0% completed)') ||
        packages.find((pkg) =>
          pkg.exams?.some((exam: any) => exam.examId === currentExamId)
        );

      if (!currentPackage) return;

      setCurrentPackageId(currentPackage.id);

      const availableExams = currentPackage.exams?.filter(
        (exam) => !exam.isCompleted && exam.examId !== currentExamId
      );

      if (!availableExams?.length) {
        setNextExam(null);
        return;
      }

      const next = availableExams[0];
      const foundExam = currentPackage.exams.find(
        (exam) => exam.examId === next.examId
      );
    console.log('Found next exam:', foundExam);
      if (!foundExam) return;

      const examQuestions =
        fetchedExamData?.sections?.flatMap((section: any) => section.questions) ||
        [];

      setNextExam({
        userId: currentUserId,
        examId: foundExam.examId,
        examName: foundExam.examName,
        examDescription: fetchedExamData?.description || '',
        timeLimit: foundExam.timeLimit,
        userExamProgressId: foundExam.examProgressId,
        userPackageId: currentPackage.userPackageId,
        packageId: currentPackage.packageId,
        examQuestions,
      });
    },
    [currentUserId, currentExamId, fetchedExamData]
  );

  useEffect(() => {
    const processData = async () => {
      setLoading(true);
      try {
        if (!isLoadingUserPackages && !isErrorUserPackages && userPackages) {
          await findNextExam(userPackages);
        }
      } finally {
        setLoading(false);
      }
    };
    processData();
  }, [
    userPackages,
    isLoadingUserPackages,
    isErrorUserPackages,
    findNextExam,
    setLoading,
  ]);

  const handleNextExam = () => {
    if (nextExam) {
      navigate('/quiz', { state: { ...nextExam } });
    }
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
            <Link to="/">
              <button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600">
                Home
              </button>
            </Link>
            {nextExam && (
              <button
                onClick={handleNextExam}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
              >
                Next Exam
              </button>
            )}
            {!nextExam && currentPackageId && (
              <Link
                to={`/resultnew`}
                state={{ packageId: currentPackageId }}
                className="w-full px-4 py-2 text-sm text-center text-blue-500 border border-blue-500 rounded hover:bg-blue-500 hover:text-white"
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
