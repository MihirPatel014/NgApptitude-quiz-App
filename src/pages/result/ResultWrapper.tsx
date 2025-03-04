import { useLocation } from "react-router-dom";
import Result1, { ExamResultRequestModel } from "./Result1";


export const ResultWrapper: React.FC = () => {
    const location = useLocation();
    const resultProps = location.state as ExamResultRequestModel;

    return <Result1 {...resultProps} />;
};
