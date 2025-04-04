import { Link, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Navbar.css";

export const UserNavbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
            <Link to={"/"}>
            <img src="/images/logo.jpg" alt="Logo" /> Expense Tracker
            </Link>
          </h2>

          {/* Menu Button (for mobile) */}
          <button className="menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            ☰
          </button>

          {/* Navbar Links (for large screens) */}
          <ul className="nav-links">
            {/* <li><Link className="link" to="/sample">Sample</Link></li> */}
            <li><Link className="link" to="/user/dashboard">Dashboard</Link></li>
            <li><Link className="link" to="/user/expenses">Expenses</Link></li>
            <li><Link className="link" to="/user/reports">Reports</Link></li>
            <li><Link className="link" to="/user/profile">Profile</Link></li>
            <li><Link className="link" to="/user/budget-form">Budget</Link></li>
          </ul>

          {/* Sidebar (for small screens) */}
          <div className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
            <ul>
              {/* <li><Link className="link" to="/sample" onClick={() => setIsSidebarOpen(false)}>Sample</Link></li> */}
              <li><Link className="link" to="/user/dashboard" onClick={() => setIsSidebarOpen(false)}>Dashboard</Link></li>
              <li><Link className="link" to="/user/expenses" onClick={() => setIsSidebarOpen(false)}>Expenses</Link></li>
              <li><Link className="link" to="/user/reports" onClick={() => setIsSidebarOpen(false)}>Reports</Link></li>
              <li><Link className="link" to="/user/profile" onClick={() => setIsSidebarOpen(false)}>Profile</Link></li>
              <li><Link className="link" to="/user/budget-form" onClick={() => setIsSidebarOpen(false)}>Budget</Link></li>
            </ul>
          </div>
        </nav>
      </div>
      <Outlet />
    </>
  );
};
