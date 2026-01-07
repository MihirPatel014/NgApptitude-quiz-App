import React, { useState, useEffect, useContext } from "react";
import toast, { Toaster } from "react-hot-toast";
import OtpInput from "./OTPInput";
import { generateOTPSms, loginWithMobile } from "../../services/authService";
import { storeInSession } from "../../common/session";
import { useNavigate } from "react-router-dom";
import { UserVerifyOTPModel, User, UserLoginResults } from "../../types/user";
import { UserContext } from "../../provider/UserProvider";

interface PhoneOTPProps {
  onUserNotFound?: () => void;
}

const PhoneOTP: React.FC<PhoneOTPProps> = ({ onUserNotFound }) => {
  const [mobile, setMobile] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showOtpInput, setShowOtpInput] = useState<boolean>(false);
  const [hashValue, setHashValue] = useState<string>("");
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [displayMobile, setDisplayMobile] = useState<string>("");
  const navigate = useNavigate();
  const { setUserAuth } = useContext(UserContext);
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      // 1?? Generate OTP (backend now also sends SMS)
      const response: UserVerifyOTPModel | null = await generateOTPSms(mobile);
      if (!response || response.loginResult !== UserLoginResults.Successful) {
        switch (response?.loginResult) {
          case UserLoginResults.UserNotExist:
            toast.error("User does not exist. Redirecting to SignUp...");
            if (onUserNotFound) {
              setTimeout(() => {
                onUserNotFound();
              }, 1000);
            }
            break;
          case UserLoginResults.NotActive:
            toast.error("Your account is not active.");
            break;
          case UserLoginResults.AccountLockout:
            toast.error("Account locked. Please try again after some time.");
            break;
          default:
            toast.error("Failed to generate OTP. Please try again later.");
            break;
        }
        return;
      }

      const { hashvalue, mobile: formattedMobile } = response;
      setHashValue(hashvalue);
      setDisplayMobile(formattedMobile);
      toast.success(`OTP sent to ${formattedMobile}`);
      setShowOtpInput(true);
      setResendTimer(30);

    } catch (error: any) {
      console.log("Error generating OTP:", error);
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const response: UserVerifyOTPModel | null = await generateOTPSms(mobile);
      if (!response || response.loginResult !== UserLoginResults.Successful) {
        switch (response?.loginResult) {
          case UserLoginResults.UserNotExist:
            toast.error("User does not exist. Please register.");
            break;
          case UserLoginResults.NotActive:
            toast.error("Your account is not active.");
            break;
          case UserLoginResults.AccountLockout:
            toast.error("Account locked. Please try again after some time.");
            break;
          default:
            toast.error("Failed to resend OTP. Please try again later.");
            break;
        }
        return;
      }
      const { hashvalue, mobile: formattedMobile } = response;
      setHashValue(hashvalue);
      setDisplayMobile(formattedMobile);
      toast.success(`OTP resent to ${formattedMobile}`);
      setResendTimer(30);
    } catch (error: any) {
      console.log("Error resending OTP:", error);
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (enteredOtp: string) => {
    if (!enteredOtp) {
      toast.error("Please enter the OTP");
      return;
    }

    setLoading(true);
    try {
      const response: User | null = await loginWithMobile(
        mobile,
        enteredOtp,
        hashValue
      );

      if (response && response.loginResult == UserLoginResults.Successful) {
        setUserAuth(response);
        storeInSession("user", response);
        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.error("Invalid OTP or login failed.");
      }
    } catch (error: any) {
      console.log("OTP verification failed:", error);
      toast.error(error.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="flex justify-center items-center h-screen">
        {!showOtpInput ? (
          <div className="p-6 w-full max-w-md bg-white rounded-lg shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
              Login with OTP
            </h2>
            <input
              type="text"
              placeholder="Enter your mobile number"
              value={mobile}
              maxLength={10}
              onChange={(e) => setMobile(e.target.value)}
              className="block px-4 py-2 mb-4 w-full rounded-lg border"
            />
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className={`w-full py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        ) : (
          <div className="p-6 w-full max-w-md bg-white rounded-lg shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
              Enter OTP
            </h2>
            <p className="mb-4 text-center text-gray-600">OTP sent to <span className="font-semibold">{displayMobile}</span></p>
            <OtpInput length={6} mobile={mobile} onOtpSubmit={handleVerifyOtp} />
            <button
              onClick={handleResendOtp}
              disabled={resendTimer > 0 || loading}
              className={`w-full py-2 mt-4 text-white rounded-lg transition-colors duration-200 ${resendTimer > 0 || loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default PhoneOTP;


