import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GetAllquestionsCategory,
  getQuestionbyExamAndSectionId,
} from '../../services/questionService';
import { Question, QuestionCategory } from '../../types/question';
import { FaCircle } from "react-icons/fa";

import { QuizAnswerModel, SubmitExam, UserExamResponse } from '../../types/exam';
import { AddUpdateUserExam, SubmitUserExam } from '../../services/examService';
import { QuestionSumitStatus } from '../../common/constant';
import toast, { Toaster } from 'react-hot-toast';

import { useLoader } from '../../provider/LoaderProvider';
import spatial_Image1 from "../../../src/assests/spatial/image_1.png";
import spatial_Image2 from "../../../src/assests/spatial/image_2.png";
import spatial_Image3 from "../../../src/assests/spatial/image_3.png";
import spatial_Image4 from "../../../src/assests/spatial/image_4.png";
import spatial_Image5 from "../../../src/assests/spatial/image_5.png";

import image_1 from "../../../src/assests/logical/image_1.png";
import image_2 from "../../../src/assests/logical/image_2.png";



const QuestionStatus = {
  NotAttended: 0,
  Skipped: 1,
  Attended: 2,
} as const;
const quiz_image_mapper: { [key: number]: string } = {
  137: spatial_Image1,
  138: spatial_Image2,
  139: spatial_Image3,
  140: spatial_Image4,
  141: spatial_Image5,
  123:image_1,
  124:image_2,
}
type QuestionStatusType = typeof QuestionStatus[keyof typeof QuestionStatus];

export interface QuizProps {
  userId: number;
  examId: number;
  examName: string;
  examDescription:string;
  timeLimit: number;
  userExamProgressId: number;
  userPackageId: number;
  packageId: number;
  examQuestions: Question[];
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
  examQuestions
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

  const [allCategories, setAllCategories] = useState<QuestionCategory[]>([]);
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

