import React from "react";
import { useLocation, Navigate } from "react-router-dom";
import QuizResultPage, { QuizResultProps } from "./QuizResutlPage";
import { ROUTES } from "../../common/constant";

export const QuizResultProp: React.FC = () => {
  const location = useLocation();
  const quizResultProps = location.state as QuizResultProps | undefined;

  // Log the received props for debugging
  console.log("QuizResult Props from the Wrapper:", quizResultProps);

  // Validate that required data exists before rendering
  const isValidProps =
    quizResultProps &&
    typeof quizResultProps.userId === "number" &&
    typeof quizResultProps.examName === "string";

  if (!isValidProps) {
    console.warn("Invalid quiz result access attempt — redirecting to home.");
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // Pass all props to QuizResultPage
  return <QuizResultPage {...quizResultProps} />;
};

export default QuizResultProp;
