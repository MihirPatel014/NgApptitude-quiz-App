import React, { ChangeEvent, useContext, useEffect, useState, useCallback } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { storeInSession } from "../../common/session";
import { UserContext } from "../../provider/UserProvider";
import { UserLogin } from "../../types/user";
import { emailRegex, passwordRegex } from "../../common/constant";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useLoader } from "../../provider/LoaderProvider";


const Login = () => {

  const { setLoading } = useLoader();
  const { userAuth, setUserAuth } = useContext(UserContext);
  const navigate = useNavigate();

  const [user, setUser] = useState<UserLogin>({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

 

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUser((prevUser) => ({ ...prevUser, [name]: value }));
  };

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // Show the loader immediately

    if (!emailRegex.test(user.email)) {
      toast.error("Enter a valid Email Address.");
      setLoading(false);
      return;
    }

    if (!passwordRegex.test(user.password)) {
      toast.error(
        "Password must be at least 8 characters long, include one uppercase, one lowercase, one number, and one special character."
      );
      setLoading(false);
      return;
    }

    try {
      const userResponse = await loginUser(user);

      if (userResponse?.apiToken) {
        storeInSession("user", userResponse);
        setUserAuth(userResponse);
        toast.success("Login Successful!");


        // Delay for 2 seconds before navigation
        const timer = setTimeout(() => {
          setLoading(false);
          navigate("/");
        }, 2000);

        return () => clearTimeout(timer);
      } else {
        toast.error("Invalid login credentials. Please try again.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred. Please try again.");
      setLoading(false);
    }
  }, [user, setUserAuth, navigate]);



  return (
    <>
      <Toaster />
      <h1 className="mb-4 text-3xl font-bold text-center">Student Login</h1>
      <form className="space-y-4" onSubmit={handleLogin}>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-900">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email address"
            required
            value={user.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <label htmlFor="password" className="text-sm font-medium text-gray-900">
            Password
          </label>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            value={user.password}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            className="absolute text-gray-600 end-2.5 bottom-2.5 font-medium rounded-lg text-sm px-4 py-1 bg-transparent hover:bg-gray-100"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
        >
          Login
        </button>
      </form>
    </>
  );
};

export default Login;
