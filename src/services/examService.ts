import { userLoginResults, UserRegistrationResults } from "../common/constant";
import { ApiResponse, handleApiResponse } from "../common/http-common";
import http from "../common/http-common"
import { apiRequest } from "../common/requestwithdata";
import { Exams, ExamSections, ExamsListViewModel, ExamWithSectionViewModel, SubmitExam, UserExamResponse } from "../types/exam"

// api/User/Register
const EXAMS_URL = 'api/Exam';
const EXAMS_SECTIONS_URL = 'api/ExamSection';
const USER_EXAMS_RESPONSE_URL = 'api/UserExamResponse';

const GET_EXAM_BY_ID = "/GetExamById"
const GET_ALL_Exams = "/GetAllExams"
const ADD_EXAMS = "/AddExam"
const UPDATE_EXAMS = "/UpdateExam"
const DELTE_EXAMS = "/DeleteExam"
const SUBMIT_EXAM = "/SubmitExam"
const GET_EXAMS_INFO_BY_EXAMS_ID = "/GetExamInfoByExamId"
const GET_EXAMS_SECTION_BY_EXAMS_ID = "/GetExamSectionByExamId"
const GET_ALL_USERS_EXAMS_PROGRESS_BY_USER_ID = "/GetAllUserExamProgressByUserId"
const ADD_OR_UPDATE_USER_EXAM = "/AddorUpdateUserExamResponse"

export const getAllExams = async () => {
  // return http.get<Array<Exams>>(`/${EXAMS_URL}${GET_ALL_Exams}`);
  const result = await apiRequest<null, Array<Exams>>(
    `/${EXAMS_URL}${GET_ALL_Exams}`,
    "POST",
    null
  );
  if (result.success) {
    return result.data; // Return the packages data
  } else {
    console.log("Error fetching packages:", result.errors);
    return null;
  }
};
export const getExamSectionsByExamId = async (examId: number) => {
  if (examId > 0) {

    const result = await apiRequest<typeof examId, ExamSections[]>(
      `/${EXAMS_SECTIONS_URL}${GET_EXAMS_SECTION_BY_EXAMS_ID}`,
      "POST",
      examId  // Pass the packageId as part of the request body
    );

    if (result.success) {
      return result.data; // Return the package data
    } else {
      console.log("Error fetching examSections:", result.errors);
      return null;
    }
  }
};
export const getExamById = async (id: any) => {
  const result = await apiRequest<typeof id, Exams>(
    `/${EXAMS_URL}${GET_EXAM_BY_ID}`,
    "POST",
    id
  );
  if (result.success) {
    return result.data; // Return the package data
  } else {
    console.log("Error fetching examByID:", result.errors);
    return null;
  }
};

export const getAllUsersExamsProgessByUserId = async (userId: number) => {
  if (userId) {

    const result = await apiRequest<typeof userId, Array<ExamsListViewModel>>(
      `/${EXAMS_URL}${GET_ALL_USERS_EXAMS_PROGRESS_BY_USER_ID}`,
      "POST",
      userId
    );
    if (result.success) {
      return result.data; // Return the package data
    } else {
      console.log("Error fetching examByID:", result.errors);
      return null;
    }
  }
};
export const getExamInfoByExamId = async (examId: number) => {
  if (examId > 0) {

    const result = await apiRequest<typeof examId, ExamWithSectionViewModel>(
      `/${EXAMS_URL}${GET_EXAMS_INFO_BY_EXAMS_ID}`,
      "POST",
      examId  // Pass the packageId as part of the request body
    );

    if (result.success) {
      return result.data; // Return the package data
    } else {
      console.log("Error fetching examSections:", result.errors);
      return null;
    }
  }
};

export const create = (data: Exams) => {
  return http.post<Exams>(`/${EXAMS_URL}`, data);
};

export const update = (id: any, data: Exams) => {
  return http.put<any>(`/${EXAMS_URL}/${id}`, data);
};

export const remove = (id: any) => {
  return http.delete<any>(`/${EXAMS_URL}/${id}`);
};

export const removeAll = () => {
  return http.delete<any>(`/${EXAMS_URL}`);
};
export const SubmitUserExam = async (data: SubmitExam) => {
  const result = await apiRequest<SubmitExam, SubmitExam>(
    `/${EXAMS_URL}${SUBMIT_EXAM}`,
    "POST",
    data
  );
  if (result.success) {
    return result.data; // Return the package data
  } else {
    console.log("Error fetching examByID:", result.errors);
    return null;
  }
};

export const AddUpdateUserExam = async (data: UserExamResponse) => {
  const result = await apiRequest<UserExamResponse, UserExamResponse>(
    `/${USER_EXAMS_RESPONSE_URL}${ADD_OR_UPDATE_USER_EXAM}`,
    "POST",
    data
  );
  if (result.success) {
    return result.data; // Return the package data
  } else {
    console.log("Error fetching examByID:", result.errors);
    return null;
  }
};