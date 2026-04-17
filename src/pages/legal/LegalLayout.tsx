import React from 'react';
import { ArrowLeft, ShieldCheck, FileText, RefreshCcw, MessageSquare } from 'lucide-react';
import { ROUTES } from '../../common/constant';
import { Link, useNavigate } from 'react-router-dom';

interface LegalLayoutProps {
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

const LegalLayout: React.FC<LegalLayoutProps> = ({ title, children, icon }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-inter text-gray-800">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate(ROUTES.HOME)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </button>
            
            <Link to={ROUTES.HOME} className="flex items-center space-x-2">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                NG-Santvana
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <main 
        key={title}
        className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 animate-fade-slide-up"
      >
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-4 text-blue-600">
            {icon}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight">
            {title}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {title === "Contact Us" ? "We are here to help you succeed." : `Your trust is our priority. Please read our ${title.toLowerCase()} carefully.`}
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white shadow-xl shadow-blue-900/5 rounded-3xl border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-12 prose prose-blue max-w-none">
            {children}
          </div>
        </div>

        {/* Legal Navigation Footer */}
        <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to={ROUTES.PRIVACY_POLICY}
            className="flex items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200 group text-center"
          >
            <ShieldCheck className="w-5 h-5 mr-0 sm:mr-2 mb-2 sm:mb-0 text-gray-400 group-hover:text-blue-500" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Privacy Policy</span>
          </Link>
          <Link
            to={ROUTES.TERMS_CONDITIONS}
            className="flex items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200 group text-center"
          >
            <FileText className="w-5 h-5 mr-0 sm:mr-2 mb-2 sm:mb-0 text-gray-400 group-hover:text-blue-500" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Terms & Conditions</span>
          </Link>
          <Link
            to={ROUTES.REFUND_POLICY}
            className="flex items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200 group text-center"
          >
            <RefreshCcw className="w-5 h-5 mr-0 sm:mr-2 mb-2 sm:mb-0 text-gray-400 group-hover:text-blue-500" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Refund Policy</span>
          </Link>
          <Link
            to={ROUTES.CONTACT_US}
            className="flex items-center justify-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200 group text-center"
          >
            <MessageSquare className="w-5 h-5 mr-0 sm:mr-2 mb-2 sm:mb-0 text-gray-400 group-hover:text-blue-500" />
            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Contact Us</span>
          </Link>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} National Computers. All rights reserved.
        </div>
      </main>
    </div>
  );
};

export default LegalLayout;
