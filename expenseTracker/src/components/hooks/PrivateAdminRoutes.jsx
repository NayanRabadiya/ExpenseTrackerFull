// Route guard for /admin: shows admin pages only to a logged-in admin.
// Note this only gates the UI — the API itself has no auth, so it is a
// navigation convenience, not a security boundary.
import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom';



// Reads the login marker saved at login and reports whether it says "Admin".
const useAuth = () => {
    const [auth, setauth] = useState({ isLoggedin: false, role: null });
    const [isLoading, setisLoading] = useState(true);

    useEffect(() => {
        const id = localStorage.getItem("userid");
        const role = localStorage.getItem("role");
        if (id && String(role || "").toLowerCase() == "admin") {
            setauth({ isLoggedin: true, role: role });
        }
        setisLoading(false);
    }, []);

    return { auth, isLoading };
}

// Renders the nested admin routes, or redirects to the admin login.
export const PrivateAdminRoutes = () => {

    const { auth, isLoading } = useAuth();
    if(isLoading){
        return <h1>Loading...</h1>;
    }
    return auth.isLoggedin? <Outlet /> : <Navigate to="/login/admin" />
}
