import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GetUserPackageInfoByUserId } from "../../services/authService";
import { getExamInfoByExamId } from "../../services/examService";
import { UserContext } from "../../provider/UserProvider";
import { Question } from "../../types/question";
import { QuestionSumitStatus } from "../../common/constant";

// Import updated models
import { UserPackageInfoModel, UserExamInfoModel } from "../../types/user";
import { ExamWithSectionViewModel, ExamSections } from "../../types/exam";
import { formatDate } from "../../utils/dateUtils";
import { useLoader } from "../../provider/LoaderProvider";

const QuizPage = () => {
  const [userPackages, setUserPackages] = useState<UserPackageInfoModel[]>([]);
  const [examSections, setExamSections] = useState<Map<number, ExamSections[]>>(new Map()); // Store sections per exam

  const [activeTab, setActiveTab] = useState<string>("available");
  const [expandedExamIds, setExpandedExamIds] = useState<Set<number>>(new Set()); // Track multiple expanded exams
  const { setLoading } = useLoader();
  const navigate = useNavigate();
  let { userAuth } = useContext(UserContext);
  let UserId = userAuth?.userId || 0;

  const isFetched = useRef(false);

  useEffect(() => {
    if (UserId > 0) {
      fetchUserPackages();
    }
  }, [UserId]);

  const fetchUserPackages = async () => {
    setLoading(true);
    try {
      if (UserId > 0 && !isFetched.current) {
        isFetched.current = true; // Prevent duplicate calls

        const response = await GetUserPackageInfoByUserId(UserId);

        if (!response || response.length === 0) {
          console.log("No package data found for the user.");
          return;
        }

        // Filter for current (active/non-completed) packages
        const currentPackages = response.filter(packageInfo => !packageInfo.isCompleted);
        setUserPackages(currentPackages);

        // Fetch sections for all exams in current packages
        const sectionsMap = new Map<number, ExamSections[]>();
        const newExpandedIds = new Set<number>();

        for (const packageInfo of currentPackages) {
          for (const exam of packageInfo.exams) {
            const fetchedExam = await getExamInfoByExamId(exam.examId);
            if (fetchedExam?.sections) {
              sectionsMap.set(exam.examId, fetchedExam.sections);

              // Auto-expand exams in available tab
              if (!exam.isCompleted && activeTab === "available") {
                newExpandedIds.add(exam.examId);
              }
            }
          }
        }

        setExamSections(sectionsMap);
        setExpandedExamIds(newExpandedIds);
        setLoading(false);
      }
    } catch (error) {
      console.log("Error fetching user packages:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };
  const findNextExam = (currentExamId: number) => {
    for (const packageInfo of userPackages) {
      for (const exam of packageInfo.exams) {
        if (!exam.isCompleted && exam.examId !== currentExamId) {
          return exam;
        }
      }
    }
    return null;
  };

  const handleQuizClick = async (examId: number) => {
    try {
      // Find the exam from the user’s packages
      let selectedExam: UserExamInfoModel | null = null;
      let userPackageId: number = 0;
      let packageId: number = 0;
      let examProgressId: number = 0;

      for (const packageInfo of userPackages) {
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
        console.error("Exam not found.");
        return;
      }

      // Fetch exam questions if not already available
      let examQuestions = examSections.get(examId)?.flatMap(section => section.questions) || [];
      if (examQuestions.length === 0) {
        const fetchedExam = await getExamInfoByExamId(examId);
        examQuestions = fetchedExam?.sections?.flatMap(section => section.questions) || [];
      }

      // Navigate to the quiz page
      navigate('/quiz', {
        state: {
          userId: UserId,
          examId: selectedExam.examId,
          examName: selectedExam.examName,
          timeLimit: selectedExam.timeLimit,
          userExamProgressId: examProgressId,
          userPackageId: userPackageId,
          packageId: packageId,
          examQuestions: examQuestions,
        },
      });

    } catch (error) {
      console.error("Error fetching exam details:", error);
    }
  };


  const toggleExamExpansion = (examId: number) => {
    setExpandedExamIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(examId)) {
        newSet.delete(examId);
      } else {
        newSet.add(examId);
      }
      return newSet;
    });
  };



  return (
    <div className="flex items-center justify-center min-h-screen pt-4">
      <div className="w-full max-w-4xl p-1 rounded-lg min-h-svh">

        {/* Mobile Dropdown for Tabs */}
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">Select tab</label>
          <select
            id="tabs"
            className="bg-white border border-primary text-dark text-sm rounded-lg focus:ring-primary block w-full p-2.5"
            onChange={(e) => setActiveTab(e.target.value)}
            value={activeTab}
          >
            <option value="available">Available</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        {/* Desktop Tabs */}
        <ul className="hidden text-sm font-medium text-center rounded-lg shadow-sm text-secondary sm:flex">
          <li className="w-full focus-within:z-10">
            <button
              className={`inline-block w-full p-4 ${activeTab === "available"
                ? "text-white bg-primary"
                : "text-dark bg-secondary-light hover:bg-primary hover:text-secondary"
                } border-r border-primary rounded-s-lg focus:ring-4 focus:ring-primary focus:outline-none`}
              onClick={() => setActiveTab("available")}
            >
              Available
            </button>
          </li>
          <li className="w-full focus-within:z-10">
            <button
              className={`inline-block w-full p-4 ${activeTab === "completed"
                ? "text-white bg-primary"
                : "text-dark bg-secondary-light hover:bg-primary hover:text-secondary"
                } border-s-0 border-primary rounded-e-lg focus:ring-4 focus:ring-primary focus:outline-none`}
              onClick={() => setActiveTab("completed")}
            >
              Completed
            </button>
          </li>
        </ul>

        {/* Exam Packages */}
        <div className="mt-5 space-y-6">
          {/* Iterate through current user packages */}
          {/* Iterate through current user packages */}
          {userPackages
            .filter(packageInfo =>
              activeTab === "available"
                ? packageInfo.exams.some(exam => !exam.isCompleted) // Show only if it has available exams
                : packageInfo.exams.some(exam => exam.isCompleted)  // Show only if it has completed exams
            )
            .map((packageInfo) => (
              <div key={packageInfo.id} className="p-3 bg-white rounded-lg shadow-md">

                {/* Show package name only in the "Completed" tab */}
                {activeTab === "completed" && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{packageInfo.packageName}</h3>
                    <p className="text-sm text-gray-600">
                      Started: {formatDate(packageInfo.startedDate || "") || "N/A"}
                    </p>
                  </div>
                )}

                {/* List Exams for this Package */}
                <div className="space-y-3">
                  {packageInfo.exams
                    .filter(exam => activeTab === "available" ? !exam.isCompleted : exam.isCompleted)
                    .map((exam) => (
                      <div key={exam.examId} className="w-full p-4 bg-white border border-gray-200 rounded-lg shadow-md">

                        {/* Exam Header */}
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleExamExpansion(exam.examId)}
                        >
                          <div className="flex flex-col text-lg font-semibold text-gray-900">
                            <span>Exam: {exam.examName}</span>
                            {exam.isTimeBound && (
                              <span className="text-lg font-semibold text-gray-900">Time Limit: {exam.timeLimit} min</span>
                            )}
                          </div>
                          <span className="text-primary">
                            {expandedExamIds.has(exam.examId) ? "▲" : "▼"}
                          </span>
                        </div>

                        {/* Collapsible Sections */}
                        {expandedExamIds.has(exam.examId) && (
                          <div className="mt-4">
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-2 sm:grid-cols-2">
                              {examSections.get(exam.examId)
                                ?.filter(section => section.noOfQuestion > 0 || (section.questions && section.questions.length > 0))
                                .map((section) => (
                                  <div key={section.id} className="p-3 border border-gray-300 rounded-md bg-gray-50">
                                    <p className="font-semibold">{section.sectionName}</p>
                                    <p className="text-sm text-gray-600">Questions: {section.noOfQuestion}</p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Show Completed Date if in "Completed" tab */}
                        {activeTab === "completed" && exam.completedOn && (
                          <p className="text-sm text-gray-500">Completed On: {formatDate(exam.completedOn.toString())}</p>
                        )}

                        {/* Start Exam Button - Only show in "Available" tab */}
                        {activeTab === "available" && (
                          <button
                            onClick={() => handleQuizClick(exam.examId)}
                            className="w-full px-3 py-2 mt-4 text-sm font-medium rounded-lg bg-secondary-light text-secondary hover:bg-secondary-light focus:ring-4 focus:outline-none focus:ring-gray-400"
                          >
                            Start Exam
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))
          }

        </div>
      </div>
    </div>
  );
};

export default QuizPage;
