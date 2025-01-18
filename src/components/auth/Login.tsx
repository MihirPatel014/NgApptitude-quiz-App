import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../utils/api";
import { storeInSession } from "../../common/session"
import { UserContext } from "../../App";

const Login = () => {
  
  
  const navigate = useNavigate();

  const handleLogin = async (e: any) => {
    e.preventDefault();

    let formID: string = "formElement";
    let form = document.getElementById(formID) as HTMLFormElement | null; // Ensure form is an HTMLFormElement

    let formData: Record<string, string> = {}; // Explicitly type formData as an object with string keys and values

    if (form) {
      let formDataObject = new FormData(form); // Create FormData from the form element

      // Convert FormData to a plain object
      for (let [key, value] of Array.from(formDataObject.entries())) {
        formData[key] = value as string; // Type assertion for value (since FormData stores values as string or File)
      }
    }
    const user = await loginUser(formData.email, formData.password);
    console.log(user);
    storeInSession("user", JSON.stringify(user));
    // navigate("/quizpage");

  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
        <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow md:w-1/4 dark:bg-gray-800 dark:border-gray-700">
          <div>
            <h1 className="mb-4 text-3xl font-bold text-center">Student Login</h1>

          </div>
          <form id="formElement" className="space-y-4">
            <div className="space-y-2">


              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                name="email"
                placeholder="Enter Email"
                required

                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">



              <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter Password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>


            <button
              type="submit"
              className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => handleLogin(e)}
            >
              Login
            </button>
          </form>
          <p className="mt-3">Don't have an account ?
            <Link to="/registeration" className='px-3 py-1 ml-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'> Register</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
