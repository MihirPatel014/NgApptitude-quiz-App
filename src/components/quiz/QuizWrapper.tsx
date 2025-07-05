import { useLocation, Navigate } from "react-router-dom";
import Quiz, { QuizProps } from "./Quiz";


export const QuizWrapper: React.FC = () => {
    const location = useLocation();
    const quizProps = location.state as QuizProps;
    console.log("Quiz Props from the Wrapper:", quizProps);
    // If no state is provided or it's missing required properties, redirect to QuizPage
    if (!quizProps || !quizProps.examId || !quizProps.userId) {
        console.log("Invalid quiz access attempt. Missing required quiz parameters.");
        return <Navigate to="/quizpage" replace />;
    }

    return <Quiz {...quizProps} />;
};

export default QuizWrapper;