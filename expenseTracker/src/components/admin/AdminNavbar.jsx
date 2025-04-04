import { Link, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Navbar.css";
import { Button } from "@mui/material";

export const AdminNavBar = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".sidebar") && !event.target.closest(".menu-btn")) {
                setIsSidebarOpen(false);
            }
        };

        if (isSidebarOpen) {
            document.addEventListener("click", handleClickOutside);
        }
        return () => document.removeEventListener("click", handleClickOutside);

    }, [isSidebarOpen]);

    return (
        <>
            <div className="navbar-wrapper">
                <nav className="navbar">
                    {/* Logo */}
                    <h2 className="logo">
                        <Link to={"/admin/dashboard"} onClick={() => navigate("/admin/dashboard")}>
                            <img src="/images/logo.jpg" alt="Logo" /> Expense Tracker Admin
                        </Link>
                    </h2>

                    {/* Menu Button (for mobile) */}
                    <button className="menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        ☰
                    </button>

                    {/* Navbar Links (for large screens) */}
                    <ul className="nav-links">
                        {/* <li><Link className="link" to="/sample">Sample</Link></li> */}
                        <li><Link className="link" to="/admin/dashboard">Dashboard</Link></li>
                        <li><Link className="link" to="/admin/profile">Profile</Link></li>
                        <li><Link className="link" to="/admin/users">Users</Link></li>
                        <li><Link className="link" to="/admin/categories">Categories</Link></li>
                    </ul>

                    {/* Sidebar (for small screens) */}
                    <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
                        <ul>
                            {/* <li><Link className="link" to="/sample" onClick={() => setIsSidebarOpen(false)}>Sample</Link></li> */}
                            <li><Link className="link" to="/admin/dashboard" onClick={() => setIsSidebarOpen(false)}>Dashboard</Link></li>
                            <li><Link className="link" to="/admin/profile" onClick={() => setIsSidebarOpen(false)}>Profile</Link></li>
                            <li><Link className="link" to="/admin/users" onClick={() => setIsSidebarOpen(false)}>Users</Link></li>
                            <li><Link className="link" to="/admin/categories" onClick={() => setIsSidebarOpen(false)}>Categories</Link></li>
                        </ul>
                    </div>
                </nav>
            </div>
            <Outlet />
        </>
    );
};
