import React, { useState } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useContext } from 'react'
import { UserContext } from '../provider/UserProvider'
import { removeFromSession, logOutUser } from "../common/session"
import { PiStudent } from "react-icons/pi";
import { MdQuiz } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { FaRegCalendar } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import Logo from "../assests/images/checklist.png"
export const NavbarAndSidebar = () => {

    let { userAuth, setUserAuth } = useContext(UserContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const navigate = useNavigate();

    const handleLogOut = () => {
        removeFromSession(userAuth);
        logOutUser();
        navigate("/login")
    }


    return (
        <>
            <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="px-3 py-3 lg:px-5 lg:pl-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center justify-start rtl:justify-end">
                            <button data-drawer-target="logo-sidebar" data-drawer-toggle="logo-sidebar" aria-controls="logo-sidebar" type="button" className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
                                <span className="sr-only">Open sidebar</span>
                                <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
                                </svg>
                            </button>
                            <a href="/" className="flex ms-2 md:me-24">
                                <img width="50" height="50" src={Logo} alt="NGAptitudeLogo" />
                                <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">NGAptitude</span>
                            </a>
                        </div>

                        <div className="flex items-center ms-3">
                            <button
                                id="dropdownUserAvatarButton"
                                className="flex text-xl bg-gray-200 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-100"
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)} // Toggle dropdown visibility
                            >
                                <span className="sr-only">Open user menu</span>
                                <img className="w-8 h-8 rounded-full" src="https://flowbite.com/docs/images/people/profile-picture-5.jpg" alt="user photo" />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && ( // Show dropdown when isDropdownOpen is true
                                <div
                                    id="dropdownAvatar"
                                    className="absolute right-0 z-10 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow-md top-full w-44 dark:bg-gray-700 dark:divide-gray-600"
                                >
                                    <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                        <div>{userAuth ? userAuth.email.split("@")[0] : ""}</div>
                                        <div className="font-medium truncate">{userAuth ? userAuth.email : ""}</div>
                                    </div>
                                    <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                                        <li>
                                            <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Dashboard</a>
                                        </li>
                                        <li>
                                            <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Settings</a>
                                        </li>
                                        <li>
                                            <a href="#" className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Earnings</a>
                                        </li>
                                    </ul>
                                    <div className="py-2">
                                        <a href="#" onClick={handleLogOut} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
                                            Sign out
                                        </a>
                                    </div>
                                </div>
                            )}

                        </div>

                    </div>
                </div>
            </nav >

            <aside id="logo-sidebar" className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700" aria-label="Sidebar">
                <div className="h-full px-3 pb-4 overflow-y-auto bg-white dark:bg-gray-800">
                    <ul className="space-y-2 font-medium">
                        <li>
                            <a href="/" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <svg className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21">
                                    <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                                    <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                                </svg>
                                <span className="ms-3">Dashboard</span>
                            </a>
                        </li>
                        <li>
                            <a href="/subscription" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">

                                <FaRegCalendar size={20} className='w-5 h-5 text-gray-500 transition duration-75 shrink-0 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white' />
                                <span className="flex-1 ms-3 whitespace-nowrap">My Subscriptions</span>
                            </a>
                        </li>
                        <li>
                            <a href="/quizpage" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">

                                <MdQuiz size={20} className='w-5 h-5 text-gray-500 transition duration-75 shrink-0 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white' />
                                <span className="flex-1 ms-3 whitespace-nowrap">Quiz</span>
                            </a>
                        </li>
                        <li>
                            <a href="/edit-profile" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">

                                <FaUser size={20} className='w-5 h-5 text-gray-500 transition duration-75 shrink-0 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white' />
                                <span className="flex-1 ms-3 whitespace-nowrap">Edit Profile</span>
                            </a>
                        </li>
                        {/* <li>
                            <a href="/quizpage" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <IoMdSettings size={20} className='w-5 h-5 text-gray-500 transition duration-75 shrink-0 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white' />
                                <span className="flex-1 ms-3 whitespace-nowrap">Security</span>
                            </a>
                        </li> */}
                    </ul>
                </div>
            </aside>

            <div className="p-4 sm:ml-64 mt-14">
                <Outlet />
            </div>

        </>)
}
export default NavbarAndSidebar;