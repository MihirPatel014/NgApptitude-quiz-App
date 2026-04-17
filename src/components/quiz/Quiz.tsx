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
import { ROUTES } from '../../common/constant';



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
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [imageScale, setImageScale] = useState<number>(1);
  const [navigatorSegment, setNavigatorSegment] = useState<number>(0);
  const [navVariation, setNavVariation] = useState<'paginated' | 'scroll'>('paginated');
  const NAV_PAGE_SIZE = 20;

  // Memoized values
  const startTime = useMemo(() => new Date().toISOString(), []);
  const { loading, setLoading } = useLoader();

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

  // Sync navigator segment with active question
  useEffect(() => {
    const segment = Math.floor(activeQuestion / NAV_PAGE_SIZE);
    setNavigatorSegment(segment);
  }, [activeQuestion, NAV_PAGE_SIZE]);

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
        packageId: packageId,
        examName: examName,
        answered: questionStatuses.filter(status => status === QuestionStatus.Attended).length,
        notAnswered: questionStatuses.filter(status => status === QuestionStatus.NotAttended).length,
        skipped: questionStatuses.filter(status => status === QuestionStatus.Skipped).length,
        totalQuestions: questions.length,
        timeTaken: elapsedTime,
      },
    });

  }, [navigate, examId, userId, userExamProgressId, userPackageId, packageId, examName, questionStatuses, questions.length, elapsedTime]);

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
        status: QuestionSumitStatus.Complete
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
    <div className="h-screen overflow-hidden bg-mesh-light relative font-inter">
      <Toaster />

      {/* Image Preview Modal (Lightbox) */}
      {showImageModal && currentQuestion?.imagePreviewUrl && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-fade-in p-4 md:p-10"
          onClick={() => setShowImageModal(false)}
        >
          <div className="absolute top-6 right-6 flex items-center space-x-4 z-[210]">
            <div className="flex items-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-1">
              <button 
                onClick={(e) => { e.stopPropagation(); setImageScale(prev => Math.max(0.5, prev - 0.2)); }}
                className="p-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                title="Zoom Out"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
              </button>
              <span className="px-3 text-white text-xs font-black min-w-[3rem] text-center">
                {Math.round(imageScale * 100)}%
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); setImageScale(prev => Math.min(3, prev + 0.2)); }}
                className="p-3 text-white hover:bg-white/10 rounded-xl transition-colors"
                title="Zoom In"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              </button>
            </div>
            
            <button 
              onClick={() => setShowImageModal(false)}
              className="p-4 bg-white/10 hover:bg-rose-500/20 text-white rounded-2xl backdrop-blur-md border border-white/20 transition-all active:scale-95"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div 
            className="relative transform-gpu transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing select-none h-full w-full flex items-center justify-center overflow-auto custom-scrollbar"
            style={{ transform: `scale(${imageScale})` }}
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={currentQuestion.imagePreviewUrl} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
              draggable={false}
            />
          </div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 glass-morphic rounded-full text-white/80 text-xs font-bold pointer-events-none">
            Use pinch or buttons to zoom • Drag to pan
          </div>
        </div>
      )}

      {/* Instructions Modal */}
      {showInstructions && examDescription && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl glass-morphic p-8 lg:p-12 rounded-[2.5rem] shadow-2xl animate-scale-up">
            <div className="flex items-center space-x-5 mb-8">
              <div className="w-16 h-16 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-200/50 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Exam Protocol</h2>
                <div className="h-1 w-12 bg-indigo-600 rounded-full mt-1 opacity-50"></div>
              </div>
            </div>
            
            <div className="mb-10 text-gray-600 text-sm lg:text-base leading-relaxed whitespace-pre-line max-h-[50vh] overflow-y-auto custom-scrollbar pr-6">
              {examDescription}
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="w-full py-5 font-black text-lg text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-indigo-200 transition-all duration-300 btn-premium group"
            >
              <span className="flex items-center justify-center space-x-3">
                <span>BEGIN ASSESSMENT</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </span>
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-full bg-white/30 backdrop-blur-xl">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-indigo-100/50 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl animate-pulse opacity-20"></div>
            </div>
          </div>
          <p className="mt-8 text-xs font-black text-indigo-600 animate-pulse uppercase tracking-[0.4em]">Optimizing Session</p>
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-hidden relative z-10">
          {(!showInstructions || !examDescription) && (
            <>
              {/* Confirmation Modal */}
              {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-2xl">
                  <div className="w-full max-w-sm glass-morphic p-8 rounded-[3rem] shadow-2xl animate-scale-up text-center border border-white/50">
                    <div className="mx-auto w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner relative">
                      <div className="absolute inset-0 bg-rose-500/10 rounded-[2rem] animate-ping"></div>
                      <svg className="w-10 h-10 text-rose-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    
                    <h2 className="mb-2 text-2xl font-black text-gray-900">Finish Exam?</h2>
                    
                    <div className="mb-8 space-y-3">
                      {isTimeBound ? (
                        (notAnsweredCount + skippedCount > 0) ? (
                          <p className="text-gray-500 font-medium">
                            You have <span className="text-rose-500 font-bold">{notAnsweredCount + skippedCount}</span> questions remaining. Are you sure you want to exit?
                          </p>
                        ) : (
                          <p className="text-gray-500 font-medium">Excellent! All questions are answered. Ready to see your results?</p>
                        )
                      ) : (
                        (notAnsweredCount === 0 && skippedCount === 0) ? (
                          <p className="text-gray-500 font-medium">Ready to submit! Your progress is fully saved.</p>
                        ) : (
                          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col items-center">
                            <p className="text-amber-800 text-sm font-bold mb-1">UNFINISHED QUESTIONS</p>
                            <p className="text-amber-600 text-xs">All questions are compulsory in this mode.</p>
                          </div>
                        )
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setShowConfirmModal(false)}
                        className="py-4 text-sm font-black text-gray-500 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all btn-premium"
                      >
                        CONTINUE
                      </button>
                      <button
                        onClick={() => {
                          setShowConfirmModal(false);
                          handleQuizSubmit();
                        }}
                        disabled={!isTimeBound && (notAnsweredCount > 0 || skippedCount > 0)}
                        className={`py-4 text-sm font-black text-white rounded-2xl transition-all shadow-lg btn-premium ${!isTimeBound && (notAnsweredCount > 0 || skippedCount > 0) ? 'bg-gray-300 cursor-not-allowed grayscale' : 'bg-gradient-to-r from-rose-500 to-red-600 shadow-rose-200/50'}`}
                      >
                        FINISH NOW
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Header */}
              <div className="h-14 flex items-center justify-between px-4 glass border-b border-white/20 shadow-xl md:hidden shrink-0 z-40">
                <button
                  onClick={() => setShowMobileNav(true)}
                  className="p-2.5 bg-indigo-600/10 rounded-xl text-indigo-600 active:scale-95 transition-transform"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="text-center">
                  <h2 className="text-[11px] font-black text-gray-800 uppercase tracking-tight truncate max-w-[180px] leading-tight">{examName}</h2>
                  <p className="text-[10px] font-bold text-indigo-600 tabular-nums">
                    {formatTime(elapsedTime)}
                  </p>
                </div>
                <div className="w-10"></div>
              </div>

              {/* Desktop Header */}
              <div className="h-16 hidden px-8 md:flex glass-morphic border-b border-white/40 shadow-sm z-40 justify-between items-center shrink-0">
                <div className="flex items-center space-x-5">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-base font-black text-gray-900 tracking-tight truncate max-w-[400px]">
                      {examName}
                    </h1>
                    {currentQuestion && (
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">
                          {sections?.find(s => s.questions.some(q => q.id === currentQuestion.id))?.sectionName || "Core Section"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  {showDeveloperOptions && (
                    <button
                      onClick={handleAutoSelectAll}
                      className="px-4 py-1.5 text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full hover:bg-indigo-100 transition-all btn-premium"
                    >
                      DEBUG: AUTO SOLVE
                    </button>
                  )}

                  <div className="flex items-center space-x-6">
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] uppercase font-black text-gray-400 tracking-widest">Elapsed Time</span>
                      <span className="text-lg font-mono font-black text-indigo-600 tabular-nums leading-none">
                        {formatTime(elapsedTime)}
                      </span>
                    </div>
                    
                    {isTimeBound && (
                      <div className="h-10 w-[1px] bg-gray-200/50"></div>
                    )}

                    {isTimeBound && (
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] uppercase font-black text-gray-400 tracking-widest">Time Limit</span>
                        <span className="text-lg font-black text-gray-700 leading-none">
                          {timeLimit > 0 ? `${timeLimit}m` : "∞"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

          <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            {/* Main Quiz Container */}
            <div className="flex flex-col flex-1 overflow-hidden bg-gray-50/50">
              <div className="p-4 lg:p-6 flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto">
                  {/* Question Header */}
                  <div className="hidden mb-4 lg:block animate-fade-slide-up">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-black text-indigo-600">
                          {addLeadingZero(activeQuestion + 1)}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          / {questions.length} Questions
                        </span>
                      </div>
                      <div className="flex-1 max-w-[200px] ml-4 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-700 ease-out bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                          style={{ width: `${((activeQuestion + 1) / questions.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Question Card */}
                  <div className="p-5 lg:p-7 mb-4 glass-morphic rounded-[2.5rem] animate-scale-up relative overflow-hidden border border-white/40 shadow-2xl shadow-indigo-100/10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    
                    <div
                      className="mb-5 text-base lg:text-lg font-bold leading-snug text-gray-800 relative z-10"
                      dangerouslySetInnerHTML={{
                        __html: (questionText || "").replace(
                          /([\u0A80-\u0AFF])/,
                          "<br>$1"
                        )
                      }}
                    />

                    {currentQuestion && currentQuestion.imagePreviewUrl && (
                      <div className="flex justify-center mb-6 group relative">
                        <div className="relative p-2 bg-white/30 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm group-hover:shadow-xl transition-all duration-500 overflow-hidden">
                          <img
                            src={currentQuestion.imagePreviewUrl}
                            alt="Question Illustration"
                            className="object-contain max-h-80 lg:max-h-[450px] rounded-xl transition-transform duration-700 group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                          <button 
                            onClick={() => { setShowImageModal(true); setImageScale(1); }}
                            className="absolute top-4 right-4 p-3 bg-indigo-600 text-white rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-indigo-700 active:scale-90 flex items-center space-x-2 z-20"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                            <span className="text-[10px] font-black tracking-widest">TAP TO ZOOM</span>
                          </button>
                          
                          <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors duration-300 pointer-events-none"></div>
                        </div>
                      </div>
                    )}

                    {/* Answer Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                                className={`group relative w-full p-3 lg:p-3.5 rounded-2xl border-2 text-left transition-all duration-200 btn-premium ${isSelected
                                  ? 'text-indigo-900 bg-indigo-600/10 border-indigo-500 shadow-lg shadow-indigo-100/50'
                                  : 'border-white/50 bg-white/40 hover:border-indigo-200 hover:bg-white/60'
                                  }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center text-xs font-black rounded-xl transition-all duration-300 ${isSelected
                                    ? 'bg-indigo-600 text-white rotate-[360deg] shadow-lg'
                                    : 'bg-white text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'
                                    }`}>
                                    {optionLetter}
                                  </span>
                                  <span className="text-sm font-bold leading-tight line-clamp-2">{option}</span>
                                </div>
                                
                                {isSelected && (
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center animate-scale-up">
                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                  </div>
                                )}
                              </button>
                            );
                          })
                      ) : (
                        <div className="col-span-2 py-8 text-center text-gray-300 text-xs">
                          <p>Synchronizing questions...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

                  {/* Navigation Controls - Compact */}
                  <div className="p-3 glass border-t border-white/40 backdrop-blur-xl shrink-0 z-40">
                    <div className="flex items-center justify-between max-w-4xl mx-auto px-4">
                      <button
                        onClick={onClickPrevious}
                        disabled={activeQuestion === 0}
                        className={`group flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-black text-xs transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed btn-premium border border-white/50 shadow-sm ${activeQuestion === 0 ? 'bg-white/10 text-gray-400' : 'bg-white/80 hover:bg-white text-gray-700'
                          }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>BACK</span>
                      </button>

                      <div className="hidden sm:flex items-center space-x-3 bg-white/40 px-4 py-1.5 rounded-2xl border border-white/50 backdrop-blur-md">
                        <span className="text-[10px] font-black text-indigo-600 tracking-wider">QUESTION {activeQuestion + 1}</span>
                        <div className="w-[1px] h-3 bg-indigo-200"></div>
                        <span className="text-[10px] font-black text-gray-400 tracking-wider uppercase">{questions.length} TOTAL</span>
                      </div>

                      <button
                        onClick={onClickNext}
                        className={`group flex items-center space-x-2 px-7 py-2.5 rounded-2xl font-black text-xs transition-all duration-300 shadow-xl btn-premium ${questionStatuses[activeQuestion] === QuestionStatus.Attended
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-emerald-200/50'
                          : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-indigo-200/50'
                          }`}
                      >
                        <span>{activeQuestion === questions.length - 1 ? 'FINISH' : 'NEXT'}</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
            </div>

            {/* Question Navigator - Desktop */}
            <div className="hidden h-full glass-morphic border-l border-white/40 w-72 md:block relative z-40 shrink-0">
              <div className="flex flex-col h-full">
                {/* Navigator Header with Progress */}
                <div className="p-5 border-b border-white/30 flex flex-col items-center">
                  <div className="relative w-24 h-24 mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="48" cy="48" r="42"
                        stroke="currentColor" strokeWidth="6"
                        fill="transparent" className="text-white/20"
                      />
                      <circle
                        cx="48" cy="48" r="42"
                        stroke="currentColor" strokeWidth="6"
                        fill="transparent"
                        strokeDasharray={264}
                        strokeDashoffset={264 - (264 * questionStatuses.filter(s => s === QuestionStatus.Attended).length / questions.length)}
                        className="text-indigo-600 transition-all duration-1000 ease-out"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-gray-900 leading-none">
                        {Math.round((questionStatuses.filter(s => s === QuestionStatus.Attended).length / questions.length) * 100)}%
                      </span>
                      <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-1">Ready</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 w-full">
                    <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
                      <div className="text-sm font-black text-emerald-600">{questionStatuses.filter(s => s === QuestionStatus.Attended).length}</div>
                      <div className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest">Done</div>
                    </div>
                    <div className="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-center">
                      <div className="text-sm font-black text-yellow-600">{skippedCount}</div>
                      <div className="text-[8px] text-yellow-500 font-bold uppercase tracking-widest">Skip</div>
                    </div>
                    <div className="p-2 bg-gray-500/5 rounded-xl border border-gray-500/10 text-center">
                      <div className="text-sm font-black text-gray-400">{notAnsweredCount}</div>
                      <div className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Left</div>
                    </div>
                  </div>
                </div>

                {/* Monochrome Premium Question Navigator */}
                <div className="p-5 flex-1 overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                    <div className="flex flex-col">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Navigation</h3>
                      <div className="flex items-center space-x-3 mt-2">
                        <button 
                          onClick={() => setNavVariation('paginated')}
                          className={`group flex items-center space-x-1.5 transition-all ${navVariation === 'paginated' ? 'text-slate-900 scale-105' : 'text-slate-300 hover:text-slate-400'}`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${navVariation === 'paginated' ? 'bg-slate-900 shadow-[0_0_8px_rgba(15,23,42,0.3)]' : 'bg-slate-200'}`} />
                          <span className="text-[9px] font-black uppercase tracking-tighter">Grid View</span>
                        </button>
                        <button 
                          onClick={() => setNavVariation('scroll')}
                          className={`group flex items-center space-x-1.5 transition-all ${navVariation === 'scroll' ? 'text-slate-900 scale-105' : 'text-slate-300 hover:text-slate-400'}`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${navVariation === 'scroll' ? 'bg-slate-900 shadow-[0_0_8px_rgba(15,23,42,0.3)]' : 'bg-slate-200'}`} />
                          <span className="text-[9px] font-black uppercase tracking-tighter">Horizontal Reel</span>
                        </button>
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-slate-900 rounded-xl shadow-lg relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-[11px] font-black text-white tabular-nums relative z-10">
                        {activeQuestion + 1} <span className="text-slate-500 font-bold mx-0.5">/</span> {questions.length}
                      </span>
                    </div>
                  </div>

                  {navVariation === 'paginated' && (
                    <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
                      {/* Segmented Range Selector - Monochrome */}
                      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-4 shrink-0 px-0.5">
                        {Array.from({ length: Math.ceil(questions.length / NAV_PAGE_SIZE) }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setNavigatorSegment(i)}
                            className={`px-3 py-2 rounded-xl text-[10px] font-black transition-all shrink-0 border-2 ${navigatorSegment === i 
                              ? 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200' 
                              : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50 hover:border-slate-300'}`}
                          >
                            {i * NAV_PAGE_SIZE + 1}-{Math.min((i + 1) * NAV_PAGE_SIZE, questions.length)}
                          </button>
                        ))}
                      </div>

                      {/* Paginated Grid - Increased Spacing - Monochrome */}
                      <div className="grid grid-cols-4 gap-4 p-1 overflow-y-auto custom-scrollbar">
                        {questions.slice(navigatorSegment * NAV_PAGE_SIZE, (navigatorSegment + 1) * NAV_PAGE_SIZE).map((_, i) => {
                          const index = navigatorSegment * NAV_PAGE_SIZE + i;
                          let statusClass = 'bg-white border-slate-100 text-slate-400 hover:border-slate-900 hover:text-slate-900 hover:scale-105';
                          
                          if (questionStatuses[index] === QuestionStatus.Skipped) {
                            statusClass = 'bg-slate-50 border-slate-200 text-slate-600 shadow-sm';
                          } else if (questionStatuses[index] === QuestionStatus.Attended) {
                            statusClass = 'bg-slate-100 border-slate-300 text-slate-900 shadow-sm';
                          }
                          
                          if (index === activeQuestion) {
                            statusClass = 'bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200 scale-110 z-10';
                          }

                          return (
                            <button
                              key={index}
                              onClick={() => jumpToQuestion(index)}
                              className={`w-full aspect-square text-[13px] font-black rounded-2xl transition-all duration-300 btn-premium flex items-center justify-center border-2 ${statusClass}`}
                            >
                              {index + 1}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {navVariation === 'scroll' && (
                    <div className="flex-1 flex flex-col animate-fade-in py-4 overflow-hidden">
                       <div className="flex-1 flex flex-col justify-center space-y-12">
                          <div className="text-center">
                             <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4 block">Select Index</span>
                             <div className="relative h-24 flex items-center bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden group">
                                {/* Side Gradients */}
                                <div className="absolute left-0 inset-y-0 w-16 bg-gradient-to-r from-slate-50 to-transparent z-10" />
                                <div className="absolute right-0 inset-y-0 w-16 bg-gradient-to-l from-slate-50 to-transparent z-10" />
                                
                                <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-32 w-full h-full scroll-smooth py-4">
                                   {questions.map((_, i) => (
                                      <button
                                         key={i}
                                         id={`reel-item-${i}`}
                                         onClick={() => jumpToQuestion(i)}
                                         className={`flex-none w-14 h-14 snap-center flex items-center justify-center rounded-2xl font-black text-lg transition-all transform origin-center ${i === activeQuestion 
                                            ? 'bg-slate-900 text-white shadow-2xl scale-125 z-20' 
                                            : 'bg-white text-slate-300 border border-slate-100 opacity-40 hover:opacity-100'}`}
                                      >
                                         {i + 1}
                                      </button>
                                   ))}
                                </div>
                             </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-white rounded-3xl border border-slate-100 flex flex-col space-y-1">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</span>
                                <span className={`text-[11px] font-black uppercase tracking-tight ${
                                  questionStatuses[activeQuestion] === QuestionStatus.Attended ? 'text-slate-900' :
                                  questionStatuses[activeQuestion] === QuestionStatus.Skipped ? 'text-slate-400' : 'text-slate-200'
                                }`}>
                                  {questionStatuses[activeQuestion] === QuestionStatus.Attended ? 'Assessment Done' :
                                   questionStatuses[activeQuestion] === QuestionStatus.Skipped ? 'Option Skipped' : 'Pending Response'}
                                </span>
                             </div>
                             <div className="p-4 bg-slate-900 rounded-3xl flex flex-col space-y-1 shadow-lg">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Progress</span>
                                <span className="text-[11px] font-black text-white uppercase tracking-tight">
                                   {Math.round((questionStatuses.filter(s => s === QuestionStatus.Attended).length / questions.length) * 100)}% Complete
                                </span>
                             </div>
                          </div>
                       </div>
                    </div>
                  )}
                </div>

                {/* End Quiz Footer */}
                <div className="p-5 bg-white/40 border-t border-white/30 backdrop-blur-md">
                  <button
                    onClick={handleEndQuizClick}
                    disabled={!isTimeBound && (notAnsweredCount > 0 || skippedCount > 0)}
                    className="w-full py-4 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-2xl shadow-rose-200 transition-all btn-premium disabled:grayscale disabled:opacity-50 tracking-widest"
                  >
                    SUBMIT ASSESSMENT
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Modal */}
          {showMobileNav && (
            <div className="fixed inset-0 z-[100] transition-opacity duration-300">
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => setShowMobileNav(false)}
              ></div>
              <div className="absolute top-0 right-0 h-full glass-morphic shadow-2xl w-[85%] max-w-sm animate-fade-slide-up flex flex-col border-l border-white/40">
                <div className="p-6 border-b border-white/30 flex items-center justify-between sticky top-0 z-10">
                  <div>
                    <h3 className="text-xl font-black text-gray-800 tracking-tight">Assessment Matrix</h3>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mt-1">Real-time status</p>
                  </div>
                  <button
                    onClick={() => setShowMobileNav(false)}
                    className="p-3 rounded-2xl bg-indigo-600/10 text-indigo-600 active:scale-90 transition-transform"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                  <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight">Assessment Matrix</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Analytics</p>
                    </div>
                    <button 
                      onClick={() => setShowMobileNav(false)}
                      className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 active:scale-95"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>

                  {/* Quick Stats - Monochrome */}
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl text-center">
                      <div className="text-2xl font-black text-slate-900">{questionStatuses.filter(s => s === QuestionStatus.Attended).length}</div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Done</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl text-center">
                      <div className="text-2xl font-black text-slate-600">{questionStatuses.filter(s => s === QuestionStatus.Skipped).length}</div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Skip</div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-3xl text-center">
                      <div className="text-2xl font-black text-slate-300">{questions.length - questionStatuses.filter(s => s !== QuestionStatus.NotAttended).length}</div>
                      <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Left</div>
                    </div>
                  </div>
                </div>

                  {/* Monochrome Mobile Navigation Variations */}
                  <div className="flex flex-col h-full animate-fade-in">
                    <div className="flex items-center space-x-4 mb-6 sticky top-0 bg-white/10 backdrop-blur-sm py-2">
                       <button 
                          onClick={() => setNavVariation('paginated')}
                          className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${navVariation === 'paginated' ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}
                       >
                          Grid View
                       </button>
                       <button 
                          onClick={() => setNavVariation('scroll')}
                          className={`flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${navVariation === 'scroll' ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-white text-slate-400'}`}
                       >
                          Horizontal Reel
                       </button>
                    </div>

                    {navVariation === 'paginated' && (
                      <div className="flex flex-col h-full">
                        {/* Page Segments - Monochrome */}
                        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-6 shrink-0">
                          {Array.from({ length: Math.ceil(questions.length / NAV_PAGE_SIZE) }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setNavigatorSegment(i)}
                              className={`px-5 py-2.5 rounded-2xl text-[11px] font-black transition-all shrink-0 border-2 ${navigatorSegment === i 
                                ? 'bg-slate-900 border-slate-900 text-white shadow-xl scale-105' 
                                : 'bg-white border-slate-100 text-slate-400'}`}
                            >
                              {i * NAV_PAGE_SIZE + 1}-{Math.min((i + 1) * NAV_PAGE_SIZE, questions.length)}
                            </button>
                          ))}
                        </div>

                        {/* Paginated Grid - Monochrome */}
                        <div className="grid grid-cols-4 gap-5 mb-8">
                          {questions.slice(navigatorSegment * NAV_PAGE_SIZE, (navigatorSegment + 1) * NAV_PAGE_SIZE).map((_, i) => {
                            const index = navigatorSegment * NAV_PAGE_SIZE + i;
                            let statusClass = 'bg-white border-slate-100 text-slate-400 shadow-sm active:scale-95';
                            
                            if (questionStatuses[index] === QuestionStatus.Skipped) {
                              statusClass = 'bg-slate-50 border-slate-200 text-slate-600';
                            } else if (questionStatuses[index] === QuestionStatus.Attended) {
                              statusClass = 'bg-slate-100 border-slate-200 text-slate-900';
                            }
                            
                            if (index === activeQuestion) {
                              statusClass = 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-110';
                            }

                            return (
                              <button
                                key={index}
                                onClick={() => {
                                  jumpToQuestion(index);
                                  setShowMobileNav(false);
                                }}
                                className={`w-full aspect-square text-lg font-black rounded-[1.5rem] transition-all duration-300 flex items-center justify-center border-2 btn-premium ${statusClass}`}
                              >
                                {index + 1}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {navVariation === 'scroll' && (
                       <div className="flex-1 flex flex-col items-center justify-center pb-12">
                          <div className="w-full h-80 glass-morphic rounded-[2.5rem] border border-white/60 flex flex-col items-center justify-center p-8 bg-slate-50/30">
                             <div className="relative w-full h-32 flex items-center overflow-hidden">
                                {/* Gradient Fades */}
                                <div className="absolute left-0 inset-y-0 w-20 bg-gradient-to-r from-slate-50/80 to-transparent z-10" />
                                <div className="absolute right-0 inset-y-0 w-20 bg-gradient-to-l from-slate-50/80 to-transparent z-10" />
                                
                                <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar snap-x snap-mandatory px-32 w-full h-full">
                                   {questions.map((_, i) => (
                                      <button
                                         key={i}
                                         onClick={() => jumpToQuestion(i)}
                                         className={`flex-none w-20 h-20 snap-center flex items-center justify-center rounded-3xl font-black text-3xl transition-all transform ${i === activeQuestion 
                                            ? 'bg-slate-900 text-white shadow-2xl scale-110' 
                                            : 'bg-white text-slate-200 border border-slate-100 opacity-40'}`}
                                      >
                                         {i + 1}
                                      </button>
                                   ))}
                                </div>
                             </div>
                             
                             <div className="mt-12 flex flex-col items-center">
                                <div className="px-6 py-2 bg-slate-100 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">
                                   Selected Index
                                </div>
                                <div className="text-6xl font-black text-slate-900 tabular-nums">
                                   {activeQuestion + 1}
                                </div>
                             </div>
                          </div>
                          
                          <button 
                             onClick={() => setShowMobileNav(false)}
                             className="mt-12 w-full py-5 bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-3xl shadow-xl active:scale-95 transition-transform"
                          >
                             Jump to Question
                          </button>
                       </div>
                    )}
                  </div>
                </div>

                {/* Mobile End Quiz Footer */}
                <div className="p-6 bg-white/40 border-t border-white/30 backdrop-blur-md sticky bottom-0">
                  <button
                    onClick={handleEndQuizClick}
                    disabled={!isTimeBound && (notAnsweredCount > 0 || skippedCount > 0)}
                    className="w-full py-5 bg-slate-900 hover:bg-black text-white text-[13px] font-black uppercase tracking-[0.2em] rounded-3xl transition-all duration-300 shadow-xl shadow-slate-100 active:scale-[0.98] disabled:grayscale disabled:opacity-50"
                  >
                    SUBMIT ASSESSMENT
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )}
</div>
);
};

export default Quiz;
