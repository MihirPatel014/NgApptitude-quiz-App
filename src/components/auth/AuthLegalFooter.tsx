import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../common/constant';

interface AuthLegalFooterProps {
    className?: string;
}

const AuthLegalFooter: React.FC<AuthLegalFooterProps> = ({ className = "" }) => {
    return (
        <div className={`text-center ${className}`}>
            <div className="flex justify-center space-x-6">
                <Link to={ROUTES.PRIVACY_POLICY} className="text-xs text-gray-400 hover:text-blue-500 transition-colors">Privacy Policy</Link>
                <Link to={ROUTES.TERMS_CONDITIONS} className="text-xs text-gray-400 hover:text-blue-500 transition-colors">Terms & Conditions</Link>
                <Link to={ROUTES.REFUND_POLICY} className="text-xs text-gray-400 hover:text-blue-500 transition-colors">Refund Policy</Link>
                <Link to={ROUTES.CONTACT_US} className="text-xs text-gray-400 hover:text-blue-500 transition-colors">Contact Us</Link>
            </div>
            <p className="mt-2 text-[10px] text-gray-300 uppercase tracking-widest">
                &copy; {new Date().getFullYear()} National Computers
            </p>
        </div>
    );
};

export default AuthLegalFooter;
