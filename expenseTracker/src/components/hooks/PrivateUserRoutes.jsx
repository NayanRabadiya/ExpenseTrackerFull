import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom';



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

export const PrivateUserRoutes = () => {

    const { auth, isLoading } = useAuth();
    if(isLoading){
        return <h1>Loading...</h1>;
    }
    return auth.isLoggedin? <Outlet /> : <Navigate to="/login/user" />
}
