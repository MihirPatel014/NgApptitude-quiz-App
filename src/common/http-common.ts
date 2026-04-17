import axios from "axios";

import { lookInSession, logOutUser } from "./session";
import { ROUTES } from "./constant";

const API_URL = import.meta.env.VITE_API_URL;

export const http = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-type": "application/json",
  },
});

// Request interceptor — attach JWT token to every request
http.interceptors.request.use(
  (config) => {
    const user = lookInSession("user");
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

// Response interceptor — handle expired/invalid JWT
http.interceptors.response.use(
  (response) => {
    // Check for custom business logic error (200 OK but session invalid)
    const apiData = response.data as ApiResponse<any>;
    if (apiData && apiData.isSuccess === false) {
      const isUnauthorized = apiData.errorDetails?.some(err => err.errorCode === "125");
      if (isUnauthorized) {
        // Clear the session so stale auth data is removed
        logOutUser();

        // Redirect to login — use window.location since interceptors
        // live outside the React Router context
        if (window.location.pathname !== ROUTES.LOGIN) {
          window.location.href = ROUTES.LOGIN;
        }
      }
    }
    return response;
  },
  (error) => {
    // Handle standard HTTP error codes (real 401)
    if (error.response?.status === 401) {
      logOutUser();
      if (window.location.pathname !== ROUTES.LOGIN) {
        window.location.href = ROUTES.LOGIN;
      }
    }
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
