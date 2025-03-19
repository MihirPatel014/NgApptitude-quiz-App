import { ExamInfoModel, Exams, ExamSections, ExamsPackageModel } from "./exam";

export interface Packages {
  id: number;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  // Add any other user-specific fields here
}

export interface PackagesInfo {
  packages: Packages;
  exams: ExamsPackageModel[];
  sections: ExamSections[];
}

export interface UserPackagesModel {
  id: number;
  name: string;
  description: string;
  price: number;
  exams: ExamInfoModel[]
}

export interface UserPackageDetailsViewModel {
  userId: number,
  userpackageId: number,
  packageId: number,
  packageName: string,
  isCompleted: boolean,
  totalExams: number,
  totalExamsCompleted: number,
  totalExamsStarted: number,
  totalExamsPending: number,
  completionDate: Date,
  startedDate: Date,
  packagePrice: number,
  completionPercentage: number,
  status: string,
  examProgressId: number
}

export enum GiftCodeValidationStatus {
  Valid = 0,
  NotFound = 1,
  Expired = 2,
  Inactive = 3,
  Deleted = 4,
  Invalid = 5
}

export interface GiftCodeResponseModel {
  giftCodeId: number,
  discountedValue: number,
  giftCodeStatus: GiftCodeValidationStatus,
  originalPrice: number,
}