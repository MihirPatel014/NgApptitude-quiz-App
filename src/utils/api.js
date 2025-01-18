import axios from "axios";
// import jwt from 'jsonwebtoken';

// Base API URL for MockAPI
const API_URL = "https://676d2bf00e299dd2ddfead4d.mockapi.io/api/"; // Replace with your actual MockAPI URL

//Backend api Url
const SECRET_KEY = 'your-secret-key';


const LOGIN_URL = "register"
const REGISTER_URL = "register"
const USERS_URL = 'users';

const generateToken = () => {
  // Generate a simple token using current time and random values
  return (Date.now() + Math.random()).toString(36).substr(2);
};

export const GetUser = async () => {
  const url = `${API_URL}${USERS_URL}`;
  try {
    const response = await axios.get(url);
    // Log the full response object
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("API Response error:", error.response.data);
      console.error("Status code:", error.response.status);
    } else if (error.request) {
      console.error("Request error:", error.request);
    } else {
      console.error("Error message:", error.message);
    }
    throw error;
  }
};

// User Authentication APIs
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}${USERS_URL}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {

    const users = await GetUser();
    const response = users.find((user) => user.email == email && user.password == password);


    // const response = await axios.get(`${API_URL}${LOGIN_URL}`, {
    //   params: { email, password },
    // });

    // if (response) {
    //   return response; // User found, return the user data
    // } else {
    //   return console.log("User not Present email or password."); // Invalid login attempt
    // }

    // if (response.data.length > 0) {
    //   return response.data[0]; // Assuming the first matching user is returned
    // } else {
    //   throw new Error("Invalid email or password.");
    // }

    // const token = jwt.sign({ email: email }, SECRET_KEY, { expriesIn: '2h' });
    const token = generateToken();
    return { email, password, token };
  } catch (error) {
    console.error("Error during login:", error);
    throw error;
  }
};

