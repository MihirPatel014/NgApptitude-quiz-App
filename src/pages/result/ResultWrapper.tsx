import { useLocation } from "react-router-dom";
import Result, { ExamResultRequestModel } from "./Result";


export const ResultWrapper: React.FC = () => {
    const location = useLocation();
    const resultProps = location.state as ExamResultRequestModel;

    return <Result {...resultProps} />;
};
