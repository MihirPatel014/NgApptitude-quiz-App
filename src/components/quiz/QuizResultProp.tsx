import { useLocation, Navigate } from "react-router-dom";


import QuizResultPage ,{QuizResultProps}from "./QuizResutlPage";


export const QuizResultProp: React.FC = () => {
    const location = useLocation();
    const quizResultProps = location.state as QuizResultProps;
    console.log("QuizResult Props from the Wrapper:", quizResultProps);
    // If no state is provided or it's missing required properties, redirect to QuizPage
    if (!quizResultProps  || !quizResultProps.userId) {
        console.log("Invalid quiz access attempt. Missing required quiz parameters.");
        return <Navigate to="/" />;
    }

    return <QuizResultPage {...quizResultProps} />;
};

export default QuizResultProp;