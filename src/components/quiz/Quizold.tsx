import React, { useState, useEffect, useRef } from 'react';
import {  useNavigate } from 'react-router-dom';
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
import QuizResult from './QuizResutlPage';
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
  const [showResult, setShowResult] = useState<boolean>(false);
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
      setShowResult(true);
    } catch (error) {
      console.log('Failed to submit exam:', error);
      toast.error('Failed to submit exam. Please try again.');
      setShowResult(true);
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
      if (!showResult) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (!showResult) {
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
  }, [showResult, navigate]);

  // Prevent refresh shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showResult) {
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResult]);

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
            setShowResult(true);
            handleQuizSubmit(); // Assuming this is your submission handler
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

  const { questionText, optionA, optionB, optionC, optionD, questionType } = questions[activeQuestion] || {};

  // Get stats for confirmation modal
  const answeredCount = questionStatuses.filter(status => status === QuestionStatus.Attended).length;
  const skippedCount = questionStatuses.filter(status => status === QuestionStatus.Skipped).length;
  const notAnsweredCount = questionStatuses.filter(status => status === QuestionStatus.NotAttended).length;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-2 mx-auto bg-gray-100 md:p-4 ">
      <Toaster />
      {!showResult ? (
        <div >
          {/* Confirmation Modal  */}
                {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="w-11/12 p-6 bg-white rounded-lg shadow-lg md:w-1/2 lg:w-1/3">
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

          <div className="flex flex-col w-4/5 gap-4 lg:flex-row">
            {/* Main Quiz Container */}
            <div className="flex flex-col items-center p-3 bg-white border border-gray-200 rounded-lg shadow md:p-6 bg-custom-gradient lg:w-9/12">
            {/* Timer (Absolute Positioning) */}
                <div className="flex flex-col ml-auto right-4">
                  {/* Increased gap to give more space */}
                  {/* Elapsed Time */}
                  <div className="items-center ">
                    <span className="font-medium text-gray-600">Elapsed Time : </span>
                    <span className="font-medium text-gray-600">
                      {formatTime(elapsedTime)}
                    </span>
                  </div>

                  {/* Total Time - Only Show if Time Bound */}
                  {isTimeBound && (
                    <div className="items-center">
                      <span className="font-medium text-gray-600">Total Time : </span>
                      <span className="font-medium text-gray-600">
                        {timeLimit > 0 ? `${timeLimit} minutes` : "Unlimited"}
                      </span>
                    </div>
                  )}
                </div>
              <div className="flex items-center justify-center w-full p-4 mb-4 max-w-7xl">
                {/* Exam Name & Section Name (Centered) */}
                <div className="flex flex-col items-center w-full">
                  <h1 className="text-2xl font-semibold text-center">{examName}</h1>
                  {allCategories && (
                    <h1 className="text-lg font-medium text-center text-gray-700">
                      Section:{" "}
                      {
                        allCategories.find(
                          (category) =>
                            category.id === questions[activeQuestion]?.questionCategoryId
                        )?.categoryName || ""
                      }
                    </h1>
                  )}
                </div>


              </div>

                


              {/* Question Section - Centered */}
              <div className='flex flex-col items-center px-5 '>
                {/* Question Text */}
                <h1 className="mb-4 text-base font-medium text-gray-800 md:text-lg ">
                  Q No: {activeQuestion + 1}/{questions.length}
                </h1>
                <h1 className="mb-4 text-base font-medium text-gray-800 md:text-lg ">
                  {questionText}
                </h1>

                {/* Question Image */}
                {/* {currentImage && (
                  <img
                    src={currentImage || ""}
                    alt="Question Visual"
                    className="w-full mb-4 mr-2 rounded-lg md:w-2/5"
                  />
                )} */}
              </div>

              {/* Options Grid */}
              <ul className="grid w-full grid-cols-1 gap-3 px-2 md:grid-cols-2 md:gap-4 md:px-5">
                {questions && questions.length > 0 ? (
                  [optionA, optionB, optionC, optionD]
                    .slice(0, questionType === 1 ? 2 : 4)
                    .map((option, index) => {
                      const optionLetter = String.fromCharCode(65 + index);
                      const isSelected = selectedAnswerIndex === index ||
                        getSelectedAnswerForQuestion(questions[activeQuestion].id) === optionLetter;

                      return (
                        <li
                          key={index}
                          onClick={() => onAnswerSelected(optionLetter, index)}
                          className={`p-3 border rounded-md cursor-pointer w-full text-sm md:text-base
                ${isSelected ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}
                        >
                          {optionLetter}. {option}
                        </li>
                      );
                    })
                ) : (
                  <p>No questions available</p>
                )}
              </ul>

              {/* Navigation Buttons */}
              <div className="grid w-full grid-cols-2 gap-4 px-2 mt-6 md:gap-10 md:px-6 md:mt-9">
                <button
                  onClick={onClickPrevious}
                  disabled={activeQuestion === 0}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md md:px-6 md:text-base 
                  ${activeQuestion === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-yellow-400 hover:bg-gray-400'}`}
                >
                  Previous
                </button>
                <button
                  onClick={onClickNext}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-md md:px-6 md:text-base ${
                    questionStatuses[activeQuestion] === QuestionStatus.Attended
                      ? 'bg-green-500 hover:green-600'
                      : 'bg-secondary-light hover:bg-gray-400'
                  }`}
                >
                  {activeQuestion === questions.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </div>

            {/* Question Navigator */}
            <div className="p-3 mt-4 bg-white border border-gray-200 rounded-lg shadow lg:w-2/12 md:p-4 lg:mt-0">
              <h3 className="mb-3 text-base font-medium text-gray-800 md:text-lg">Question Navigator</h3>
              <div className="grid grid-cols-5 gap-2 lg:grid-cols-3" style={{ overflowY: 'auto', maxHeight: '200px md:300px' }}>
                {questions.map((_, index) => {
                  let bgColorClass = 'bg-gray-300';
                  if (questionStatuses[index] === QuestionStatus.Skipped) {
                    bgColorClass = 'bg-yellow-300';
                  } else if (questionStatuses[index] === QuestionStatus.Attended) {
                    bgColorClass = 'bg-green-400';
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => jumpToQuestion(index)}
                      className={`px-2 md:px-3 py-1 md:py-2 text-xs font-medium text-center ${bgColorClass}`}
                      style={{ minWidth: '25px', minHeight: '25px' }}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex mt-4">
                <div className="grid grid-cols-2 gap-2 text-xs md:flex md:flex-col md:text-sm">
                  <h1 className="flex items-center">
                    <FaCircle className="mr-2 text-green-400" /> Answered
                  </h1>
                  <h1 className="flex items-center">
                    <FaCircle className="mr-2 text-yellow-400" /> Skipped
                  </h1>
                  <h1 className="flex items-center">
                    <FaCircle className="mr-2 text-gray-300" /> Not Attended
                  </h1>
                </div>
              </div>

              {/* End Quiz Button */}
              <button
                onClick={handleEndQuizClick}
                className="w-full px-4 py-2 mt-4 text-white bg-red-500 rounded-md hover:bg-red-600"
              >
                End Quiz
              </button>
            </div>
          </div>
        </div>
      ) : (
        <QuizResult
          examName={examName}         
          answered={questionStatuses.filter(status => status === QuestionStatus.Attended).length}
          notAnswered={questionStatuses.filter(status => status === QuestionStatus.NotAttended).length}
          skipped={questionStatuses.filter(status => status === QuestionStatus.Skipped).length}
          totalQuestions={questions.length}
          timeTaken={elapsedTime}
          onReturnToQuizPage={() => navigate('/quizPage')}
          
        />
      )}
    </div>
  );
};

export default Quiz;