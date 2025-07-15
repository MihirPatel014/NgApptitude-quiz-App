import React, { useState } from 'react';
import Login from './Login';
import Registration from './Registration';

const AnimatedForm = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);

  const handleSignUpClick = () => {
    setIsRightPanelActive(true);
  };

  const handleSignInClick = () => {
    setIsRightPanelActive(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gray-100">
      <div
        className={`bg-white rounded-lg shadow-lg relative overflow-hidden w-full
          max-w-[1024px] 
          h-[600px] sm:h-[700px] md:h-[550px] lg:h-[550px]  2xl:h-[650px]
          max-h-full`}
      >
        {/* Mobile Overlay (Only visible on small screens) */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-gray-700 to-gray-800 md:hidden z-[200] flex items-center justify-center">
          <h1 className="text-xl font-bold text-white">
            {isRightPanelActive ? 'Create Account' : 'Sign In'}
          </h1>
        </div>

        {/* Sign Up / Registration Container */}
        <div
         className={`absolute flex flex-col px-10 items-center justify-start md:justify-center transition-all duration-1
           0 ease-in-out w-full md:w-1/2 md:pt-56 lg:pt-52 xl:pt-46 2xl:pt-30
          ${isRightPanelActive 
            ? 'opacity-100 z-[5] translate-y-20 md:translate-y-0 md:translate-x-full' 
            : 'opacity-0 z-[1] pointer-events-none translate-y-full md:translate-y-0 md:translate-x-full'}
          top-0 h-[calc(100%-5rem)] md:h-full overflow-y-auto pb-20 md:pb-3 sm:mb-5`}
      >
          {/* <Registration  setIST/> */}
          <Registration setIsRightPanelActive={setIsRightPanelActive} />


        </div>

        {/* Sign In / Login Container */}
        <div
          className={`absolute flex flex-col px-10 items-center justify-center transition-all duration-600 ease-in-out w-full md:w-1/2 
            ${isRightPanelActive 
              ? 'opacity-0 z-[1] pointer-events-none -translate-y-full md:translate-y-0 md:translate-x-full' 
              : 'opacity-100 z-[5] translate-y-20 md:translate-y-0 md:translate-x-0'}
            top-0 h-[calc(100%-5rem)] md:h-full`}
        >
          <Login />
        </div>

        {/* Desktop Overlay Container (Hidden on mobile) */}
        <div
          className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600 ease-in-out z-[100]
            hidden md:block
            ${isRightPanelActive ? '-translate-x-full' : ''}`}
        >
          <div
            className={`bg-gradient-to-r from-gray-700 to-gray-800 text-white relative left-[-100%] h-full w-[200%] transform transition-transform duration-600 ease-in-out
              ${isRightPanelActive ? 'translate-x-1/2' : 'translate-x-0'}`}
          >
            {/* Overlay Left */}
            <div className="absolute top-0 flex flex-col items-center justify-center w-1/2 h-full px-10 text-center transition-transform ease-in-out transform translate-x-0 duration-600">
              <h1 className="mb-5 text-3xl font-bold">Welcome Back!</h1>
              <p className="mb-8 text-sm leading-5 tracking-wider">
                To keep connected with us please login with your personal info
              </p>
              <button
                className="py-3 text-xs font-bold tracking-wider text-white uppercase transition-transform bg-transparent border-2 border-white rounded-full px-11 hover:bg-white hover:text-gray-800"
                onClick={handleSignInClick}
              >
                Sign In
              </button>
            </div>

            {/* Overlay Right */}
            <div className="absolute top-0 right-0 flex flex-col items-center justify-center w-1/2 h-full px-10 text-center transition-transform ease-in-out transform translate-x-0 duration-600">
              <h1 className="mb-5 text-3xl font-bold">Hello, Friend!</h1>
              <p className="mb-8 text-sm leading-5 tracking-wider">
                Enter your personal details and start your journey with us
              </p>
              <button
                className="py-3 text-xs font-bold tracking-wider text-white uppercase transition-transform bg-transparent border-2 border-white rounded-full px-11 hover:bg-white hover:text-gray-800"
                onClick={handleSignUpClick}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation (Only visible on small screens) */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-r from-gray-700 to-gray-800 md:hidden z-[200] flex items-center justify-center">
          <button
            className="px-8 py-2 text-xs font-bold tracking-wider text-white uppercase transition-transform bg-transparent border-2 border-white rounded-full hover:bg-white hover:text-gray-800"
            onClick={isRightPanelActive ? handleSignInClick : handleSignUpClick}
          >
            {isRightPanelActive ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnimatedForm;
