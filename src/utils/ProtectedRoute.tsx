import { lookInSession } from "../common/session"
import { Outlet, Navigate } from 'react-router-dom';
import { ROUTES } from "../common/routes";

const ProtectedRoute = () => {
    const isLoggedIn: boolean = Boolean(lookInSession('user'));
    return isLoggedIn === true ? <Outlet /> : <Navigate to={ROUTES.LOGIN} />;
}

export default ProtectedRoute