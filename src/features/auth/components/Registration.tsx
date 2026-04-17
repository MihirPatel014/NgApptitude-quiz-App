'use client'

import { useState, useEffect, useRef } from 'react'
import { checkEmail, getAllGrades, registerUser } from "../services/authService"
import { UserRegistration } from "../../../types/user";
import { REGEX } from "../../../common/constant";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useLoader } from '../../../provider/LoaderProvider';
import toast, { Toaster } from "react-hot-toast";
import { WheelDatePicker } from './WheelDatePicker';
import { Grade } from '../../../types/grade';
import { useContext } from 'react';
import { UserContext } from '../../../provider/UserProvider';
import { UserLoginResults } from '../../../types/user';
import { ROUTES } from '../../../common/constant';
import { storeInSession } from '../../../common/session';
import AuthLegalFooter from './AuthLegalFooter';

interface RegistrationProps {
  setIsRightPanelActive?: React.Dispatch<React.SetStateAction<boolean>>;
  mobile?: string;
}

const Registration: React.FC<RegistrationProps> = ({ mobile: propMobile }) => {
  const { setUserAuth } = useContext(UserContext);
  const location = useLocation();
  const navigate = useNavigate();
  const stateMobile = location.state?.mobile;
  const mobile = propMobile || stateMobile;
  // Inside your component
  const [emailError, setEmailError] = useState("");

  const formRef = useRef<HTMLDivElement>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const { loading, setLoading } = useLoader();
  const [formValues, setFormValues] = useState<UserRegistration>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    dateOfBirth: new Date(new Date().getFullYear() - 15, 0, 1), // Default to 15 years ago
    class: '',
    medium: '',
    institute: '',
    contactNo: '',
    city: '',
    state: '',
    hobbies: '',
    expectationFromThisTest: '',
    dreamCareerOptions: '',
  });

  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    const fetchGrades = async () => {
      const data = await getAllGrades();
      if (data) setGrades(data);
    };
    fetchGrades();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mobile) {
      setFormValues((prev) => ({
        ...prev,
        contactNo: mobile,
      }));
    }
  }, [mobile]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!formValues.email || !REGEX.EMAIL.test(formValues.email)) {
      setEmailError("");
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await checkEmail(formValues.email);
        if (response.data === true) {
          setEmailError("This email is already linked with another account.");
          toast.error("Email already in use!");
        } else {
          setEmailError("");
        }
      } catch (error) {
        console.error("Email check failed", error);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [formValues.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormValues({
      ...formValues,
      [name]: value,
    });
    // Clear error on change
    if (formErrors[name]) {
      setFormErrors((prevErrors: any) => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  const handleDateChange = (date: Date) => {
    setFormValues({
      ...formValues,
      dateOfBirth: date,
    });
    if (formErrors.dateOfBirth) {
      setFormErrors((prev: any) => ({ ...prev, dateOfBirth: "" }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    const errors = validate({ ...formValues });
    if (errors[name]) {
      setFormErrors((prev: any) => ({ ...prev, [name]: errors[name] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    e.preventDefault();
    const errors = validate(formValues);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0 || emailError) {
      setLoading(false);
      return;
    }
    try {
      const result = await registerUser(formValues);
      if (result) {
        if (result.loginResult === UserLoginResults.Successful) {
          // Store user info and token for auto-login
          const authData = {
            loginResult: result.loginResult,
            apiToken: result.apiToken,
            email: result.email,
            userId: result.userId,
            userGuidId: result.userGuidId,
            contactNo: result.contactNo,
          };

          setUserAuth(authData as any);
          storeInSession("user", authData);

          if (result.isExistingUser) {
            toast.success("Account already exists! Logging you in...");
          } else {
            toast.success("Successfully Registered! Logging you in...");
          }

          setTimeout(() => {
            navigate(ROUTES.HOME);
          }, 1500);
        } else if (result.loginResult === UserLoginResults.AccountLockout) {
          toast.error("Your account is locked. Please try again later.");
        } else {
          toast.error("Registration failed. Please check your details.");
        }
      } else {
        toast.error("An error occurred during registration.");
      }
    } catch (err: any) {

      setLoading(false);
      console.log(err.message);
      toast.error('unable to register');
    } finally {
      setLoading(false);
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const validate = (values: UserRegistration) => {
    const errors: any = {};
    if (!values.name?.trim()) {
      errors.name = 'Full Name is required';
    } else if (values.name.length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }

    if (!values.email?.trim()) {
      errors.email = 'Email address is required';
    } else if (!REGEX.EMAIL.test(values.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!values.institute?.trim()) {
      errors.institute = 'School/College name is required';
    }

    if (!values.class) {
      errors.class = 'Please select your standard/grade';
    }

    if (!values.city?.trim()) {
      errors.city = 'City name is required';
    }

    if (!values.contactNo?.trim()) {
      errors.contactNo = 'Mobile number is required';
    } else if (!REGEX.PHONE.test(values.contactNo)) {
      errors.contactNo = 'Enter a valid 10-digit mobile number';
    }

    if (!values.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const today = new Date();
      const birthDate = new Date(values.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 5) {
        errors.dateOfBirth = 'Minimum age required is 5 years';
      } else if (age > 100) {
        errors.dateOfBirth = 'Please select a valid birth year';
      }
    }

    return errors;
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-100 py-12 px-4 shadow-inner font-inter">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-4xl animate-scale-up">
        <Toaster />
        <div ref={formRef}>
          {mobile && (
            <div className="mb-8 px-5 py-4 text-sm text-blue-800 bg-blue-50 border border-blue-100 rounded-xl flex items-center shadow-sm">
              <span className="mr-3 text-lg">ℹ️</span>
              Please fill the registration form for {mobile} as it is not registered.
            </div>
          )}
          <h1 className="mb-8 text-3xl font-extrabold text-gray-800 text-center tracking-tight">Student Registration</h1>
        </div>
        <form id='formElement' className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            <div className="space-y-2">
              <label htmlFor="contactNo" className="text-sm font-semibold text-gray-700">Mobile Number</label>
              <input
                id="contactNo"
                name="contactNo"
                type="text"
                readOnly={!!mobile}
                value={formValues.contactNo}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`px-4 py-2.5 w-full rounded-xl border transition-all duration-200 ${formErrors.contactNo ? 'border-red-500 ring-2 ring-red-50' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  } ${mobile ? "bg-gray-100 cursor-not-allowed text-gray-500" : ""}`}
              />
              {formErrors.contactNo && <span className="text-xs text-red-500 font-medium ml-1">{formErrors.contactNo}</span>}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</label>
              <input
                id="email"
                name="email"
                type="text"
                placeholder="email@example.com"
                onChange={handleChange}
                onBlur={handleBlur}
                value={formValues.email}
                className={`px-4 py-2.5 w-full rounded-xl border transition-all duration-200 ${(formErrors.email || emailError) ? 'border-red-500 ring-2 ring-red-50' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
              />
              {(formErrors.email || emailError) && <span className="text-xs text-red-500 font-medium ml-1">{formErrors.email || emailError}</span>}
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</label>
              <input
                id="name"
                name="name"
                placeholder="Enter your full name"
                onChange={handleChange}
                onBlur={handleBlur}
                value={formValues.name}
                className={`px-4 py-2.5 w-full rounded-xl border transition-all duration-200 ${formErrors.name ? 'border-red-500 ring-2 ring-red-50' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
              />
              {formErrors.name && <span className="text-xs text-red-500 font-medium ml-1">{formErrors.name}</span>}
            </div>

            <WheelDatePicker
              label="Date of Birth"
              value={formValues.dateOfBirth}
              onChange={handleDateChange}
              error={formErrors.dateOfBirth}
            />

            <div className="space-y-2">
              <label htmlFor="institute" className="text-sm font-semibold text-gray-700">School / College Name</label>
              <input
                id="institute"
                name="institute"
                placeholder="Enter your school name"
                onChange={handleChange}
                onBlur={handleBlur}
                value={formValues.institute}
                className={`px-4 py-2.5 w-full rounded-xl border transition-all duration-200 ${formErrors.institute ? 'border-red-500 ring-2 ring-red-50' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
              />
              {formErrors.institute && <span className="text-xs text-red-500 font-medium ml-1">{formErrors.institute}</span>}
            </div>

            <div className="space-y-2">
              <label htmlFor="class" className="text-sm font-semibold text-gray-700">Standard / Grade</label>
              <select
                id="class"
                name="class"
                onChange={handleChange}
                onBlur={handleBlur}
                value={formValues.class}
                className={`px-4 py-2.5 w-full rounded-xl border bg-white transition-all duration-200 ${formErrors.class ? 'border-red-500 ring-2 ring-red-50' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
              >
                <option value="">Select your standard</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.name}>{grade.name}</option>
                ))}
              </select>
              {formErrors.class && <span className="text-xs text-red-500 font-medium ml-1">{formErrors.class}</span>}
            </div>

            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-semibold text-gray-700">City</label>
              <input
                id="city"
                name="city"
                placeholder="Enter your city"
                onChange={handleChange}
                onBlur={handleBlur}
                value={formValues.city}
                className={`px-4 py-2.5 w-full rounded-xl border transition-all duration-200 ${formErrors.city ? 'border-red-500 ring-2 ring-red-50' : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
                  }`}
              />
              {formErrors.city && <span className="text-xs text-red-500 font-medium ml-1">{formErrors.city}</span>}
            </div>

          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading || !!emailError}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Processing...
                </span>
              ) : "Register & Start Test"}
            </button>
          </div>
        </form>

        <div className="mt-10 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{" "}
            <Link to={ROUTES.LOGIN} className="font-bold text-blue-600 hover:underline">
              Log In
            </Link>
          </p>
        </div>
      </div>

      <AuthLegalFooter className="mt-12 pb-8" />
    </div>
  )
}

export default Registration;
