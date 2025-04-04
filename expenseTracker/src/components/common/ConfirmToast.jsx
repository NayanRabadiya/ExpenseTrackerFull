//-------------- not in use --------------


import React, { useEffect } from "react";
import { toast } from "react-toastify";
import "../styles/toast.css";

export const ConfirmToast = (message, onConfirm) => {
    // Add 'freeze-ui' className to <body> when toast opens
    useEffect(() => {
        document.body.classList.add("freeze-ui");
        return () => {
            document.body.classList.remove("freeze-ui");
        };
    }, []);

    toast(
        ({ closeToast }) => (
            <div className="confirm-toast-overlay">
                <div className="confirm-toast-wrapper">
                    <p>{message}</p>
                    <div className="confirm-buttons">
                        <button
                            className="confirm-btn yes"
                            onClick={() => {
                                onConfirm();
                                closeToast();
                            }}
                        >
                            Yes
                        </button>
                        <button className="confirm-btn no" onClick={closeToast}>
                            No
                        </button>
                    </div>
                </div>
            </div>
        ),
        { autoClose: false, closeOnClick: false, draggable: false } // Prevent accidental closure
    );
};