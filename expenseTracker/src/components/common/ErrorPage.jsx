// components/common/Errorpage.jsx
// 404 page shown by the catch-all "*" route.
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/errorpage.css';
// Renders the "not found" message with a way back.
export const Errorpage = () => {
    const navigate = useNavigate();

    return (
        <div className="error-container">
            <div className="error-wrapper">

                <h1 className="error-code">404</h1>
                <h2 className="error-title">Oops! Page not found.</h2>
                <p className="error-message">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <button className="error-button" onClick={() => navigate('/')}>
                    Go to Home
                </button>
            </div>
        </div>
    );
};