  const handleDeveloperOptions = () => {
    setShowDeveloperOptions(prev => !prev);
    console.log("Developer options toggled to", !showDeveloperOptions);
  };

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
  }, [questions, userExamResponse.responseData, questionStatuses]);

  // Memoized calculations
  const currentQuestion = useMemo(() => questions[activeQuestion], [questions, activeQuestion]);

  const answeredCount = useMemo(() =>
    questionStatuses.filter(status => status === QuestionStatus.Attended).length,
    [questionStatuses]
  );

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
  }, [calculateScore, userExamProgressId, userId, packageId, userPackageId, examId, startTime, userExamResponse.responseData, stopTimers, setLoading]);

  const showQuizResult = useCallback(() => {
    debugger;
    
    navigate('/quizresult', {
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
    if (isTimeBound && remainingTime !== null && remainingTime > 0) {
      remainingTimeTimer.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev !== null && prev > 0) {
            return prev - 1;
          } else {
            handleQuizSubmit();
            return prev;
          }
        });
      }, 1000);
    }

    return () => {
      if (remainingTimeTimer.current) {
        clearInterval(remainingTimeTimer.current);
        remainingTimeTimer.current = null;
      }
    };
  }, [isTimeBound, remainingTime, handleQuizSubmit]); // Only re-run when these specific values change

  // Update question start time only when active question changes
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [activeQuestion]);

  // Initialize quiz data once
  useEffect(() => {
    const fetchExamQuestions = async () => {
      try {
        if (examQuestions && examQuestions.length > 0) {
          setQuestions(examQuestions);

          setQuestionStatuses(Array(examQuestions.length).fill(QuestionStatus.NotAttended));

          if (timeLimit > 0) {
            setIsTimeBound(true);
            setRemainingTime(timeLimit * 60);
          }
        } else {
          const response = await getQuestionbyExamAndSectionId(examId, 0);
          if (response) {
            setQuestions(response);

            setQuestionStatuses(Array(response.length).fill(QuestionStatus.NotAttended));

            if (timeLimit > 0) {
              setIsTimeBound(true);
              setRemainingTime(timeLimit * 60);
            }
          }
        }

        const fetchAllCategories = await GetAllquestionsCategory();
        if (fetchAllCategories) {
          setAllCategories(fetchAllCategories);
        }
      } catch (err) {
        console.log("Failed to load questions:", err);
        toast.error("Failed to load questions. Please try again.");
      }
    };

    fetchExamQuestions();
  }, [examId, examQuestions, timeLimit]); // Only re-run when these props change

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
          navigate('/');
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5' || (e.key === 'r' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        return false;
      }
    };

    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
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
  }, [activeQuestion, questions]);

  const onClickPrevious = useCallback(() => {
    if (activeQuestion > 0) {
      const previousQuestionIndex = activeQuestion - 1;
      setActiveQuestion(previousQuestionIndex);

      setSelectedAnswerIndex(null);
    }
  }, [activeQuestion, questions]);

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
      {showInstructions && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
          <div className="p-6 w-11/12 bg-white rounded-lg shadow-lg md:w-2/3 lg:w-1/2">
            <h2 className="mb-4 text-2xl font-bold">Exam Instructions</h2>
            <div className="mb-6 text-gray-700 whitespace-pre-line">{examDescription}</div>
            <button
              onClick={() => setShowInstructions(false)}
              className="p-3 w-full font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Start Quiz
            </button>
          </div>
        </div>
      )}
      {!showInstructions && (
         <div>
          {/* Confirmation Modal */}
          {showConfirmModal && (
            <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
              <div className="p-6 w-11/12 bg-white rounded-lg shadow-lg md:w-1/2 lg:w-1/3">
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
                    className="p-2 w-full text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300"
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
          
            <div className="flex justify-between items-center px-4 py-3 bg-white border-b shadow-sm">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-800">{examName}</h1>
              {/* {allCategories && currentQuestion && (
                <span className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full">
                  Section: {
                    allCategories.find(
                      (category) => category.id === currentQuestion.questionCategoryId
                    )?.categoryName || ""
                  }
                </span>
              )} */}

            </div>
            <div className="flex items-center space-x-4">
              
              {/* Developer Options toggle button */}
              {/* <button
                onClick={handleDeveloperOptions}
                className="px-3 py-1 text-sm text-blue-600 rounded-full border border-blue-600 hover:bg-blue-100"
              >
                
                Developer Options {showDeveloperOptions ? "On" : "Off"}
              </button>  */}
              {/* If developer options are enabled, show the Auto Select All button */}
              {showDeveloperOptions && (
                <button
                  onClick={handleAutoSelectAll}
                  className="px-3 py-1 text-sm text-green-600 rounded-full border border-green-600 hover:bg-green-100"
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
              <div className="flex-1 p-6 lg:p-8">
                <div className="mx-auto max-w-2xl">
                  {/* Question Header */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-gray-700">
                        Q No: {activeQuestion + 1}/{questions.length}
                      </span>
                      <div className="ml-4 w-full max-w-xs h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-indigo-600 rounded-full transition-all duration-300"
                          style={{ width: `${((activeQuestion + 1) / questions.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Question */}
                  
                  <div className="p-8 mb-8 bg-white rounded-xl shadow-lg">
                     <h2 className="mb-8 text-xl font-medium leading-relaxed text-gray-800">
                      {questionText}
                    </h2>
                    {currentQuestion && quiz_image_mapper[currentQuestion.id] && (
                      <img
                        src={quiz_image_mapper[currentQuestion.id]}
                        alt="Question Illustration"
                        className="mx-auto mb-4 max-h-60"
                      />
                    )}
                   

                    {/* Answer Options */}
                    <div className="space-y-4">
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
                                className={`w-full p-4 rounded-lg border-2 text-left font-medium transition-all duration-200 ${isSelected
                                  ? 'text-indigo-700 bg-indigo-50 border-indigo-500'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                              >
                                <span className="inline-block mr-3 w-8 h-8 text-sm font-bold leading-8 text-center text-indigo-600 bg-indigo-100 rounded-full">
                                  {optionLetter}
                                </span>
                                {option}
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
              <div className="p-6 bg-white border-t">
                <div className="flex justify-between mx-auto max-w-2xl">
                  <button
                    onClick={onClickPrevious}
                    disabled={activeQuestion === 0}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${activeQuestion === 0 ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </button>
                  <button
                    onClick={onClickNext}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${questionStatuses[activeQuestion] === QuestionStatus.Attended
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
            <div className="hidden w-80 bg-white border-l shadow-sm lg:block">
              <div className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Question Navigator</h3>

                {/* Question Grid */}
                <div className="grid grid-cols-5 gap-2 mb-6" style={{ overflowY: 'auto', maxHeight: '400px' }}>
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
              <div className="absolute top-0 right-0 w-80 h-full bg-white shadow-xl">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
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