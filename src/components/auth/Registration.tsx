'use client'

import { useState, useEffect } from 'react'
import { pincodeApi, registerUser } from "../../services/authService"
import { Link } from 'react-router-dom';
import { UserRegistration } from "../../types/user"
import { emailRegex, phoneRegex, passwordRegex } from "../../common/constant";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { UserRegistrationResults } from '../../common/constant';
import toast, { Toaster } from "react-hot-toast";

export const Registration = () => {

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [pincode, setPincode] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState<UserRegistration>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    dateOfBirth: new Date(),
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

  // const [formValues, setFormValues] = useState<RegistrationValues>();
  const [formErrors, setFormErrors] = useState<UserRegistration>({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    dateOfBirth: new Date(),
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
  // const [formErrors, setFormErrors] = useState({});
  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPincode(Number(value));

    if (value.length === 6) { // Ensure pincode is valid (6 digits)
      fetchCityAndState(Number(value));
    }
  };

  const fetchCityAndState = async (pincode: number) => {
    try {
      const response = await pincodeApi(pincode)
      if (response[0]?.Status === "Success" && response[0]?.PostOffice?.length > 0) {

        const postOffices = response[0]?.PostOffice || [];

        if (postOffices.length > 0) {
          const { District, State } = postOffices[0]; // Assuming first result is the correct one
          setFormValues((prevValues) => ({
            ...prevValues,
            city: District,
            state: State,
          }));
        } else {
          setFormErrors((prevErrors) => ({
            ...prevErrors,
            city: 'City not found for this pincode',
            state: 'State not found for this pincode',
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching pincode data:', error);
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        city: 'Error fetching city data',
        state: 'Error fetching state data',
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {

    const { name, value } = e.target

    setFormValues({
      ...formValues,
      [name]: name === 'dateOfBirth' ? new Date(value).toISOString().split('T')[0] : value, // Special handling for 'dob' field
    });
    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: ''
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validate(formValues)

    // if (validate(formValues).length > 0) {
    if (Object.keys(errors).length > 0) return;
    try {

      const result = await registerUser(formValues);
      if (result) {
        switch (result) {
          case UserRegistrationResults.Successful:
            toast.success("Registration successful! Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000); // Redirect after a short delay
            break;

          case UserRegistrationResults.ContactNoAlreadyExists:
          case UserRegistrationResults.EmailAlreadyExists:
            toast.success(
              "Your contact number or email already exists. Redirecting to login..."
            );
            setTimeout(() => navigate("/login"), 2000); // Redirect after a short delay
            break;

          case UserRegistrationResults.PasswordPolicyNotMet:
            toast.error(
              "Password policy not met. Please ensure your password follows the requirements."
            );
            break;

          case UserRegistrationResults.InvalidDetails:
            toast.error("Invalid details provided. Please check your input.");
            break;

          default:
            toast.error("An unexpected error occurred. Please try again later.");
            break;
        }
      } else {
        toast.error("An error occurred during registration.");
      }
    } catch (err: any) {
      console.log(err.message);
      toast.error('unable to register');
    } finally {
      setLoading(false);
    }

  };

  const validate = (values: any) => {
    const errors: any = {};

    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(values.email)) {
      errors.email = 'Email is invalid';
    }

    if (!values.password) {
      errors.password = 'Password is required';

    } else if (values.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (!passwordRegex.test(values.password)) {
      errors.password = "Password must be at least 8 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character."

    }

    if (!values.name) {
      errors.name = ' name is required';
    }

    if (!values.dateOfBirth || values.dateOfBirth == "" || values.dateOfBirth == Date.now) {
      errors.dateOfBirth = 'Date of birth is required';
    }

    if (!values.class) {
      errors.class = 'Grade/Class is required';
    }

    if (!values.medium) {
      errors.medium = 'Language is required';
    }

    if (!values.institute) {
      errors.institute = 'School/College name is required';
    }

    if (!values.contactNo) {
      errors.contactNo = 'Contact number is required';
    } else if (!phoneRegex.test(values.contactNo)) {
      errors.contactNo = 'Contact number should be 10 digits';
    }

    if (!values.city) {
      errors.city = 'City is required';
    }

    if (!values.state) {
      errors.state = 'State is required';
    }
    if (!values.hobbies) {
      errors.hobbies = 'hobbies is required';
    }
    if (!values.dreamCareerOptions) {
      errors.dreamCareerOptions = 'dream Career Options is required';
    }
    if (!values.expectationFromThisTest) {
      errors.expectationFromThisTest = 'expectation From This Test is required';
    }
    setFormErrors(errors)
    console.log("NO of Errors", errors.length)
    return errors;

  };
  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };
  return (
    <>
      <Toaster />
      {/* <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
        <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow md:w-3/6 dark:bg-gray-800 dark:border-gray-700"> */}
      <div>
        <h1 className="mb-4 text-3xl font-bold text-center">Student Register</h1>
        {/* <p className="mb-6 text-center">Please fill in your details to register</p> */}
      </div>
      <form id='formElement' className="space-y-4" >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          <div className="space-y-2">
            <label htmlFor="contactNo" className="text-sm font-medium text-gray-700">Contact Number</label>
            <input
              id="contactNo"
              name="contactNo"
              type="number"
              // placeholder="1234567890"
              required
              onChange={(e) => handleChange(e)}
              defaultValue={formValues.contactNo}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formErrors.contactNo && <span className="text-xs text-red-500">{formErrors.contactNo}</span>}
          </div>
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              id="name"
              name="name"
              // placeholder="John Doe"
              required
              onChange={(e) => handleChange(e)}
              defaultValue={formValues.name}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formErrors.name && <span className="text-xs text-red-500">{formErrors.name}</span>}
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              name="email"
              placeholder="Enter Email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              size={20}
              defaultValue={formValues.email}
              onChange={(e) => handleChange(e)}
            />
            {formErrors.email && <span className="text-xs text-red-500">{formErrors.email}</span>}
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
            <div className='relative '>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                // placeholder="Enter Password"
                required
                onChange={(e) => handleChange(e)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={formValues.password}
              />
              <button
                type="button"
                className="absolute text-gray-600  end-2.5 bottom-2.5 font-medium rounded-lg text-sm px-4 py-1 hover:text-gray-600 focus:outline-none bg-transparent hover:bg-gray-100"
                onClick={togglePasswordVisibility}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {formErrors.password && <span className="text-xs text-red-500">{formErrors.password}</span>}
          </div>

          <div className="space-y-2">
            <label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              required
              onChange={(e) => handleChange(e)}
              // value={formValues.dateOfBirth.toDateString()}
              // value={formValues.dateOfBirth.toISOString().split("T")[0]}
              // defaultValue={formValues.dateOfBirth.toDateString()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formErrors.dateOfBirth && new Date(formErrors.dateOfBirth).toDateString() !== new Date().toDateString() && (
              <span className="text-xs text-red-500">{new Date(formErrors.dateOfBirth).toDateString()}</span>
            )}

          </div>
          <div className="space-y-2">
            <label htmlFor="class" className="text-sm font-medium text-gray-700">Grade/Class</label>
            <select
              id="class"
              name="class"
              defaultValue={formValues.class}
              onChange={(e) => handleChange(e)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Choose Grade</option>
              <option value="Grade 1">Grade 1</option>
              <option value="Grade 2">Grade 2</option>
              <option value="Grade 3">Grade 3</option>
            </select>
            {formErrors.class && <span className="text-xs text-red-500">{formErrors.class}</span>}
          </div>
          <div className="space-y-2">
            <label htmlFor="medium" className="text-sm font-medium text-gray-700">Language</label>
            <select
              id="medium"
              name="medium"
              value={formValues.medium}
              onChange={(e) => handleChange(e)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>Choose Language</option>
              <option value="Hindi">Hindi</option>
              <option value="English">English</option>
              <option value="Gujarati">Gujarati</option>
            </select>
            {formErrors.medium && <span className="text-xs text-red-500">{formErrors.medium}</span>}
          </div>
          <div className="space-y-2">
            <label htmlFor="institute" className="text-sm font-medium text-gray-700">School/College Name</label>
            <input
              id="institute"
              name="institute"
              // placeholder="ABC School"
              required
              onChange={(e) => handleChange(e)}
              defaultValue={formValues.institute}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formErrors.institute && <span className="text-xs text-red-500">{formErrors.institute}</span>}
          </div>

          <div className="space-y-2">
            <label htmlFor="pincode" className="text-sm font-medium text-gray-700"> Pincode</label>
            <input
              id="pincode"
              name="pincode"
              type="number"
              onChange={(e) => handlePincodeChange(e)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>
          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium text-gray-700">City</label>
            <input
              id="city"
              name="city"
              // placeholder="Your City"
              required
              onChange={(e) => handleChange(e)}
              defaultValue={formValues.city}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formErrors.city && <span className="text-xs text-red-500">{formErrors.city}</span>}
          </div>
          <div className="space-y-2">
            <label htmlFor="state" className="text-sm font-medium text-gray-700">State</label>
            <input
              id="state"
              name="state"
              // placeholder="Your State"
              required
              onChange={(e) => handleChange(e)}
              defaultValue={formValues.state}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formErrors.state && <span className="text-xs text-red-500">{formErrors.state}</span>}
          </div>
          <div className="space-y-2">
            <label htmlFor="hobbies" className="text-sm font-medium text-gray-700">Hobbies</label>
            <input
              id="hobbies"
              name="hobbies"
              // placeholder="Your State"
              required
              onChange={(e) => handleChange(e)}
              defaultValue={formValues.hobbies}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formErrors.hobbies && <span className="text-xs text-red-500">{formErrors.hobbies}</span>}
          </div>
          <div className="space-y-2">
            <label htmlFor="expectationFromThisTest" className="text-sm font-medium text-gray-700">Expectation From This Test</label>
            <input
              id="expectationFromThisTest"
              name="expectationFromThisTest"
              // placeholder="Your State"
              required
              onChange={(e) => handleChange(e)}
              defaultValue={formValues.expectationFromThisTest}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formErrors.expectationFromThisTest && <span className="text-xs text-red-500">{formErrors.expectationFromThisTest}</span>}
          </div>
          <div className="space-y-2">
            <label htmlFor="dreamCareerOptions" className="text-sm font-medium text-gray-700">Dream Career Options</label>
            <input
              id="dreamCareerOptions"
              name="dreamCareerOptions"
              // placeholder="Your State"
              required
              onChange={(e) => handleChange(e)}
              defaultValue={formValues.dreamCareerOptions}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formErrors.dreamCareerOptions && <span className="text-xs text-red-500">{formErrors.dreamCareerOptions}</span>}
          </div>
        </div>
        <button
          type="submit"
          className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={(e) => handleSubmit(e)}
        >
          Register
        </button>
      </form>
      {/* <p className='mt-3'>Already have an account ?

            <Link to="/login" className='px-3 py-1 ml-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'> Login</Link>
          </p> */}
      {/* </div>
      </div> */}

    </>
  )
}

export default Registration;
