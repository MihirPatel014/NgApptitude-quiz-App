import axios from "axios";
import { apiRequest } from "../common/requestwithdata";
import { PaymentModel, MerchantOrderDetails } from "../types/payment";
import { ExamResultApiModel } from "../types/result";


// api/User/Register
const PROCESS_REQUEST_ORDER = 'process-request-order';
const COMPLETE_REQUEST_ORDER = 'complete-order-process';
// const API_URL = "https://localhost:44389/";
const API_URL = "https://apingapptitude-001-site1.anytempurl.com/";

const RESULT_ROUTE = "api/ExamResult";
const STUDENT_RESULT_BY_EXAM_PROGRESS_ID = '/GetExamResultByExamProgressId';

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

