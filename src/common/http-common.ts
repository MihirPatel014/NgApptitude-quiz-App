import axios from "axios";

import { lookInSession } from "./session";
 const API_URL = process.env.REACT_APP_API_URL;

export const http = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-type": "application/json",
  },
});
http.interceptors.request.use(
  (config) => {
    const user  = lookInSession("user");
    if (user) {
      // Parse the user object to extract the token
      const parsedUser = JSON.parse(user);
      const token = parsedUser.apiToken;

      // If token exists, add it to the Authorization header
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//ResponseModal
export type ApiResponse<T> = {
  isSuccess: boolean;
  errorDetails: { errorCode: string; errorMessage: string }[];
  data: T;
};

export const handleApiResponse = <T>(response: ApiResponse<T>): { success: boolean; data?: T; errors?: string[] } => {
  if (response.isSuccess) {
    return { success: true, data: response.data };
  } else {
    const errorMessages = response.errorDetails.map(error => `${error.errorCode}: ${error.errorMessage}`);
    return { success: false, errors: errorMessages };
  }
};


// export const RequestWithData = <T>(data: T): { AccessKey: number; Data: T } => {
//   return {
//     AccessKey: ACCESS_KEY, // Fixed value as per your backend structure
//     Data: data,
//   };
// };


export default http;