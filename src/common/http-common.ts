import axios from "axios";

import { lookInSession } from "./session";

// const API_URL = "https://676d2bf00e299dd2ddfead4d.mockapi.io/api/"; // Replace with your actual MockAPI URL
// const API_URL = "https://localhost:44389/"; // Replace with your actual MockAPI URL
// const API_URL = "http://apingapptitude-001-site1.anytempurl.com/swagger/index.html/"; // Replace with your actual MockAPI URL
const API_URL = "https://apingapptitude-001-site1.anytempurl.com/"; // Replace with your actual MockAPI URL



// export default axios.create({
//   baseURL: API_URL,
//   headers: {
//     "Content-type": "application/json",
//     "Access-Control-Allow-Origin": API_URL,

//   }
// });

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
    console.error("API Errors:", errorMessages); // Log errors for debugging
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