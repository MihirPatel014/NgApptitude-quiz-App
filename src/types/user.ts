// src/types.ts

import { ExamDetail } from "./exam";
import { UserPackageDetailsViewModel } from "./package";
import { TranscationDetail } from "./payment";

// Define the user interface
export interface User {
  loginResult: string;
  email: string;
  apiToken: string;
  userId: number;
  userGuidId: string;
  // Add any other user-specific fields here
}
export interface userDetails {
  email: string;
  apiToken: string;
}
export interface UserLogin {
  email: string;
  password: string
}


export interface UserRegistration {
  name: string,
  dateOfBirth: Date,
  class: string,
  medium: string,
  email: string,
  contactNo: string,
  city: string,
  state: string,
  password: string,
  confirmPassword: string,
  institute: string,
  hobbies: string;
  expectationFromThisTest: string;
  dreamCareerOptions: string;
}


export interface UserProfileUpdate {
  id: number;
  userName: string;
  fullName: string;
  name: string,
  dateOfBirth: Date,
  class: string,
  medium: string,
  institute: string,
  email: string,
  contactNo: string,
  city: string,
  state: string,
  hobbies: string;
  expectationFromThisTest: string;
  dreamCareerOptions: string;
}

export interface UserPackage {
  userPackageStatusId: number,
  id: number,
  userId: number,
  packageId: number,
  userPaymentTransactionId: number,
  isCompleted: boolean,
  completedAtUtc: string,
  createdAtUtc: string,
  updatedAtUtc: string
}
export interface AddUserToPackageApiModel {
  UserId: number,
  TransactionId: number,
  PackageId: number,
}

export interface UserInfoModel {
  userExamDetails: UserExamDetailsViewModel,
  userPackageDetails: UserPackageDetailsViewModel[],
  userTranscationDetails: TranscationDetail[]
}
export interface UserExamDetailsViewModel {
  userExams: ExamDetail[];
  pendingExams: ExamDetail[];
  completedExams: ExamDetail[];
  currentExamDetail: ExamDetail;
}
export interface UserPackageInfoModel {
  id: number,
  userId: number;
  userPackageId: number;
  exams: UserExamInfoModel[];
  packageId: number;
  packageName: string;
  isCompleted: boolean;
  totalExams: number;
  totalExamsCompleted: number;
  totalExamsStarted: number;
  totalExamsPending: number;
  completionDate?: Date;
  startedDate?: Date;
  packagePrice: number;
  completionPercentage: number;
  status: string;
}

export interface UserExamInfoModel {
  examId: number;
  examName: string;
  examProgressId: number;
  completedOn?: number;
  examDescription:string;
  isCompleted: boolean;
  isTimeBound: boolean;
  timeLimit: number;
  resultType: number;
  resultTypeName: string;
  status: string;
}
