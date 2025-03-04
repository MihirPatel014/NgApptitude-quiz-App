import http, { ApiResponse, handleApiResponse } from "./http-common";

export const apiRequest = async <T, R>(
    route: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    data: T
  ) => {
    try {
      // Construct the request payload
      const requestPayload = {
        accessKey: 8525, // AccessKey required by the API
        data: data || {}, // Send an empty object if no data is provided
      };
  
      // Axios request configuration
      const config = {
        url: route.startsWith("/") ? route : `/${route}`, // Ensure leading `/`
        method,
        ...(method === "POST" || method === "PUT"
          ? { data: requestPayload } // Send POST/PUT data in the body
          : {}),
      };
  
      // Make the API call using Axios
      const response = await http.request<ApiResponse<R>>(config);
  
      // Handle and return the response
      return handleApiResponse(response.data);
    } catch (error) {
      console.log("API request error:", error);
      return { success: false, errors: ["Network or server error"] };
    }
  };
  
  
