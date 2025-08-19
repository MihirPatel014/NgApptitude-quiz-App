import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GetAllquestionsCategory,
  getQuestionbyExamAndSectionId,
} from '../../services/questionService';
import { Question, QuestionCategory } from '../../types/question';
import { FaCircle } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { QuizAnswerModel, SubmitExam, UserExamResponse } from '../../types/exam';
import { AddUpdateUserExam, SubmitUserExam } from '../../services/examService';
import { QuestionSumitStatus } from '../../common/constant';
import toast, { Toaster } from 'react-hot-toast';

import { useLoader } from '../../provider/LoaderProvider';

const QuestionStatus = {
  NotAttended: 0,
  Skipped: 1,
  Attended: 2,
} as const;

type QuestionStatusType = typeof QuestionStatus[keyof typeof QuestionStatus];

const updateImage = (questions: Question[], index: number, setCurrentImage: React.Dispatch<React.SetStateAction<string | null>>) => {
  setCurrentImage('');
  let currentImage = questions[index]?.image || null;
  let newImage =
    currentImage === 'https://images.pexels.com/photos/443446/pexels-photo-443446.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
      ? 'https://random-image-pepebigotes.vercel.app/api/random-image'
      : 'https://images.pexels.com/photos/443446/pexels-photo-443446.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';

  setCurrentImage(newImage);
};

