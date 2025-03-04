import { Question } from "./question";
import { ExamResultApiModel } from "./result";

export interface Exams {
  examId: number
  examName: string;
  examDescription: string;
}
export interface ExamInfoModel {
  id: number,
  Name: string,
  Description: string,
  isTimeBound: boolean,
  timeLimit: number
  resultType: number
  sections: ExamSections[]
}
export interface ExamSections {
  id: number,
  examId: number,
  sectionName: string,
  description:string,
  noOfQuestion: number,
  questionIds:string,
  questions:Question[]
}


export interface ExamsPackageModel {
  id: number
  name: string;
  description: string;
}

export interface ExamsListViewModel {
  id: number,
  userId: number,
  packageId: number,
  userPackageId: number,
  examId: number,
  sectionId: number,
  isCompleted: boolean,
  score: number,
  startedAtUtc: Date,
  completedAtUtc: Date,
  status: number
}

export interface ExamWithSectionViewModel {
  id: number;
  name: string;
  description: string;
  timeLimit: number;
  isTimeBound: boolean;
  resultType: number
  sections: ExamSections[];
}

export interface SubmitExam {
  id: number,
  userId: number,
  packageId: number,
  userPackageId: number,
  examId: number,
  
  isCompleted: boolean,
  score: number,
  startedAtUtc: string,
  completedAtUtc: string,
  responseData: string,
  status: number
}
export interface UserExamResponse {
  id: number,
  userExamProgressId: number,
  userId: number,
  examId: number,
  sectionId: number,
  responseData: string,
}

export interface QuizAnswerModel {
  questionId: number;
  SelectedOption: string;
  timeTakenInSeconds: number;
}

export interface ExamDetail {
  examId: number
  examName: string;
  examDate:Date;
  isCompleted: boolean,
  timeLimit: number;
  isTimeBound: boolean;
  resultType: number,
  resultTypeName:string;
  status:string;
  examProgressId:number,
  result:ExamResultApiModel
}