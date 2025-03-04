import { useLocation } from "react-router-dom";
import Quiz, { QuizProps } from "./Quiz";


export const QuizWrapper: React.FC = () => {
    const location = useLocation();
    const quizProps = location.state as QuizProps;

    return <Quiz {...quizProps} />;
};
