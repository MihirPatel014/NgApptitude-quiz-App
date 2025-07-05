import axios from "axios";
import { UserRegistrationResults } from "../common/constant";
import { ApiResponse, handleApiResponse } from "../common/http-common";
import http from "../common/http-common"
import { apiRequest } from "../common/requestwithdata";
import { AddUserToPackageApiModel, User, userDetails, UserInfoModel, UserLogin, UserPackage, UserPackageInfoModel, UserProfileUpdate, UserRegistration } from "../types/user"
import { Grade } from "../types/grade";

//Backend api Url
const SECRET_KEY = 'your-secret-key';

// api/User/Register
const USERS_URL = 'api/User';

const LOGIN_URL = "/Login"
const REGISTER_URL = "/Register"

const OTP_URL = "/sendOTP"
const Verify_OTP_URL = "/VerifyOtp"
const GET_USER_DETAILS = "/GetUserDetails"
const Update_USER_DETAILS = "/UpdateUserDetails"
const ADD_USER_TO_PACKAGE = "/AddUserToPackage"
const GET_USER_FULL_INFO_BY_USERID = "/GetUserFullInfoByUserId"
const GET_USER_PACKAGE_INFO_BY_USERID = "/GetUserPackageInfoByUserId"
 
const API_URL = process.env.REACT_APP_API_URL;
const GRADE_URL = "api/Grade/GetAllGrades";
const getAll = () => {
  return http.get<Array<userDetails>>(`/${USERS_URL}`);
};

const get = (id: any) => {
  return http.get<userDetails>(`/${USERS_URL}/${id}`);
};

const create = (data: userDetails) => {
  return http.post<userDetails>(`/${USERS_URL}`, data);
};

const update = (id: any, data: userDetails) => {
  return http.put<any>(`/${USERS_URL}/${id}`, data);
};

export const remove = (id: any) => {
  return http.delete<any>(`/${USERS_URL}/${id}`);
};

export const removeAll = () => {
  return http.delete<any>(`/${USERS_URL}`);
};

export const loginUser = async (data: UserLogin) => {

console.log("Environment:", process.env.REACT_APP_API_URL);
console.log("API URL:", process.env.REACT_APP_API_URL);
console.log("Test Var:", process.env.REACT_APP_TEST);

const fullUrl = `${USERS_URL}${LOGIN_URL}`;
console.log("➡️ Full API Request URL:", fullUrl);
console.log("📦 Request Data:", data);

  const response = await http.post<ApiResponse<User>>(`${USERS_URL}${LOGIN_URL}`, data);
  const result = handleApiResponse(response.data);

  if (result.success) {
    return result.data;

  } else {
    return result.data;
  }

};

export const registerUser = async (data: UserRegistration) => {

  const response = await http.post<ApiResponse<UserRegistrationResults>>(
    `${USERS_URL}${REGISTER_URL}`,
    data
  );

  const result = handleApiResponse(response.data);
  if (result.success) {

    return result.data;
  } else {
    // Handle API-level errors
    console.error("Registration failed with errors:", result.errors);
    return null;
  }
};


export const sendOtp = async (data: string) => {
  try {
    // let response = http.post<string>(`/${USERS_URL}${sendOtp}`, data);
    let response = "1234";
    return response;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};
export const VerifyOtp = async (mobileNo: string, otp: string) => {
  try {
    // let response = http.post<string>(`/${USERS_URL}${sendOtp}`, data);
    let response = "1234";
    return response;
  } catch (error) {
    console.error("Error during registration:", error);
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
export const UpdateUserDetails = async (data:UserProfileUpdate) => {
  const result = await apiRequest<typeof data, UserProfileUpdate>(
    `/${USERS_URL}${Update_USER_DETAILS}`,
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
    console.error('Error fetching pincode data:', error);
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