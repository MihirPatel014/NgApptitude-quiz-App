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
import { Award, CheckCircle, Clock, Play, Users, Zap } from "lucide-react";

const HomeComponent = () => {
  const { userAuth } = useContext(UserContext);
  const navigate = useNavigate();
  const { setLoading } = useLoader();
  
  const [examSections, setExamSections] = useState<Map<number, ExamSections[]>>(new Map()); // Store sections per exam

  const [currentPackage, setCurrentPackage] = useState<UserPackageInfoModel | null>(null);
  const [completedPackages, setCompletedPackages] = useState<UserPackageInfoModel[]>([]);


  let UserId = userAuth?.userId || 0;


  const { data: userPackages, isSuccess } = useQuery({
    queryKey: ["userPackages"],
    queryFn: async () => GetUserPackageInfoByUserId(UserId),
    enabled: !!UserId,
  });
  
    useEffect(() => {
    if (userPackages && userPackages.length > 0) {
      const newCurrentPackage = userPackages.filter(pkg => !pkg.isCompleted)[0] || null;
      setCurrentPackage(newCurrentPackage);
      setCompletedPackages(userPackages.filter(pkg => pkg.isCompleted));
      
      console.log("This is the current package", newCurrentPackage);
    }
  }, [userPackages]);
  const handleResult = (packageId: number) => {
    navigate("/resultnew", { state: { packageId } });
  };
  const handleQuizClick = async (examId: number) => {
    try {
      setLoading(true);
      // Use the current package instead of looping through all packages
      if (!currentPackage) {
        console.log("No active package found.");
        setLoading(false);
        return;
      }

      // Find the exam from the current package
      let selectedExam: UserExamInfoModel | null = null;
      let fetchedExam: ExamWithSectionViewModel | null = null;
      let userPackageId: number = currentPackage.userPackageId;
      let packageId: number = currentPackage.packageId;
      let examProgressId: number = 0;

      const foundExam = currentPackage.exams.find(exam => exam.examId === examId);
      if (foundExam) {
        selectedExam = foundExam;
        examProgressId = foundExam.examProgressId;
      }

      if (!selectedExam) {
        console.log("Exam not found in current package.");
        setLoading(false);
        return;
      }

      // Fetch exam questions if not already available
      let examQuestions = examSections.get(examId)?.flatMap(section => section.questions) || [];
      if (examQuestions.length === 0) {
        fetchedExam = await getExamInfoByExamId(examId) as ExamWithSectionViewModel;
        examQuestions = fetchedExam?.sections?.flatMap(section => section.questions) || [];
      }

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
      setLoading(false);
    } catch (error) {
      console.log("Error fetching exam details:", error);
      setLoading(false);
    }
  };
  const ExamStatus = ({
    exam,
    onStartExam,
    isDisabled
  }: {
    exam: {
      id: number;
      name: string;
      timeLimit: number;
      isCompleted: boolean;
      score?: number;
    };
    onStartExam: (examId: number) => void;
    isDisabled: boolean;

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
                disabled={isDisabled}
                className={`flex items-center px-4 py-2 space-x-1 text-sm text-white rounded-lg transition-all ${isDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'}`}
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
              <h1 className="mb-2 text-4xl font-bold text-gray-900">Self Discovery Suite</h1>
              <p className="text-lg text-gray-600">Test Beyond Boundaries Reveal the Real you..</p>
            </div>


          </div>
        </div>

        {/* Current Package - Enhanced Design */}
        {currentPackage  && (
          <div className="mb-12">
            <h2 className="flex items-center mb-6 text-2xl font-semibold text-gray-900">
              <Zap className="mr-2 w-6 h-6 text-blue-600" />
              Active Package
            </h2>

            <div className="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-lg">
              <div className="relative p-8 text-white bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500">
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
                        Your Assessments
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
                      {currentPackage?.exams?.map((exam, index) => {
                        const previousExamCompleted = index === 0 ? true : currentPackage?.exams[index - 1]?.isCompleted;
                        const isExamDisabled = !previousExamCompleted;

                        return (
                          <ExamStatus
                            key={exam.examId}
                            exam={{
                              id: exam.examId,
                              name: exam.examName,
                              timeLimit: exam.timeLimit,
                              isCompleted: exam.isCompleted,
                            }}
                            onStartExam={handleQuizClick}
                            isDisabled={isExamDisabled}
                          />
                        );
                      })}
                    </div>
                  </div>


                </div>
              </div>
            </div>
          </div>
        )}

        {/* Completed Packages Section */}
        {completedPackages && completedPackages.length > 0 && (
          <div className="mb-12">
            <h2 className="flex items-center mb-6 text-2xl font-semibold text-gray-900">
              <CheckCircle className="mr-2 w-6 h-6 text-green-600" />
              Completed Packages
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {completedPackages.map((pkg) => (
                <div key={pkg.id} className="overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-lg">
                  <div className="relative p-6 text-white bg-gradient-to-r from-green-600 via-green-700 to-emerald-700">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br to-transparent from-white/20"></div>
                    </div>
                    <div className="relative z-10">
                      <h3 className="mb-2 text-2xl font-bold">{pkg.packageName}</h3>
                      <div className="text-green-200">Completed on {formatDate(pkg.startedDate || "")}</div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="flex items-center mb-4 text-lg font-semibold text-gray-900">
                      <Award className="mr-2 w-5 h-5" />
                      Assessments
                    </h4>
                    <div className="space-y-3">
                      {pkg.exams?.map((exam, index) => {
                        const previousExamCompleted = index === 0 ? true : pkg.exams[index - 1]?.isCompleted;
                        const isExamDisabled = !previousExamCompleted;

                        return (
                          <ExamStatus
                            key={exam.examId}
                            exam={{
                              id: exam.examId,
                              name: exam.examName,
                              timeLimit: exam.timeLimit,
                              isCompleted: exam.isCompleted,
                            }}
                            onStartExam={handleQuizClick}
                            isDisabled={isExamDisabled}
                          />
                        );
                      })}
                    </div>
                    {pkg.exams.every(exam => exam.isCompleted) && (
                      <button
                        onClick={() => handleResult(pkg.id)}
                        className="px-4 py-2 mt-6 w-full text-sm text-white bg-green-500 rounded-lg hover:bg-green-600"
                      >
                        View Result
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
