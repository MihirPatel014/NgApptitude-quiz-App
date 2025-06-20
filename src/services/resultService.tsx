import axios from "axios";
import { apiRequest } from "../common/requestwithdata";
import { PaymentModel, MerchantOrderDetails } from "../types/payment";
import { ExamResultApiModel, FinalResultViewModel } from "../types/result";
const API_URL = process.env.REACT_APP_API_URL;


// api/User/Register
const PROCESS_REQUEST_ORDER = 'process-request-order';
const COMPLETE_REQUEST_ORDER = 'complete-order-process';

const RESULT_ROUTE = "api/ExamResult";
const STUDENT_RESULT_BY_EXAM_PROGRESS_ID = '/GetExamResultByExamProgressId';
const STUDENT_RESULTBYEXAM_PROGRESSID = '/GetExamResult_ByExmProgessId';

export const GetExamResultByExamProgressId = async (ExamProgressId: number) => {

    const result = await apiRequest<typeof ExamProgressId, ExamResultApiModel>(
        `/${RESULT_ROUTE}${STUDENT_RESULT_BY_EXAM_PROGRESS_ID}`,
        "POST",
        ExamProgressId
    );
    if (result.success) {
        return result.data; // Return the packages data
    } else {
        console.log("Error Submit  questions:", result.errors);
        return null;
    }
}
export const GetExamResult_ByExamProgressId = async (ExamProgressId: number) => {

    const result = await apiRequest<typeof ExamProgressId, FinalResultViewModel>(
        `/${RESULT_ROUTE}${STUDENT_RESULTBYEXAM_PROGRESSID}`,
        "POST",
        ExamProgressId
    );
    if (result.success) {
        return result.data; // Return the packages data
    } else {
        console.log("Error Submit  questions:", result.errors);
        return null;
    }
}

