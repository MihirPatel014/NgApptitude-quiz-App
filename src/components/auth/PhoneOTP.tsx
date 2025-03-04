import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { sendOtp } from "../../services/authService";
import OtpInput from "./OTPInput";

const PhoneOTP = () => {
  const [mobile, setMobile] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOTP] = useState<string>("");

  const handleSendOtp = async () => {
    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    try {
      const result = await sendOtp(mobile);
      setShowOtpInput(true);
      toast.success("OTP sent successfully!");
      setOTP(result);
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = () => {
    console.log("Login Successful", otp);
  };

  return (
    <>
      <Toaster />
      <div className="flex items-center justify-center h-screen bg-gray-50">
        {!showOtpInput ? (
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
              Login
            </h2>
            <div>
              <label
                htmlFor="mobile"
                className="block text-sm font-medium text-gray-700"
              >
                Mobile Number
              </label>
              <input
                id="mobile"
                type="text"
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                maxLength={10}
                required
                className="block w-full px-4 py-2 mt-2 text-gray-700 bg-gray-100 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className={`mt-4 w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
              Enter OTP
            </h2>
            <OtpInput
              length={4}
              mobile={mobile}
              onOtpSubmit={() => onOtpSubmit()}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default PhoneOTP;
