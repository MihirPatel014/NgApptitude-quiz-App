import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getQuestionbyExamAndSectionId,
} from '../../services/questionService';
import { getImageUrlByName } from '../../services/filesService';
import { Question } from '../../types/question';
import { FaCircle } from "react-icons/fa";
import { ExamSections, QuizAnswerModel, SubmitExam, UserExamResponse } from '../../types/exam';
import { AddUpdateUserExam, SubmitUserExam } from '../../services/examService';
import { QuestionSumitStatus } from '../../common/constant';
import toast, { Toaster } from 'react-hot-toast';
import { useLoader } from '../../provider/LoaderProvider';
import { ROUTES } from '../../common/routes';



const QuestionStatus = {
  NotAttended: 0,
  Skipped: 1,
  Attended: 2,
} as const;
type QuestionStatusType = typeof QuestionStatus[keyof typeof QuestionStatus];

export interface QuizProps {
  userId: number;
  examId: number;
  examName: string;
  examDescription: string;
  timeLimit: number;
  userExamProgressId: number;
  userPackageId: number;
  packageId: number;
  examQuestions: Question[];
  sections?: ExamSections[];
  hasNextExam: boolean;
  onNextExam: () => void;
}

const Quiz: React.FC<QuizProps> = ({
  userId,
  examId,
  examName,
  examDescription,
  timeLimit,
  userExamProgressId,
  userPackageId,
  packageId,
  examQuestions,
  sections
}) => {
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<QuizAnswerModel[]>([]);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isTimeBound, setIsTimeBound] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatusType[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showDeveloperOptions, setShowDeveloperOptions] = useState<boolean>(false);

  // Memoized values
  const startTime = useMemo(() => new Date().toISOString(), []);
  const { setLoading } = useLoader();

  // Use refs to store the timers and prevent re-renders
  const remainingTimeTimer = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimeTimer = useRef<NodeJS.Timeout | null>(null);
  const isQuizActiveRef = useRef<boolean>(true);

  const [userExamResponse, setUserExamResponse] = useState<UserExamResponse>({
    id: 0,
    userExamProgressId: userExamProgressId,
    userId: Number(userId),
    examId: Number(examId),
    sectionId: 0,
    responseData: ''
  });


  const handleAutoSelectAll = useCallback(() => {
    console.log("Auto Select All button clicked");
    const updatedResponseData: QuizAnswerModel[] = userExamResponse.responseData
      ? JSON.parse(userExamResponse.responseData)
      : [];
    const newQuestionStatuses = [...questionStatuses];

    questions.forEach((question, index) => {
      if (newQuestionStatuses[index] === QuestionStatus.NotAttended || newQuestionStatuses[index] === QuestionStatus.Skipped) {
        const options = [question.optionA, question.optionB, question.optionC, question.optionD].filter(Boolean);
        if (options.length > 0) {
          const randomOption = options[Math.floor(Math.random() * options.length)];
          const newAnswer: QuizAnswerModel = {
            questionId: question.id,
            SelectedOption: randomOption || '',
            timeTakenInSeconds: 0 // Assuming 0 for auto-selected
          };

          const existingAnswerIndex = updatedResponseData.findIndex(
            answer => answer.questionId === question.id
          );

          if (existingAnswerIndex !== -1) {
            updatedResponseData[existingAnswerIndex] = newAnswer;
          } else {
            updatedResponseData.push(newAnswer);
          }
          newQuestionStatuses[index] = QuestionStatus.Attended;
        }
      }
    });

    setUserExamResponse(prev => ({
      ...prev,
      responseData: JSON.stringify(updatedResponseData)
    }));
    setQuestionStatuses(newQuestionStatuses);

    // Update selectedAnswerIndex for the current question
    const currentQuestionId = questions[activeQuestion]?.id;
    if (currentQuestionId) {
      const currentQuestionAnswer = updatedResponseData.find(
        answer => answer.questionId === currentQuestionId
      );
      if (currentQuestionAnswer) {
        const options = [
          questions[activeQuestion].optionA,
          questions[activeQuestion].optionB,
          questions[activeQuestion].optionC,
          questions[activeQuestion].optionD
        ].filter(Boolean);
        const index = options.indexOf(currentQuestionAnswer.SelectedOption);
        setSelectedAnswerIndex(index !== -1 ? index : null);
      } else {
        setSelectedAnswerIndex(null);
      }
    } else {
      setSelectedAnswerIndex(null);
    }
    console.log("developer option is wokring");
  }, [questions, userExamResponse.responseData, questionStatuses, activeQuestion]);

  // Memoized calculations
  const currentQuestion = useMemo(() => questions[activeQuestion], [questions, activeQuestion]);

  const skippedCount = useMemo(() =>
    questionStatuses.filter(status => status === QuestionStatus.Skipped).length,
    [questionStatuses]
  );

  const notAnsweredCount = useMemo(() =>
    questionStatuses.filter(status => status === QuestionStatus.NotAttended).length,
    [questionStatuses]
  );

  // Callback functions to prevent re-renders
  const calculateScore = useCallback((): number => {
    const answersData: QuizAnswerModel[] = userExamResponse.responseData
      ? JSON.parse(userExamResponse.responseData)
      : [];

    let correctAnswers = 0;

    answersData.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (question && question.answer === answer.SelectedOption) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  }, [userExamResponse.responseData, questions]);

  const stopTimers = useCallback(() => {
    if (remainingTimeTimer.current) {
      clearInterval(remainingTimeTimer.current);
      remainingTimeTimer.current = null;
    }
    if (elapsedTimeTimer.current) {
      clearInterval(elapsedTimeTimer.current);
      elapsedTimeTimer.current = null;
    }
  }, []);

  const showQuizResult = useCallback(() => {

    navigate(ROUTES.QUIZ_RESULT, {
      state: {
        examId: examId,
        userId: userId,
        userExamProgressId: userExamProgressId,
        userPackageId: userPackageId,
        examName: examName,
        answered: questionStatuses.filter(status => status === QuestionStatus.Attended).length,
        notAnswered: questionStatuses.filter(status => status === QuestionStatus.NotAttended).length,
        skipped: questionStatuses.filter(status => status === QuestionStatus.Skipped).length,
        totalQuestions: questions.length,
        timeTaken: elapsedTime,
      },
    });

  }, [navigate, examId, userId, userExamProgressId, userPackageId, examName, questionStatuses, questions.length, elapsedTime]);

  const handleQuizSubmit = useCallback(async () => {
    if (!isQuizActiveRef.current) return;

    isQuizActiveRef.current = false;
    stopTimers();
    setLoading(true);

    try {
      const finalScore = calculateScore();

      const submitExamData: SubmitExam = {
        id: Number(userExamProgressId),
        userId: Number(userId),
        packageId: Number(packageId),
        userPackageId: Number(userPackageId),
        examId: Number(examId),
        isCompleted: true,
        score: finalScore,
        startedAtUtc: startTime,
        completedAtUtc: new Date().toISOString(),
        responseData: userExamResponse.responseData,
        status: QuestionSumitStatus.complete
      };

      const result = await SubmitUserExam(submitExamData);
      console.log("This is the submit exam response", result);
      showQuizResult();
    } catch (error) {
      console.log('Failed to submit exam:', error);
      toast.error('Failed to submit exam. Please try again.');
      isQuizActiveRef.current = true;
    } finally {
      setLoading(false);
    }
  }, [calculateScore, userExamProgressId, userId, packageId, userPackageId, examId, startTime, userExamResponse.responseData, stopTimers, setLoading, showQuizResult]);

  // Initialize timers once
  useEffect(() => {
    // Elapsed time timer
    elapsedTimeTimer.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (elapsedTimeTimer.current) {
        clearInterval(elapsedTimeTimer.current);
      }
    };
  }, []); // Empty dependency array - only run once

  // Initialize remaining time timer
  useEffect(() => {
    if (isTimeBound) {
      remainingTimeTimer.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev !== null && prev > 0) {
            return prev - 1;
          }
          return prev;
        });
      }, 1000);
    }

    return () => {
      if (remainingTimeTimer.current) {
        clearInterval(remainingTimeTimer.current);
        remainingTimeTimer.current = null;
      }
    };
  }, [isTimeBound]);

  // Handle auto-submit when time runs out
  useEffect(() => {
    if (isTimeBound && remainingTime === 0 && isQuizActiveRef.current) {
      console.log("Timer ended, auto-submitting exam...");
      handleQuizSubmit();
    }
  }, [remainingTime, isTimeBound, handleQuizSubmit]);

  // Update question start time only when active question changes
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [activeQuestion]);

  // Ref to track if we've already initialized this exam
  const initializedRef = useRef<number | null>(null);

  // Initialize quiz data once
  useEffect(() => {
    const fetchExamQuestions = async () => {
      // Prevent multiple initialization runs
      if (initializedRef.current === examId) return;
      initializedRef.current = examId;

      console.time("QuizInitialization");
      setLoading(true, "quiz-transition");
      console.log("Loader started in Quiz component");
      
      try {
        let loadedQuestions: Question[] = [];
        if (examQuestions && examQuestions.length > 0) {
          loadedQuestions = examQuestions;
        } else {
          console.log("No questions in state, fetching from API...");
          const fetchedQuestions = await getQuestionbyExamAndSectionId(examId, 0);
          if (fetchedQuestions) {
            loadedQuestions = fetchedQuestions;
          }
        }

        if (loadedQuestions.length > 0) {
          setQuestions(loadedQuestions);
          setQuestionStatuses(Array(loadedQuestions.length).fill(QuestionStatus.NotAttended));

          if (timeLimit > 0) {
            setIsTimeBound(true);
            setRemainingTime(timeLimit * 60);
          }
        }

        // --- ASYNC IMAGE PRE-FETCHING + FALLBACK ---
        // Questions are already set, hide loader NOW so student can start immediately
        setLoading(false, "quiz-transition");
        console.log("Loader turned OFF (Quiz ready, images pre-loading in background)");
        console.timeEnd("QuizInitialization");

        // Split questions into: already have a preview URL vs need a frontend fallback
        const alreadyResolved  = loadedQuestions.filter(q => q.imagePreviewUrl);
        const needsFallback    = loadedQuestions.filter(q => !q.imagePreviewUrl && q.image);
        const noImageAtAll     = loadedQuestions.filter(q => !q.imagePreviewUrl && !q.image);

        console.group(`%c[Image Pre-fetch] Initial breakdown`, 'color: #6366f1; font-weight: bold');
        console.log(`✅ Already have imagePreviewUrl : ${alreadyResolved.length}`);
        console.log(`⚠️  Need fallback (has image, no previewUrl): ${needsFallback.length}`);
        console.log(`➖ No image at all               : ${noImageAtAll.length}`);
        console.groupEnd();

        // Warm-up browser cache for already-resolved images
        alreadyResolved.forEach(q => {
          const img = new Image();
          img.src = q.imagePreviewUrl!;
        });

        // Frontend fallback: fetch missing preview URLs question by question
        if (needsFallback.length > 0) {
          const fallbackResults = await Promise.allSettled(
            needsFallback.map(async (q) => {
              const result = await getImageUrlByName(q.image!);
              return { q, url: result?.imageUrl ?? null };
            })
          );

          const fetchedImages:   string[] = [];
          const unfetchedImages: string[] = [];

          // Build patched questions array only when at least one URL was resolved
          const patchMap = new Map<number, string>();

          fallbackResults.forEach(settled => {
            if (settled.status === 'fulfilled') {
              const { q, url } = settled.value;
              if (url) {
                fetchedImages.push(q.image!);
                patchMap.set(q.id, url);
                // Also warm-up browser cache
                const img = new Image();
                img.src = url;
              } else {
                unfetchedImages.push(q.image!);
              }
            } else {
              // Promise itself rejected (network error etc.)
              unfetchedImages.push('unknown (promise rejected)');
            }
          });

          // Patch questions state with fallback URLs
          if (patchMap.size > 0) {
            setQuestions(prev =>
              prev.map(q =>
                patchMap.has(q.id)
                  ? { ...q, imagePreviewUrl: patchMap.get(q.id)! }
                  : q
              )
            );
          }

          // Diagnostic summary
          console.group(`%c[Image Pre-fetch] Fallback summary`, 'color: #10b981; font-weight: bold');
          console.log(`✅ Fetched via fallback  : ${fetchedImages.length}`);
          console.log(`❌ Failed to fetch        : ${unfetchedImages.length}`);
          if (unfetchedImages.length > 0) {
            console.warn('The following image filenames could NOT be resolved — check the docu-API or the filename stored in DB:');
            unfetchedImages.forEach((name, i) => console.warn(`  [${i + 1}] ${name}`));
          }
          if (fetchedImages.length > 0) {
            console.log('Resolved filenames:', fetchedImages);
          }
          console.groupEnd();
        }
      } catch (err) {
        console.log("Failed to load questions:", err);
        toast.error("Failed to load questions. Please try again.");
        setLoading(false, "quiz-transition"); 
      }
    };

    fetchExamQuestions();
  }, [examId, examQuestions, timeLimit, setLoading]);


  // Browser navigation prevention
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isQuizActiveRef.current) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (isQuizActiveRef.current) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.pathname);
        const confirmExit = window.confirm(
          'Are you sure you want to leave? Your progress will be lost!'
        );
        if (!confirmExit) {
          window.history.pushState(null, '', window.location.pathname);
        } else {
          navigate(ROUTES.HOME);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5' || (e.key === 'r' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        return false;
      }
    };

    // Secret code listener for developer options
    let typedKeys = '';
    let typingTimeout: NodeJS.Timeout;

    const handleSecretCode = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Clear the timeout if user is still typing
      clearTimeout(typingTimeout);

      // Add the typed key to the buffer
      typedKeys += e.key.toLowerCase();

      // Check if the secret code "admin" was typed
      if (typedKeys.includes('admin')) {
        // Toggle developer options
        setShowDeveloperOptions(prev => {
          const newState = !prev;
          if (newState) {
            toast.success('🔓 Developer Options Enabled!');
            console.log('Developer options enabled via secret code');
          } else {
            toast.success('🔒 Developer Options Disabled!');
            console.log('Developer options disabled via secret code');
          }
          return newState;
        });
        typedKeys = ''; // Reset after activation
      }

      // Reset the typed keys after 2 seconds of inactivity
      typingTimeout = setTimeout(() => {
        typedKeys = '';
      }, 2000);

      // Keep only last 10 characters to prevent memory issues
      if (typedKeys.length > 10) {
        typedKeys = typedKeys.slice(-10);
      }
    };

    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keypress', handleSecretCode);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keypress', handleSecretCode);
      clearTimeout(typingTimeout);
    };
  }, [navigate]);

  const onAnswerSelected = useCallback(async (studentAnswer: string, index: number) => {
    setSelectedAnswerIndex(index);

    const timeTakenInSeconds = Math.floor((Date.now() - questionStartTime) / 1000);

    const newAnswer: QuizAnswerModel = {
      questionId: currentQuestion.id,
      SelectedOption: studentAnswer,
      timeTakenInSeconds
    };

    setSelectedAnswer(prevAnswers => {
      const existingAnswerIndex = prevAnswers.findIndex(
        answer => answer.questionId === currentQuestion.id
      );

      if (existingAnswerIndex !== -1) {
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = newAnswer;
        return updatedAnswers;
      } else {
        return [...prevAnswers, newAnswer];
      }
    });

    setQuestionStatuses(prevStatuses => {
      const newStatuses = [...prevStatuses];
      newStatuses[activeQuestion] = QuestionStatus.Attended;
      return newStatuses;
    });

    const updatedResponseData: QuizAnswerModel[] = userExamResponse.responseData
      ? JSON.parse(userExamResponse.responseData)
      : [];
    const existingAnswerIndex = updatedResponseData.findIndex(
      answer => answer.questionId === currentQuestion.id
    );

    if (existingAnswerIndex !== -1) {
      updatedResponseData[existingAnswerIndex] = newAnswer;
    } else {
      updatedResponseData.push(newAnswer);
    }

    const updatedResponse = {
      ...userExamResponse,
      responseData: JSON.stringify(updatedResponseData)
    };

    try {
      const result = await AddUpdateUserExam(updatedResponse);
      if (result) {
        setUserExamResponse({
          ...result,
          responseData: JSON.stringify(updatedResponseData)
        });
      }
    } catch (error) {
      console.log('Failed to save response:', error);
    }
  }, [questionStartTime, currentQuestion, activeQuestion, userExamResponse]);

  const onClickNext = useCallback(() => {
    const currentQuestionAnswer = selectedAnswer.find(
      answer => answer.questionId === questions[activeQuestion].id
    );

    if (currentQuestionAnswer) {
      setQuestionStatuses(prevStatuses => {
        const newStatuses = [...prevStatuses];
        newStatuses[activeQuestion] = QuestionStatus.Attended;
        return newStatuses;
      });

      if (activeQuestion < questions.length - 1) {
        const nextQuestionIndex = activeQuestion + 1;
        setActiveQuestion(nextQuestionIndex);

        setSelectedAnswerIndex(null);
      } else {
        setShowConfirmModal(true);
      }
    } else {
      setQuestionStatuses(prevStatuses => {
        const newStatuses = [...prevStatuses];
        newStatuses[activeQuestion] = QuestionStatus.Skipped;
        return newStatuses;
      });

      if (activeQuestion < questions.length - 1) {
        const nextQuestionIndex = activeQuestion + 1;
        setActiveQuestion(nextQuestionIndex);

        setSelectedAnswerIndex(null);
      } else {
        toast('Please select an answer before proceeding');
      }
    }

    setQuestionStartTime(Date.now());
  }, [selectedAnswer, questions, activeQuestion]);

  const areAllQuestionsAnswered = useCallback(() => {
    return !questionStatuses.includes(QuestionStatus.NotAttended) &&
      !questionStatuses.includes(QuestionStatus.Skipped);
  }, [questionStatuses]);

  const handleEndQuizClick = useCallback(() => {
    if (isTimeBound) {
      setShowConfirmModal(true);
    } else {
      if (areAllQuestionsAnswered()) {
        setShowConfirmModal(true);
      } else {
        toast.error('Please answer all questions before submitting the quiz');
      }
    }
  }, [isTimeBound, areAllQuestionsAnswered]);

  const getSelectedAnswerForQuestion = useCallback((questionId: number) => {
    const localAnswer = selectedAnswer.find(
      answer => answer.questionId === questionId
    );
    if (localAnswer) return localAnswer.SelectedOption;

    const responseData: QuizAnswerModel[] = userExamResponse.responseData
      ? JSON.parse(userExamResponse.responseData)
      : [];
    const apiAnswer = responseData.find(response => response.questionId === questionId);
    return apiAnswer ? apiAnswer.SelectedOption : null;
  }, [selectedAnswer, userExamResponse.responseData]);

  const jumpToQuestion = useCallback((index: number) => {
    setQuestionStatuses(prevStatuses => {
      const newStatuses = [...prevStatuses];
      if (prevStatuses[activeQuestion] === QuestionStatus.NotAttended) {
        newStatuses[activeQuestion] = QuestionStatus.Skipped;
      }
      return newStatuses;
    });

    setActiveQuestion(index);

    setSelectedAnswerIndex(null);
  }, [activeQuestion]);

  const onClickPrevious = useCallback(() => {
    if (activeQuestion > 0) {
      const previousQuestionIndex = activeQuestion - 1;
      setActiveQuestion(previousQuestionIndex);

      setSelectedAnswerIndex(null);
    }
  }, [activeQuestion]);

  const addLeadingZero = useCallback((number: number): string =>
    number > 9 ? number.toString() : `0${number}`, []);

  const formatTime = useCallback((time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${addLeadingZero(minutes)}:${addLeadingZero(seconds)}`;
  }, [addLeadingZero]);

  // Destructure current question data
  const { questionText, optionA, optionB, optionC, optionD, questionType } = currentQuestion || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <Toaster />

      {/* Instructions Modal */}
      {showInstructions && examDescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-11/12 p-6 bg-white rounded-lg shadow-lg md:w-2/3 lg:w-1/2">
            <h2 className="mb-4 text-2xl font-bold">Exam Instructions</h2>
            <div className="mb-6 text-gray-700 whitespace-pre-line">{examDescription}</div>
            <button
              onClick={() => setShowInstructions(false)}
              className="w-full p-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Start Quiz
            </button>
          </div>
        </div>
      )}
      {(!showInstructions || !examDescription) && (
        <div>
          {/* Confirmation Modal */}
          {showConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
              <div className="w-11/12 p-6 bg-white rounded-lg shadow-lg md:w-1/2 lg:w-1/3">
                <h2 className="mb-4 text-xl font-bold">Confirm Submission</h2>
                {isTimeBound ? (
                  (notAnsweredCount + skippedCount > 0) ? (
                    <p className="mb-4 text-gray-700">
                      {notAnsweredCount + skippedCount} Ques are not attended, Are You Sure to Finish Quiz?
                    </p>
                  ) : (
                    <p className="mb-4 text-gray-700">All questions are answered. You can safely end the quiz.</p>
                  )
                ) : (
                  (notAnsweredCount === 0 && skippedCount === 0) ? (
                    <p className="mb-4 text-gray-700">All questions are answered. You can safely end the quiz.</p>
                  ) : (
                    <p className="mb-4 text-gray-700">All Ques are compulsory — attend every question to finish.</p>
                  )
                )}
                {notAnsweredCount !== 0 && skippedCount !== 0 ?
                  <p className="mb-2 text-gray-700">
                    You still have <span className="font-semibold">{notAnsweredCount}</span> unanswered and <span className="font-semibold">{skippedCount}</span> skipped questions.
                  </p>
                  : ""}

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="w-full p-2 text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      handleQuizSubmit();
                    }}
                    disabled={!isTimeBound && (notAnsweredCount > 0 || skippedCount > 0)}
                    className={`w-full p-2 font-medium text-white rounded-lg transition-colors duration-200 ${!isTimeBound && (notAnsweredCount > 0 || skippedCount > 0) ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                  >
                    End Quiz
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          {/* Mobile Question Header */}
          <div className="sticky top-0 z-40 bg-white border-b shadow-sm lg:hidden">
            <div className="px-4 py-3 space-y-2">

              {/* Exam title + menu */}
              <div className="flex items-center justify-between">
                <h1 className="text-base font-semibold text-gray-800 truncate">
                  {examName}
                </h1>

                <button
                  onClick={() => setShowMobileNav(true)}
                  className="p-2 bg-gray-100 rounded-md active:bg-gray-200"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>

              {/* Section + Time */}
              <div className="flex items-center justify-between text-sm">
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">
                  SECTION : {
                    sections?.find(s =>
                      s.questions.some(q => q.id === currentQuestion?.id)
                    )?.sectionName || "Section"
                  }
                </span>

                <div className="font-mono text-gray-700">
                  ⏱ {formatTime(elapsedTime)} / {timeLimit}m
                </div>
              </div>

              {/* Question count */}
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  Q {activeQuestion + 1} of {questions.length}
                </span>
                <span>
                  {Math.round(((activeQuestion + 1) / questions.length) * 100)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300 bg-indigo-600"
                  style={{
                    width: `${((activeQuestion + 1) / questions.length) * 100}%`
                  }}
                />
              </div>

            </div>
          </div>

          {/* Desktop Header */}
          <div className="items-center justify-between hidden px-4 py-3 bg-white border-b shadow-sm lg:flex">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-800">{examName}</h1>
              {currentQuestion && (
                <span className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full">
                  Section: {
                    sections?.find(s => s.questions.some(q => q.id === currentQuestion.id))?.sectionName ||
                    ""
                  }
                </span>
              )}

            </div>
            <div className="flex items-center space-x-4">

              {/* Developer Options toggle button */}
              {/* <button
                onClick={handleDeveloperOptions}
                className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-full hover:bg-blue-100"
              >

                Developer Options {showDeveloperOptions ? "On" : "Off"}
              </button> */}
              {/* If developer options are enabled, show the Auto Select All button */}
              {showDeveloperOptions && (
                <button
                  onClick={handleAutoSelectAll}
                  className="px-3 py-1 text-sm text-green-600 border border-green-600 rounded-full hover:bg-green-100"
                >
                  {/* Button to auto-select answers for all questions */}
                  Auto Select All
                </button>
              )}

              <div className="flex flex-col text-right">
                <div className="items-center">
                  <span className="font-medium text-gray-600">Elapsed Time: </span>
                  <span className="font-mono font-medium text-gray-600">
                    {formatTime(elapsedTime)}
                  </span>
                </div>
                {isTimeBound && (
                  <div className="items-center">
                    <span className="font-medium text-gray-600">Total Time: </span>
                    <span className="font-medium text-gray-600">
                      {timeLimit > 0 ? `${timeLimit} minutes` : "Unlimited"}
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowMobileNav(true)}
                className="p-2 bg-gray-100 rounded-md lg:hidden hover:bg-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex h-[calc(100vh-80px)]">
            {/* Main Quiz Container */}
            <div className="flex flex-col flex-1">
              <div className="p-2 lg:p-8">
                <div className="max-w-2xl mx-auto">
                  {/* Question Header */}
                  <div className="hidden mb-8 lg:block">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold text-gray-700">
                        Q No: {activeQuestion + 1}/{questions.length}
                      </span>
                      <div className="w-full h-2 max-w-xs ml-4 bg-gray-200 rounded-full">
                        <div
                          className="h-2 transition-all duration-300 bg-indigo-600 rounded-full"
                          style={{ width: `${((activeQuestion + 1) / questions.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Question */}

                  <div className="p-4 mb-4 bg-white shadow-lg lg:p-8 lg:mb-8 rounded-xl">
                    {/* <h2 className="mb-4 text-base font-medium leading-relaxed text-gray-800 lg:mb-8 lg:text-xl">
                      {questionText}
                    </h2> */}
<div
  className="mb-4 text-base font-medium leading-relaxed text-gray-800 lg:text-xl"
  dangerouslySetInnerHTML={{
    __html: (questionText || "").replace(
      /([\u0A80-\u0AFF])/,
      "<br>$1"
    )
  }}
/>






                    {currentQuestion && currentQuestion.imagePreviewUrl && (
                      <div className="flex justify-center mb-4 relative min-h-[150px]">
                        {currentQuestion.imagePreviewUrl ? (
                          <>
                            <img
                              src={currentQuestion.imagePreviewUrl}
                              alt="Question Illustration"
                              className="object-contain transition-opacity duration-300 max-h-60"
                              onLoad={(e) => {
                                const target = e.currentTarget;
                                target.style.opacity = '1';
                              }}
                              onError={(e) => {
                                // If remote image fails, try fallback to mapper if available
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                console.log(`Failed to load remote image: ${currentQuestion.image}`);
                              }}
                              style={{ opacity: 0 }}
                              loading="lazy"
                            />
                            {/* Simple loader shown while opacity is 0 */}
                            <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-0 pointer-events-none"
                              ref={(ref) => {
                                if (ref && currentQuestion.image) {
                                  // This is a bit hacky but works for a quick "lazy load" feel
                                  const img = ref.previousSibling as HTMLImageElement;
                                  if (img && img.complete) {
                                    ref.style.opacity = '0';
                                  } else {
                                    ref.style.opacity = '1';
                                  }
                                }
                              }}
                            >
                              <div className="flex space-x-4 animate-pulse">
                                <div className="h-40 rounded-md bg-slate-200 w-60"></div>
                              </div>
                            </div>
                          </>
                        ) : null}
                      </div>
                    )}


                    {/* Answer Options */}
                    <div className="grid grid-cols-2 gap-2 lg:gap-4">
                      {questions && questions.length > 0 && currentQuestion ? (
                        [optionA, optionB, optionC, optionD]
                          .slice(0, questionType === 1 ? 2 : 4)
                          .map((option, index) => {
                            const optionLetter = String.fromCharCode(65 + index);
                            const isSelected = selectedAnswerIndex === index ||
                              getSelectedAnswerForQuestion(currentQuestion.id) === optionLetter;

                            return (
                              <button
                                key={index}
                                onClick={() => onAnswerSelected(optionLetter, index)}
                                className={`w-full p-2 lg:p-4 rounded-lg border-2 text-left font-medium transition-all duration-200 ${isSelected
                                  ? 'text-indigo-700 bg-indigo-50 border-indigo-500'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                              >
                                <span className="inline-block w-6 h-6 mr-2 text-xs font-bold leading-6 text-center text-indigo-600 bg-indigo-100 rounded-full lg:mr-3 lg:w-8 lg:h-8 lg:text-sm lg:leading-8">
                                  {optionLetter}
                                </span>
                                <span className="text-sm lg:text-base">{option}</span>
                              </button>
                            );
                          })
                      ) : (
                        <p>No questions available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="p-3 bg-white border-t lg:p-6">
                <div className="flex justify-between max-w-2xl mx-auto">
                  <button
                    onClick={onClickPrevious}
                    disabled={activeQuestion === 0}
                    className={`flex items-center space-x-2 px-4 py-2 lg:px-6 lg:py-3 rounded-lg font-medium text-sm lg:text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${activeQuestion === 0 ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={onClickNext}
                    className={`flex items-center space-x-2 px-4 py-2 lg:px-6 lg:py-3 rounded-lg font-medium text-sm lg:text-base transition-all duration-200 ${questionStatuses[activeQuestion] === QuestionStatus.Attended
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                  >
                    <span>{activeQuestion === questions.length - 1 ? 'Finish' : 'Next'}</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Question Navigator - Desktop */}
            <div className="hidden h-full bg-white border-l shadow-sm w-80 lg:block">
              <div className="flex flex-col h-full p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Question Navigator</h3>

                {/* Question Grid */}
                <div className="grid flex-1 min-h-0 grid-cols-5 gap-2 mb-6 overflow-y-auto">
                  {questions.map((_, index) => {
                    let bgColorClass = 'bg-gray-200 text-gray-700 hover:bg-gray-300';
                    if (questionStatuses[index] === QuestionStatus.Skipped) {
                      bgColorClass = 'bg-yellow-500 text-white';
                    } else if (questionStatuses[index] === QuestionStatus.Attended) {
                      bgColorClass = 'bg-green-500 text-white';
                    }
                    if (index === activeQuestion) {
                      bgColorClass = 'bg-blue-500 text-white';
                    }

                    return (
                      <button
                        key={index}
                        onClick={() => jumpToQuestion(index)}
                        className={`w-10 h-10 text-sm font-medium rounded-lg transition-all duration-200 ${bgColorClass}`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <FaCircle className="text-green-500" />
                    <span className="text-gray-600">Answered</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaCircle className="text-yellow-500" />
                    <span className="text-gray-600">Skipped</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaCircle className="text-gray-300" />
                    <span className="text-gray-600">Not Attended</span>
                  </div>
                </div>

                {/* End Quiz Button */}
                <button
                  onClick={handleEndQuizClick}
                  disabled={!isTimeBound && (notAnsweredCount > 0 || skippedCount > 0)}
                  className={`px-4 py-3 mt-8 w-full font-medium text-white bg-red-500 rounded-lg transition-colors duration-200 hover:bg-red-600`}
                >
                  End Quiz
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Modal */}
          {showMobileNav && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 lg:hidden">
              <div className="absolute top-0 right-0 h-full bg-white shadow-xl w-80">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Question Navigator</h3>
                    <button
                      onClick={() => setShowMobileNav(false)}
                      className="p-2 rounded-md hover:bg-gray-100"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Question Grid */}
                  <div className="grid grid-cols-5 gap-2 mb-6" style={{ overflowY: 'auto', maxHeight: '300px' }}>
                    {questions.map((_, index) => {
                      let bgColorClass = 'bg-gray-200 text-gray-700 hover:bg-gray-300';
                      if (questionStatuses[index] === QuestionStatus.Skipped) {
                        bgColorClass = 'bg-yellow-500 text-white';
                      } else if (questionStatuses[index] === QuestionStatus.Attended) {
                        bgColorClass = 'bg-green-500 text-white';
                      }
                      if (index === activeQuestion) {
                        bgColorClass = 'bg-blue-500 text-white';
                      }

                      return (
                        <button
                          key={index}
                          onClick={() => {
                            jumpToQuestion(index);
                            setShowMobileNav(false);
                          }}
                          className={`w-10 h-10 text-sm font-medium rounded-lg transition-all duration-200 ${bgColorClass}`}
                        >
                          {index + 1}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mb-8 space-y-3 text-sm">
                    <div className="flex items-center space-x-3">
                      <FaCircle className="text-green-500" />
                      <span className="text-gray-600">Answered</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaCircle className="text-yellow-500" />
                      <span className="text-gray-600">Skipped</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <FaCircle className="text-gray-300" />
                      <span className="text-gray-600">Not Attended</span>
                    </div>
                  </div>

                  {/* End Quiz Button */}
                  <button
                    onClick={handleEndQuizClick}
                    className={`px-4 py-3 w-full font-medium text-white rounded-lg transition-colors duration-200 ${!isTimeBound && (notAnsweredCount > 0 || skippedCount > 0) ? 'bg-gray-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}
                  >
                    End Quiz
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Quiz;
