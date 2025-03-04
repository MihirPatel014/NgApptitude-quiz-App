import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Toaster } from "react-hot-toast";
import { storeInSession } from "../../common/session";
import { VerifyOtp } from "../../services/authService";
import { Navigate, useNavigate } from "react-router-dom";
// import "./otpinput.css"
// Define the types for the props
interface OtpInputProps {
    length?: number;
    mobile?: string;
    onOtpSubmit?: (otp: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({ length = 4, mobile = "", onOtpSubmit = () => { } }) => {
    const [otp, setOtp] = useState<string[]>(new Array(length).fill(""));
    const inputRefs = useRef<HTMLInputElement[]>([]);
    const navigate = useNavigate();
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        // allow only one input
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // submit trigger
        const combinedOtp = newOtp.join("");
        if (combinedOtp.length === length) onOtpSubmit(combinedOtp);

        // Move to next input if current field is filled
        if (value && index < length - 1 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleClick = (index: number) => {
        if (inputRefs.current[index]) {
            inputRefs.current[index].setSelectionRange(1, 1);
        }

        // optional: Focus on the next input if the current one is empty
        if (index > 0 && !otp[index - 1] && inputRefs.current[otp.indexOf("")]) {
            inputRefs.current[otp.indexOf("")].focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (
            e.key === "Backspace" &&
            !otp[index] &&
            index > 0 &&
            inputRefs.current[index - 1]
        ) {
            // Move focus to the previous input field on backspace
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.join("") === "") {
            console.log(otp);
            toast.error("Enter the OTP");
            return;
        }

        try {
            const response = await VerifyOtp(mobile, otp.join("")); // Pass the joined OTP string
            storeInSession("user", response);
            if (response) {
                navigate("/");
            }
            toast.success("Login successful!");
            // Redirect to dashboard or home page
        } catch (error) {
            toast.error("Invalid OTP. Please try again.");
        }
    };

    return (
        <>
            <Toaster />

            <div className="max-w-md px-4 py-10 mx-auto text-center bg-white shadow sm:px-8 rounded-xl">
                <header className="mb-8">
                    <h1 className="mb-1 text-2xl font-bold">Mobile Phone Verification</h1>
                    <p className="text-[15px] text-slate-500">Enter the 4-digit verification code that was sent to your phone number.</p>
                </header>

                <div className="flex items-center justify-center gap-3">
                    {otp.map((value, index) => {
                        return (
                            <input
                                key={index}
                                type="text"
                                ref={(input) => (inputRefs.current[index] = input as HTMLInputElement)}
                                value={value}
                                onChange={(e) => handleChange(index, e)}
                                onClick={() => handleClick(index)}
                                onKeyDown={(e) => handleKeyDown(index, e)}

                                className="p-4 text-2xl font-extrabold text-center border border-transparent rounded outline-none appearance-none w-14 h-14 text-slate-900 bg-slate-100 hover:border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                            />
                        );
                    })}
                </div>
                <div className="max-w-[260px] mx-auto mt-4">
                    <button type="submit"
                        className="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-indigo-500 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-300 focus-visible:outline-none focus-visible:ring focus-visible:ring-indigo-300 transition-colors duration-150">Verify
                        Account</button>
                </div>
                <button onClick={handleVerifyOtp} className="verifyButton" type="submit">Verify</button>
                <div className="mt-4 text-sm text-slate-500">Didn't receive code? <a className="font-medium " href="#0">Resend</a></div>
                {/* <p className="resendNote">Didn't receive the code? <button className="resendBtn">Resend Code</button></p> */}
            </div>
        </>
    );
};

export default OtpInput;
