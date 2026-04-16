import React, { useState, useEffect, useContext } from "react";
import toast, { Toaster } from "react-hot-toast";
import OtpInput from "./OTPInput";
import { generateOTPSms, loginWithMobile } from "../../services/authService";
import { storeInSession } from "../../common/session";
import { useNavigate } from "react-router-dom";
import { UserVerifyOTPModel, User, UserLoginResults } from "../../types/user";
import { UserContext } from "../../provider/UserProvider";
import { phoneRegex } from "../../common/constant";
import { ROUTES } from "../../common/routes";
import AuthLegalFooter from "./AuthLegalFooter";

interface PhoneOTPProps {
  onUserNotFound?: (mobile: string) => void;
}

const PhoneOTP: React.FC<PhoneOTPProps> = ({ onUserNotFound }) => {
  const [mobile, setMobile] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showOtpInput, setShowOtpInput] = useState<boolean>(false);
  const [hashValue, setHashValue] = useState<string>("");
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [displayMobile, setDisplayMobile] = useState<string>("");
  const [otpKey, setOtpKey] = useState<number>(0);
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
    if (!phoneRegex.test(mobile)) {
      toast.error("Enter a valid 10-digit mobile number starting with 6-9");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Generate OTP (now for any valid 10-digit number)
      const response: UserVerifyOTPModel | null = await generateOTPSms(mobile);

      if (response && response.loginResult === UserLoginResults.Successful) {
        const { hashvalue, mobile: formattedMobile } = response;
        setHashValue(hashvalue);
        setDisplayMobile(formattedMobile);
        toast.success(`OTP sent to ${formattedMobile}`);
        setShowOtpInput(true);
        setResendTimer(30);
      } else {
        toast.error("Failed to send OTP. Please try again later.");
      }
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
      if (response && response.loginResult === UserLoginResults.Successful) {
        const { hashvalue, mobile: formattedMobile } = response;
        setHashValue(hashvalue);
        setDisplayMobile(formattedMobile);
        setOtpKey((prev) => prev + 1);
        toast.success(`OTP resent to ${formattedMobile}`);
        setResendTimer(30);
      } else {
        toast.error("Failed to resend OTP. Please try again later.");
      }
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

      if (response) {
        if (response.loginResult === UserLoginResults.Successful) {
          setUserAuth(response);
          storeInSession("user", response);
          toast.success("Login successful! Redirecting...");
          setTimeout(() => {
            navigate(ROUTES.HOME);
          }, 1500);
        } else if (response.loginResult === UserLoginResults.UserNotExist) {
          toast.success("Mobile number verified! Redirecting to setup...");
          setTimeout(() => {
            navigate(ROUTES.REGISTER, { state: { mobile } });
          }, 1500);
        } else {
          toast.error("Invalid OTP. Please try again.");
        }
      } else {
        toast.error("An error occurred during verification.");
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
      <div className="flex justify-center items-center min-h-screen bg-slate-100 font-inter">
        {!showOtpInput ? (
          <div className="p-10 w-full max-w-md bg-white rounded-2xl shadow-xl flex flex-col items-center">
            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
              Login
            </h2>

            <p className="text-sm text-center text-gray-500 mb-10">
              Enter your mobile number to receive a verification code.
            </p>

            <div className="space-y-6 w-full">
              {/* Mobile input */}
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Mobile Number
                </label>
                <input
                  id="mobile"
                  type="text"
                  placeholder="e.g. 98765-43210"
                  value={mobile}
                  maxLength={16}
                  onChange={(e) => setMobile(e.target.value)}
                  className="block px-4 py-3 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-inter"
                />
              </div>

              {/* Button */}
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className={`w-full py-3.5 text-white bg-blue-600 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-[0.98] ${loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>

            {/* <p className="mt-8 text-sm text-gray-500">
              Don't have an account?{" "}
              <Link to={ROUTES.REGISTER} className="font-bold text-blue-600 hover:underline">
                Sign Up
              </Link>
            </p> */}
          </div>
        ) : (
          <div className="p-10 w-full max-w-md bg-white rounded-2xl shadow-xl">
            <h2 className="mb-2 text-2xl font-bold text-center text-gray-800">
              Verify OTP
            </h2>
            <p className="mb-8 text-center text-gray-600">
              OTP sent to <span className="font-semibold text-blue-600">{displayMobile}</span>
            </p>

            <div className="flex justify-center mb-8">
              <OtpInput key={otpKey} length={6} mobile={mobile} onOtpSubmit={handleVerifyOtp} />
            </div>

            <button
              onClick={handleResendOtp}
              disabled={resendTimer > 0 || loading}
              className={`w-full py-2.5 text-white rounded-lg font-bold transition-all duration-200 shadow-md ${resendTimer > 0 || loading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 active:scale-[0.98]"
                }`}
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </button>

            <button
              onClick={() => setShowOtpInput(false)}
              className="w-full mt-6 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
            >
              ← Change phone number
            </button>
          </div>
        )}

        <AuthLegalFooter className="absolute bottom-8 w-full" />
      </div>
    </>
  );
};

export default PhoneOTP;


