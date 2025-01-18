import React from "react";
import { useNavigate } from "react-router-dom";
import { quiz } from "../../services/questions";
import { User } from "../../types/user";


interface QuizPageProps {
  user: User;  // Define prop type using the imported User interface
}
const QuizPage: React.FC<QuizPageProps> = ({ user }) => {
  const navigate = useNavigate();

  const handleQuizClick = () => {

    navigate("/quiz");
  };
  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow md:w-1/4 dark:bg-gray-800 dark:border-gray-700">
        <h2 id="quizp">Welcome, {user?.email} </h2>
        <h3>Available Quizzes</h3>
        <ul>
          {/* Render the single quiz from the quiz object */}
          <li key={quiz.topic}>
            <h4>{quiz.topic} - {quiz.level}</h4>
            <p>Total Questions: {quiz.totalQuestions}</p>
            <p>Score per Question: {quiz.perQuestionScore}</p>

            <button onClick={handleQuizClick}>Start Quiz</button>
            {/* <button onClick={() => navigate("/quiz")}>Start Quiz</button> */}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default QuizPage;
