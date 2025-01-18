'use client'

import { useState, useEffect } from 'react'
import { GetUser, registerUser } from "../../utils/api"
import { Link } from 'react-router-dom';


const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// Phone regex
const phoneRegex = /^[0-9]{10}$/;

type RegistrationValues = {
  email: string,
  password: string,
  fullName: string,
  dob: string,
  grade: string,
  medium: string,
  school: string,
  contact: number,
  city: string,
  state: string
}


export const Registration = () => {
  const [formValues, setFormValues] = useState<RegistrationValues>({
    email: "",
    password: "",
    fullName: "",
    dob: "",
    grade: '',
    medium: '',
    school: '',
    contact: 0,
    city: '',
    state: ''
  });
  const [passwordVisibile, setPasswordVisible] = useState(false);

  // const [formValues, setFormValues] = useState<RegistrationValues>();
  const [formErrors, setFormErrors] = useState<RegistrationValues>({
    email: "",
    password: "",
    fullName: "",
    dob: "",
    grade: '',
    medium: '',
    school: '',
    contact: 0,
    city: '',
    state: ''
  });
  // useEffect(() => {
  //   console.log(formValues);  // This will log after formValues has been updated.
  // }, [formValues]);




  // useEffect(() => {
  //   GettingUser();
  // }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {

    const { name, value } = e.target
    
    setFormValues({
      ...formValues,
      [name]: name === 'dob' ? new Date(value).toISOString().split('T')[0] : value, // Special handling for 'dob' field
    });
  };




  const GettingUser = async () => {
    const allusers = await GetUser();
    console.log(allusers);
    return true;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // const errors = validate(formValues);
    // setFormErrors(errors);

    // if (Object.keys(errors).length > 0) {
    //   return; // Stop form submission if there are errors
    // }

    console.log(validate(formValues))
    // setFormValues(validate(formValues));

    // Form is valid, proceed with form submission (you can replace this with your API call)
    try {
       const formData = { ...formValues }; // Create form data object
       const response = await registerUser(formData);
      // console.log('Form submitted:', formData);
    } catch (err: any) {
      console.log(err.message);
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
    }

    if (!values.fullName) {
      errors.fullName = 'Full name is required';
    }

    if (!values.dob || values.dob == "") {
      errors.dob = 'Date of birth is required';
    }

    if (!values.grade) {
      errors.grade = 'Grade/Class is required';
    }

    if (!values.medium) {
      errors.medium = 'Language is required';
    }

    if (!values.school) {
      errors.school = 'School/College name is required';
    }

    if (!values.contact) {
      errors.contact = 'Contact number is required';
    } else if (!phoneRegex.test(values.contact)) {
      errors.contact = 'Contact number should be 10 digits';
    }

    if (!values.city) {
      errors.city = 'City is required';
    }

    if (!values.state) {
      errors.state = 'State is required';
    }
    setFormErrors(errors)


    // if (errors.length > 0) {
    //   return false;
    // } else {
    //   true;
    // }
    return errors;

  };
  return (
    <>
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-100">
        <div className="w-full p-6 bg-white border border-gray-200 rounded-lg shadow md:w-3/6 dark:bg-gray-800 dark:border-gray-700">
          <div>
            <h1 className="mb-4 text-3xl font-bold text-center">Student Register</h1>
            <p className="mb-6 text-center">Please fill in your details to register</p>
          </div>
          <form id='formElement' className="space-y-4" >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    type={passwordVisibile ? "text" : "password"}
                    // placeholder="Enter Password"
                    required
                    onChange={(e) => handleChange(e)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={formValues.password}
                  />               
                </div>
                {formErrors.password && <span className="text-xs text-red-500">{formErrors.password}</span>}
              </div>
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
                <input
                  id="fullname"
                  name="fullName"
                  // placeholder="John Doe"
                  required
                  onChange={(e) => handleChange(e)}
                  defaultValue={formValues.fullName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.fullName && <span className="text-xs text-red-500">{formErrors.fullName}</span>}
              </div>
              <div className="space-y-2">
                <label htmlFor="dob" className="text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  required
                  onChange={handleChange}
                  value={formValues.dob}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.dob && <span className="text-xs text-red-500">{formErrors.dob}</span>}
              </div>
              <div className="space-y-2">
                <label htmlFor="grade" className="text-sm font-medium text-gray-700">Grade/Class</label>
                <select
                  id="grade"
                  name="grade"
                  defaultValue={formValues.grade}
                  onChange={(e) => handleChange(e)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Choose Grade</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                </select>
                {formErrors.grade && <span className="text-xs text-red-500">{formErrors.grade}</span>}
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
                <label htmlFor="school" className="text-sm font-medium text-gray-700">School/College Name</label>
                <input
                  id="school"
                  name="school"
                  // placeholder="ABC School"
                  required
                  onChange={(e) => handleChange(e)}
                  defaultValue={formValues.school}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.school && <span className="text-xs text-red-500">{formErrors.school}</span>}
              </div>

              <div className="space-y-2">
                <label htmlFor="contact" className="text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  id="contact"
                  name="contact"
                  type="number"
                  // placeholder="1234567890"
                  required
                  onChange={(e) => handleChange(e)}
                  defaultValue={formValues.contact}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formErrors.contact && <span className="text-xs text-red-500">{formErrors.contact}</span>}
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
            </div>
            <button
              type="submit"
              className="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={(e) => handleSubmit(e)}
            >
              Register
            </button>
          </form>
          <p className='mt-3'>Already have an account ?

            <Link to="/login" className='px-3 py-1 ml-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'> Login</Link>
          </p>
        </div>
      </div>

    </>
  )
}

export default Registration;