export interface QuizProps {
  userId: number;
  examId: number;
  examName: string;
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
  timeLimit,
  userExamProgressId,
  userPackageId,
  packageId,
  examQuestions
}) => {
  const navigate = useNavigate();
  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<QuizAnswerModel[]>([]);

  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isTimeBound, setIsTimeBound] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [startTime] = useState<string>(new Date().toISOString());
  const [allCategories, setAllCategories] = useState<QuestionCategory[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatusType[]>([]);
  const { setLoading } = useLoader();
  // New state for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Use refs to store the timers so that we can clear them when needed
  const remainingTimeTimer = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimeTimer = useRef<NodeJS.Timeout | null>(null);

  const [userExamResponse, setUserExamResponse] = useState<UserExamResponse>({
    id: 0,
    userExamProgressId: userExamProgressId,
    userId: Number(userId),
    examId: Number(examId),
    sectionId: 0,
    responseData: ''
  });

  const handleQuizSubmit = async () => {
    stopTimers();
    setLoading(true); // Show loader
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

    } finally {
      setLoading(false); // Hide loader
    }
  };

  useEffect(() => {
    setQuestionStartTime(Date.now()); // Reset time when question changes
  }, [activeQuestion]);

  const calculateScore = (): number => {
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
  };

  // Prevent navigation/refresh when quiz is in progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (true) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (true) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.pathname);
        const confirmExit = window.confirm(
          'Are you sure you want to leave? Your progress will be lost!'
        );
        if (!confirmExit) {
          window.history.pushState(null, '', window.location.pathname);
        } else {
          navigate('/quizpage');
        }
      }
    };

    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  // Prevent refresh shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {

      // Prevent F5 key
      if (e.key === 'F5') {
        e.preventDefault();
        return false;
      }
      // Prevent Ctrl+R
      if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        return false;
      }

    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch exam questions
  useEffect(() => {
    fetchExamQuestions();
  }, [examId]);

  const fetchExamQuestions = async () => {
    try {
      if (examQuestions && examQuestions.length > 0) {
        setQuestions(examQuestions);
        updateImage(examQuestions, 0, setCurrentImage);

        // Initialize questionStatuses
        setQuestionStatuses(Array(examQuestions.length).fill(QuestionStatus.NotAttended));

        if (timeLimit > 0) {
          setIsTimeBound(true);
          setRemainingTime(timeLimit * 60);
        }

        const fetchAllCategories = await GetAllquestionsCategory();
        if (fetchAllCategories) {
          setAllCategories(fetchAllCategories);
        }
      } else {
        // Fallback to API call if no questions provided
        const response = await getQuestionbyExamAndSectionId(examId, 0);
        if (response) {
          setQuestions(response);
          updateImage(response, 0, setCurrentImage);
          setQuestionStatuses(Array(response.length).fill(QuestionStatus.NotAttended));

          if (timeLimit > 0) {
            setIsTimeBound(true);
            setRemainingTime(timeLimit * 60);
          }

          const fetchAllCategories = await GetAllquestionsCategory();
          if (fetchAllCategories) {
            setAllCategories(fetchAllCategories);
          }
        }
      }
    } catch (err) {
      console.log("Failed to load questions:", err);
      toast.error("Failed to load questions. Please try again.");
    }
  };

  // Timer for remaining time
  useEffect(() => {
    if (isTimeBound && remainingTime !== null) {
      remainingTimeTimer.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev !== null && prev > 0) {
            return prev - 1;
          } else {
            clearInterval(remainingTimeTimer.current!); // Clear the timer when time is up

            handleQuizSubmit();

            return prev;
          }
        });
      }, 1000);

      return () => {
        if (remainingTimeTimer.current) {
          clearInterval(remainingTimeTimer.current);
        }
      };
    }
  }, [isTimeBound, remainingTime]);

  // Timer for elapsed time
  useEffect(() => {
    elapsedTimeTimer.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (elapsedTimeTimer.current) {
        clearInterval(elapsedTimeTimer.current);
      }
    };
  }, []);

  // Function to stop the timers on exam submission
  const stopTimers = () => {
    if (remainingTimeTimer.current) {
      clearInterval(remainingTimeTimer.current);
    }
    if (elapsedTimeTimer.current) {
      clearInterval(elapsedTimeTimer.current);
    }
  };

  const onAnswerSelected = async (studentAnswer: string, index: number) => {
    setSelectedAnswerIndex(index);

    // Calculate time taken for this question
    const timeTakenInSeconds = Math.floor((Date.now() - questionStartTime) / 1000);

    // Create new answer model with time taken
    const currentQuestion = questions[activeQuestion];
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
        // Update existing answer
        const updatedAnswers = [...prevAnswers];
        updatedAnswers[existingAnswerIndex] = newAnswer;
        return updatedAnswers;
      } else {
        // Add new answer
        return [...prevAnswers, newAnswer];
      }
    });

    // Update question status to attended
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
      // Call API to add/update response
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
  };

  const onClickNext = () => {
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
        updateImage(questions, nextQuestionIndex, setCurrentImage);
        setSelectedAnswerIndex(null);
      } else {
        // If we're on the last question and it's answered, show confirmation modal
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
        updateImage(questions, nextQuestionIndex, setCurrentImage);
        setSelectedAnswerIndex(null);
      } else {
        toast('Please select an answer before proceeding');
      }
    }

    // Reset the timer for the next question
    setQuestionStartTime(Date.now());
  };

  // Function to check if all questions are answered
  const areAllQuestionsAnswered = () => {
    return !questionStatuses.includes(QuestionStatus.NotAttended) &&
      !questionStatuses.includes(QuestionStatus.Skipped);
  };

  // Function to handle end quiz button click
  const handleEndQuizClick = () => {
    // If time-bound quiz, show confirmation modal
    if (isTimeBound) {
      setShowConfirmModal(true);
    } else {
      // If not time-bound, check if all questions are answered
      if (areAllQuestionsAnswered()) {
        setShowConfirmModal(true);
      } else {
        toast.error('Please answer all questions before submitting the quiz');
      }
    }
  };

  const getSelectedAnswerForQuestion = (questionId: number) => {
    // Check local state first
    const localAnswer = selectedAnswer.find(
      answer => answer.questionId === questionId
    );
    if (localAnswer) return localAnswer.SelectedOption;

    // Fall back to API response data
    const responseData: QuizAnswerModel[] = userExamResponse.responseData
      ? JSON.parse(userExamResponse.responseData)
      : [];
    const apiAnswer = responseData.find(response => response.questionId === questionId);
    return apiAnswer ? apiAnswer.SelectedOption : null;
  };

  const jumpToQuestion = (index: number) => {
    // Mark the current question as skipped if it hasn't been attended
    setQuestionStatuses(prevStatuses => {
      const newStatuses = [...prevStatuses];
      if (prevStatuses[activeQuestion] === QuestionStatus.NotAttended) {
        newStatuses[activeQuestion] = QuestionStatus.Skipped;
      }
      return newStatuses;
    });

    setActiveQuestion(index);
    updateImage(questions, index, setCurrentImage);
    setSelectedAnswerIndex(null);
  };

  const onClickPrevious = () => {
    if (activeQuestion > 0) {
      const previousQuestionIndex = activeQuestion - 1;
      setActiveQuestion(previousQuestionIndex);
      updateImage(questions, previousQuestionIndex, setCurrentImage);
      setSelectedAnswerIndex(null);
    }
  };

  const addLeadingZero = (number: number): string =>
    number > 9 ? number.toString() : `0${number}`;

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${addLeadingZero(minutes)}:${addLeadingZero(seconds)}`;
  };
  const [showMobileNav, setShowMobileNav] = useState(false);
  const { questionText, optionA, optionB, optionC, optionD, questionType } = questions[activeQuestion] || {};

  // Get stats for confirmation modal
  const answeredCount = questionStatuses.filter(status => status === QuestionStatus.Attended).length;
  const skippedCount = questionStatuses.filter(status => status === QuestionStatus.Skipped).length;
  const notAnsweredCount = questionStatuses.filter(status => status === QuestionStatus.NotAttended).length;

  const showQuizResult = () => {
    navigate('/quizresult', {
      state: {
        examId: examId,
        userId: userId,
        userExamProgressId: userExamProgressId,
        userPackageId:userPackageId,
        examName: examName,
        answered: questionStatuses.filter(status => status === QuestionStatus.Attended).length,
        notAnswered: questionStatuses.filter(status => status === QuestionStatus.NotAttended).length,
        skipped: questionStatuses.filter(status => status === QuestionStatus.Skipped).length,
        totalQuestions: questions.length,
        timeTaken: elapsedTime,
      },
    });
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <Toaster />
      {
        <div>
          {/* Confirmation Modal */}
          {showConfirmModal && (
            <div className="flex fixed inset-0 z-50 justify-center items-center bg-black bg-opacity-50">
              <div className="p-6 w-11/12 bg-white rounded-lg shadow-lg md:w-1/2 lg:w-1/3">
                <h2 className="mb-4 text-xl font-bold">Confirm Submission</h2>
                <p className="mb-4">Are you sure you want to end the quiz?</p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="px-4 py-2 text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      handleQuizSubmit();
                    }}
                    className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
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
              {allCategories && (
                <span className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full">
                  Section: {
                    allCategories.find(
                      (category) =>
                        category.id === questions[activeQuestion]?.questionCategoryId
                    )?.categoryName || ""
                  }
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
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

                    {/* Answer Options */}
                    <div className="space-y-4">
                      {questions && questions.length > 0 ? (
                        [optionA, optionB, optionC, optionD]
                          .slice(0, questionType === 1 ? 2 : 4)
                          .map((option, index) => {
                            const optionLetter = String.fromCharCode(65 + index);
                            const isSelected = selectedAnswerIndex === index ||
                              getSelectedAnswerForQuestion(questions[activeQuestion].id) === optionLetter;

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
                  className="px-4 py-3 mt-8 w-full font-medium text-white bg-red-500 rounded-lg transition-colors duration-200 hover:bg-red-600"
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
                    className="px-4 py-3 w-full font-medium text-white bg-red-500 rounded-lg transition-colors duration-200 hover:bg-red-600"
                  >
                    End Quiz
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      }
    </div>
  );
};

export default Quiz;