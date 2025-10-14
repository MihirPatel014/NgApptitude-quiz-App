import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import Quiz, { QuizProps } from "./Quiz";

export const QuizWrapper: React.FC = () => {
  const location = useLocation();
  const quizProps = location.state as QuizProps | undefined;

  console.log("Quiz Props from the Wrapper:", quizProps);

  const isValidProps =
    quizProps &&
    typeof quizProps.examId === "number" &&
    typeof quizProps.userId === "number";

  if (!isValidProps) {
    console.warn("Invalid quiz access attempt — redirecting to home.");
    return <Navigate to="/" replace />;
  }

  return <Quiz {...quizProps} />;
};

export default QuizWrapper;
