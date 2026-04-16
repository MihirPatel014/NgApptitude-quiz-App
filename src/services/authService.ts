import axios from "axios";
import { ApiResponse, handleApiResponse } from "../common/http-common";
import http from "../common/http-common"
import { apiRequest } from "../common/requestwithdata";
import { AddUserToPackageApiModel, User, UserInfoModel, UserLoginResultModel, UserPackage, UserPackageInfoModel, UserProfileUpdate, UserRegistration } from "../types/user"
import { Grade } from "../types/grade";

// api/User/Register
const USERS_URL = 'api/User';

const LOGIN_URL = "/Login"
const LOGIN_WITH_MOBILE_URL = "/LoginWithMobile";
const REGISTER_URL = "/Register"

const GENERATE_OTP_URL = "/generate_otp";
const VERIFY_OTP_URL = "/otp_verification";
const GET_USER_DETAILS = "/GetUserDetails"
const Update_USER_DETAILS = "/UpdateUserDetails"
const ADD_USER_TO_PACKAGE = "/AddUserToPackage"
const GET_USER_FULL_INFO_BY_USERID = "/GetUserFullInfoByUserId"
const GET_USER_PACKAGE_INFO_BY_USERID = "/GetUserPackageInfoByUserId"
const CHECK_EMAIL = "/check_email"

const API_URL = process.env.REACT_APP_API_URL;
const GRADE_URL = "api/Grade/GetAllGrades";

export const checkEmail = async (email: string) => {
  try {
    const response = await http.get<ApiResponse<boolean>>(
      `${USERS_URL}${CHECK_EMAIL}`,
      { params: { email } }
    );
    return response.data;
  } catch (error) {
    console.error("Error checking email:", error);
    throw error;
  }
};

export const loginUser = async (data: any) => {
  const response = await http.post<ApiResponse<User>>(`${USERS_URL}${LOGIN_URL}`, data);
  const result = handleApiResponse(response.data);

  if (result.success) {
    return result.data;

  } else {
    return result.data;
  }

};

export const registerUser = async (data: UserRegistration) => {

  const response = await http.post<ApiResponse<UserLoginResultModel>>(
    `${USERS_URL}${REGISTER_URL}`,
    data
  );

  const result = handleApiResponse(response.data);
  if (result.success) {

    return result.data;
  } else {
    // Handle API-level errors
    console.log("Registration failed with errors:", result.errors);
    return null;
  }
};


export const generateOTPSms = async (mobile: string) => {
  try {
    const requestPayload = {
      AccessKey: "8525", 
      Data: { Mobile: mobile },
    };

    const response = await http.post<ApiResponse<any>>(
      `${USERS_URL}${GENERATE_OTP_URL}`,
      requestPayload
    );

    const result = handleApiResponse(response.data);
    if (result.success) return result.data;
  } catch (error) {
    console.error("Error generating OTP:", error);
    throw error;
  }
};

// Verify OTP
export const verifyOTPSms = async (mobile: string, otp: string, hashValue?: string) => {
  try {
    const requestPayload = {
      AccessKey: "8525",
      Data: {
        Mobile: mobile,
        OTP: otp,
        Hashvalue: hashValue || "",
      },
    };

    const response = await http.post<ApiResponse<any>>(
      `${USERS_URL}${VERIFY_OTP_URL}`,
      requestPayload
    );

    const result = handleApiResponse(response.data);
    if (result.success) return result.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

export const loginWithMobile = async (
  mobile: string,
  otp: string,
  hashValue: string
): Promise<User | null> => {
  try {
    const requestPayload = {
      Mobile: mobile,      
      OTP: otp,            
      Hashvalue: hashValue
    };

    const response = await http.post<ApiResponse<User>>(
      `${USERS_URL}${LOGIN_WITH_MOBILE_URL}`,
      requestPayload
    );

    const result = handleApiResponse(response.data);
    if (result.success) {
      return result.data ?? null;
    } else {
      console.warn("Login with mobile failed:", result.errors);
      return null;
    }
  } catch (error) {
    console.error("Error during mobile login:", error);
    throw error;
  }
};


export const getUserDetails = async () => {
  const result = await apiRequest<true, UserProfileUpdate>(
    `/${USERS_URL}${GET_USER_DETAILS}`,
    "POST",
    true
  );
  if (result.success) {
    return result.data; // Return the package data
  } else {
    console.log("Error fetching examByID:", result.errors);
    return null;
  }
};
export const UpdateUserDetails = async (data: UserProfileUpdate) => {
  const result = await apiRequest<typeof data, UserProfileUpdate>(
    `/${USERS_URL}${Update_USER_DETAILS}`,
    "POST",
    data
  );
  if (result.success) {
     return true; 
  } else {
    console.log("Error fetching examByID:", result.errors);
    return false;
  }
};
export const AddUserToPackage = async (data: AddUserToPackageApiModel) => {
  if (data) {

    const result = await apiRequest<typeof data, UserPackage>(
      `/${USERS_URL}${ADD_USER_TO_PACKAGE}`,
      "POST",
      data
    );
    if (result.success) {
      return result.data; // Return the package data
    } else {
      console.log("Error fetching examByID:", result.errors);
      return null;
    }
  }
};

export const pincodeApi = async (pincode: number) => {
  const PINCODE_API_URL = `https://api.postalpincode.in/pincode/${pincode}`;
  try {
    const response = await axios.get(PINCODE_API_URL);
    return response.data;
  } catch (error) {
    console.log('Error fetching pincode data:', error);
    throw error;
  }
};

export const GetUserFullInfoByUserId = async (userId: number) => {
  if (userId > 0) {

    const result = await apiRequest<typeof userId, UserInfoModel>(
      `/${USERS_URL}${GET_USER_FULL_INFO_BY_USERID}`,
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

export const GetUserPackageInfoByUserId = async (userId: number) => {
  if (userId > 0) {

    const result = await apiRequest<typeof userId, UserPackageInfoModel[]>(
      `/${USERS_URL}${GET_USER_PACKAGE_INFO_BY_USERID}`,
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

export const getAllGrades = async (): Promise<Grade[] | null> => {
  try {
    const response = await axios.get<Grade[]>(`${API_URL}${GRADE_URL}`);
    // post(`${API_URL}${PROCESS_REQUEST_ORDER}
    if (response.status === 200 && Array.isArray(response.data)) {
      return response.data;
    }
    return null;
  } catch (error) {
    console.log("Error fetching grades:", error);
    return null;
  }
};