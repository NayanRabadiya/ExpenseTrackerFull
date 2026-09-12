// Route guard for /user: shows user pages only to someone logged in.
// Note this only gates the UI — the API itself has no auth, so it is a
// navigation convenience, not a security boundary.
import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom';



// Reads the login marker saved at login; any stored user id counts as logged in.
const useAuth = () => {
    const [auth, setauth] = useState({ isLoggedin: false, role: null });
    const [isLoading, setisLoading] = useState(true);

    useEffect(() => {
        const id = localStorage.getItem("userid");
        const role = localStorage.getItem("role");
        if (id ) {
            setauth({ isLoggedin: true, role: role });
        }
        setisLoading(false);
    }, []);

    return { auth, isLoading };
}

// Renders the nested user routes, or redirects to the user login.
export const PrivateUserRoutes = () => {

    const { auth, isLoading } = useAuth();
    if(isLoading){
        return <h1>Loading...</h1>;
    }
    return auth.isLoggedin? <Outlet /> : <Navigate to="/login/user" />
}
