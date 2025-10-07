import { useState, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserContext } from "../../provider/UserProvider";
import { GetUserPackageInfoByUserId } from "../../services/authService";
import { UserPackageInfoModel, UserExamInfoModel } from "../../types/user";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/dateUtils";
import { useLoader } from "../../provider/LoaderProvider";
import { ExamSections, ExamWithSectionViewModel } from "../../types/exam";
import { getExamInfoByExamId } from "../../services/examService";
import AvailablePackagesSection from "../packages/AvailablePackagesSection";
import { Award, CheckCircle, Clock, Eye, Play, ShoppingCart, Star, Users, Zap } from "lucide-react";

export const HomeComponent = () => {
  const { userAuth } = useContext(UserContext);
  const navigate = useNavigate();
  const { setLoading } = useLoader();
  
  const [examSections, setExamSections] = useState<Map<number, ExamSections[]>>(new Map()); // Store sections per exam

  const [currentPackage, setCurrentPackage] = useState<UserPackageInfoModel | null>(null);

  let UserId = userAuth?.userId || 0;


  const { data: userPackages, isSuccess } = useQuery({
    queryKey: ["userPackages"],
    queryFn: async () => GetUserPackageInfoByUserId(UserId),
    enabled: !!UserId,
  });
  useEffect(() => {
    if (isSuccess && userPackages && userPackages.length > 0) {
      setCurrentPackage(userPackages[0]);
    }
  }, [isSuccess, userPackages]);
  const handleResult = (packageId: number) => {
    navigate("/resultnew", { state: { packageId } });
  };
  const handleQuizClick = async (examId: number) => {
    try {
      // Find the exam from the user’s packages
      let selectedExam: UserExamInfoModel | null = null;
      let fetchedExam: ExamWithSectionViewModel | null = null;
      let userPackageId: number = 0;
      let packageId: number = 0;
      let examProgressId: number = 0;

      for (const packageInfo of userPackages || []) {
        const foundExam = packageInfo.exams.find(exam => exam.examId === examId);
        if (foundExam) {
          selectedExam = foundExam;
          userPackageId = packageInfo.userPackageId;
          packageId = packageInfo.packageId;
          examProgressId = foundExam.examProgressId;
          break;
        }
      }

      if (!selectedExam) {
        console.log("Exam not found.");
        return;
      }

      // Fetch exam questions if not already available
      let examQuestions = examSections.get(examId)?.flatMap(section => section.questions) || [];
      if (examQuestions.length === 0) {
        fetchedExam = await getExamInfoByExamId(examId) as ExamWithSectionViewModel;
        examQuestions = fetchedExam?.sections?.flatMap(section => section.questions) || [];
      }
      // In QuizPage.tsx or wherever you render <Quiz />

      // Navigate to the quiz page
      navigate('/quiz', {
        state: {
          userId: UserId,
          examId: selectedExam.examId,
          examName: selectedExam.examName,
          examDescription: fetchedExam?.description?.toString() || "",
          timeLimit: selectedExam.timeLimit,
          userExamProgressId: examProgressId,
          userPackageId: userPackageId,
          packageId: packageId,
          examQuestions: examQuestions,
        },
      });

    } catch (error) {
      console.log("Error fetching exam details:", error);
    }
  };
  const ExamStatus = ({
    exam,
    onStartExam,
  }: {
    exam: {
      id: number;
      name: string;
      timeLimit: number;
      isCompleted: boolean;
      score?: number;
    };
    onStartExam: (examId: number) => void;

  }) => (
    <div className="overflow-hidden relative bg-white rounded-lg border border-gray-200 transition-all duration-300 group hover:border-blue-300 hover:shadow-md">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center mb-2 space-x-2">
              <h4 className="font-semibold text-gray-900">{exam.name}</h4>
              <div className={`w-2 h-2 rounded-full ${exam.isCompleted ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              {exam.timeLimit > 0 && (
                <span className="flex items-center">
                  <Clock className="mr-1 w-4 h-4" />
                  {exam.timeLimit} min
                </span>
              )}


            </div>
          </div>

          <div className="flex items-center space-x-2">
            {exam.isCompleted ? (
              <span className="px-4 py-2 text-sm text-gray-600">Completed</span>
            ) : (
              <button
                onClick={() => onStartExam(exam.id)}
                className="flex items-center px-4 py-2 space-x-1 text-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg transition-all hover:from-blue-700 hover:to-blue-800"
              >
                <Play className="w-4 h-4" />
                <span>Start Exam</span>
              </button>
            )}
          </div>
        </div>
      </div>


    </div>
  );




  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="p-6 mx-auto max-w-7xl">
        {/* Header with Stats */}
        <div className="mb-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-lg text-gray-600">Track your learning progress and explore new packages</p>
            </div>


          </div>
        </div>

        {/* Current Package - Enhanced Design */}
        {userPackages && (
          <div className="mb-12">
            <h2 className="flex items-center mb-6 text-2xl font-semibold text-gray-900">
              <Zap className="mr-2 w-6 h-6 text-blue-600" />
              Active Package
            </h2>

            <div className="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-lg">
              <div className="relative p-8 text-white bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br to-transparent from-white/20"></div>
                </div>

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="mb-3 text-3xl font-bold">{currentPackage?.packageName}</h3>
                    </div>
                    <div className="text-right">
                      <div className="mb-1 text-4xl font-bold">₹{currentPackage?.packagePrice}/-</div>
                      <div className="text-blue-200">Active since {formatDate(currentPackage?.startedDate || "")}</div>


                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 gap-8">
                  {/* Exams Section */}
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="flex items-center text-xl font-semibold text-gray-900">
                        <Users className="mr-2 w-5 h-5" />
                        Your Exams
                      </h4>
                      {currentPackage && currentPackage.exams.length > 0 && currentPackage.exams.every(exam => exam.isCompleted) && (
                        <button
                          onClick={() => handleResult(currentPackage.id)}
                          className="px-4 py-2 text-sm text-blue-500 rounded border border-blue-500 hover:bg-blue-500 hover:text-white"
                        >
                          View Result
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      {currentPackage?.exams?.map((exam) => (

                        <ExamStatus
                          key={exam.examId}
                          exam={{
                            id: exam.examId,
                            name: exam.examName,
                            timeLimit: exam.timeLimit,
                            isCompleted: exam.isCompleted,
                          }}
                          onStartExam={handleQuizClick}

                        />
                      ))}
                    </div>
                  </div>


                </div>
              </div>
            </div>
          </div>
        )}
        {/* Available Packages - Grid Layout */}
        <div>
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold text-gray-900">Upgrade Your Learning</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Explore our comprehensive assessment packages designed to unlock your potential
            </p>
          </div>
          <AvailablePackagesSection />
        </div>
      </div>
    </div >
  );
};

export default HomeComponent;
