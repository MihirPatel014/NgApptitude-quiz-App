
import { lookInSession } from "../common/session"
import { Outlet, Navigate } from 'react-router-dom';

const ProtectedRoute = () => {
    const isLoggedIn: boolean = Boolean(lookInSession('user'));
    return isLoggedIn === true ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute