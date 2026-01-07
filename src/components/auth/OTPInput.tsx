import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

interface OtpInputProps {
  length?: number;
  mobile: string;
  onOtpSubmit?: (otp: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  mobile,
  onOtpSubmit = () => { },
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < length - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyClick = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== length) {
      toast.error("Please enter the full OTP");
      return;
    }
    onOtpSubmit(enteredOtp);
  };

  return (
    <div className="text-center">
      <p className="mb-4 text-sm text-gray-600">
        Enter the 6-digit code sent to your mobile number
      </p>
      <div className="flex justify-center gap-3 mb-4">
        {otp.map((value, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            ref={(el) => { inputRefs.current[index] = el!; }}
            className="w-12 h-12 text-center text-xl border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        ))}
      </div>
      <button
        onClick={handleVerifyClick}
        className="w-full px-4 py-2 text-white bg-indigo-500 rounded hover:bg-indigo-600"
      >
        Verify OTP
      </button>
    </div>
  );
};

export default OtpInput;
