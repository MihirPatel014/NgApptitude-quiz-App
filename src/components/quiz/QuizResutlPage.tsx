import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GetUserPackageInfoByUserId } from '../../services/authService';
import { getExamInfoByExamId } from '../../services/examService';
import { useLoader } from '../../provider/LoaderProvider';
import { useQuery } from '@tanstack/react-query';
import { UserPackageInfoModel } from '../../types/user';
import { GetExamTemplateMappings } from "../../services/resultService";
import { ExamTemplateMappingInfo } from '../../types/result';
import toast from 'react-hot-toast';
import { ROUTES } from '../../common/routes';

export interface QuizResultProps {
  examId?: number;
  userId?: number;
  userPackageId?: number;
  packageId?: number;
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
    packageId,
    examName,
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
  const [examProgressId, setExamProgressId] = useState<number | null>(null);

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



  const formatTimeTaken = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const findNextExam = useCallback(
    async (packages: UserPackageInfoModel[]) => {
      if (!currentUserId || !currentExamId) return;
      if (!packages?.length) return;


      // Find the package that contains this examId
      const currentPackage = packages.find(pkg =>
        pkg.exams?.some(e => e.examId === currentExamId)
      ) ||
        packages.find(pkg => !pkg.isCompleted) ||
        packages.find(pkg => pkg.isCompleted) ||
        null;

      if (!currentPackage) return;

      setCurrentPackageId(currentPackage.id);
      // 🔹 capture completed exam's examProgressId (for Exam Summary only)
      const completedExam = currentPackage.exams?.find(
        e => e.examId === currentExamId
      );

      if (completedExam?.examProgressId) {
        setExamProgressId(completedExam.examProgressId);
      }

      const availableExams = currentPackage.exams?.filter(
        exam => !exam.isCompleted && exam.examId !== currentExamId
      );

      if (!availableExams?.length) {
        setNextExam(null);
        return;
      }

      const next = availableExams[0];

      const fetchedNextExamDetails =
        await getExamInfoByExamId(next.examId);

      if (!fetchedNextExamDetails) return;

      const examQuestions =
        fetchedNextExamDetails.sections?.flatMap(sec => sec.questions) || [];

      setNextExam({
        userId: currentUserId,
        examId: next.examId,
        examName: next.examName,
        examDescription: fetchedNextExamDetails.description || "",
        timeLimit: next.timeLimit,
        userExamProgressId: next.examProgressId,
        userPackageId: currentPackage.userPackageId,
        packageId: currentPackage.packageId,
        examQuestions
      });
    },
    [currentUserId, currentExamId]  // keep dependency list small
  );


  useEffect(() => {
    if (!userPackages || isLoadingUserPackages || isErrorUserPackages) return;

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        await findNextExam(userPackages);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [userPackages, isLoadingUserPackages, isErrorUserPackages, findNextExam, setLoading]);

  // useEffect(() => {
  //   if (
  //     !nextExam &&                     
  //     currentPackageId &&              
  //     userAuth?.contactNo &&           
  //     userAuth?.email &&
  //     !reportSmsSent                   
  //   ) {
  //     console.log("All exams completed — sending SMS automatically...");

  //     const name = userAuth.email.split('@')[0] || 'User';
  //     const mobile = userAuth.contactNo;
  //     const email = userAuth.email;

  //     (async () => {
  //       try {
  //         const smsResponse = await sendExamReportSms(mobile, name, email);

  //         // Optionally show toast notifications
  //         // if (smsResponse.success) {
  //         //   toast.success("Exam completion SMS sent successfully!");
  //         // } else {
  //         //   toast.error("Failed to send SMS: " + (smsResponse.errors?.[0] || "Unknown error"));
  //         // }

  //         setReportSmsSent(true);
  //       } catch (err) {
  //         console.error("Error sending SMS after all exams:", err);
  //         toast.error("Failed to send completion SMS.");
  //       }
  //     })();
  //   }
  // }, [nextExam, currentPackageId, userAuth, reportSmsSent]);


  const handleNextExam = () => {
    if (nextExam) {
      setLoading(true);
      // Use setTimeout to ensure navigation happens after loader is shown
      setTimeout(() => {
        navigate(ROUTES.QUIZ, { state: { ...nextExam } });
        // Turn off loader after navigation is initiated
        setTimeout(() => {
          setLoading(false);
        }, 100);
      }, 0);
    }
  };


  const handleViewResult = async () => {
    setLoading(true);

    try {
      // 🔑 CHECK TEMPLATE MAPPING (Match HomeComponent Logic)
      const mappings = await GetExamTemplateMappings();

      // Find the package from userPackages to get the first completed exam
      const pkg = userPackages?.find(p => p.id === (currentPackageId || packageId || location.state?.packageId));
      const completedExam = pkg?.exams.find(e => e.isCompleted && e.examProgressId);

      // Fallback to current exam if no package found or no completed exam yet in listing
      const targetExamId = completedExam?.examId || currentExamId;
      const targetProgressId = completedExam?.examProgressId || (examProgressId || location.state?.userExamProgressId);
      const targetPackageId = currentPackageId || packageId || location.state?.packageId;

      // Exam 9 is legacy => force resultnew
      const isLegacyExam = targetExamId === 9;
      const hasTemplate = mappings?.some((m: ExamTemplateMappingInfo) => m.examId === targetExamId);

      if (hasTemplate && !isLegacyExam) {
        // PRIORITY: If a template is mapped (and not legacy), go to exam-summary
        navigate(ROUTES.EXAM_SUMMARY, {
          state: { examProgressId: targetProgressId }
        });
      } else {
        // FALLBACK / LEGACY
        navigate(ROUTES.RESULT_NEW, {
          state: { packageId: targetPackageId }
        });
      }

    } catch (error) {
      console.error(error);
      toast.error("Failed to load result");
    } finally {
      setLoading(false);
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
            <Link to={ROUTES.HOME}>
              <button className="px-4 py-2 w-full text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600">
                Home
              </button>
            </Link>
            {nextExam && (
              <button
                onClick={handleNextExam}
                className="px-4 py-2 w-full text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
              >
                Next Exam
              </button>
            )}
            {!nextExam && currentPackageId && (
              <button
                onClick={handleViewResult}
                className="px-4 py-2 w-full text-sm text-center text-blue-500 rounded border border-blue-500 hover:bg-blue-500 hover:text-white"
              >
                View Result
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
