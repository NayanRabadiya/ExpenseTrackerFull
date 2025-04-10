import { toast } from "react-toastify";
import React, { useEffect, useRef } from "react";
import "../styles/toast.css"; // Your custom styles

const ConfirmToastContent = ({ message, resolve, closeToast }) => {

  const yesBtnRef = useRef(null);
  const noBtnRef = useRef(null);

  useEffect(() => {
    document.body.classList.add("freeze-ui");
    const focusable = [yesBtnRef.current, noBtnRef.current];


    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        resolve(false);
        closeToast();
      }
      if (e.key === "Tab") {
        e.preventDefault();
        const current = document.activeElement;
        const currentIndex = focusable.indexOf(current);
        const nextIndex = (currentIndex + (e.shiftKey ? -1 : 1) + focusable.length) % focusable.length;
        focusable[nextIndex]?.focus();
      }

    };

    requestAnimationFrame(() => {
      yesBtnRef.current?.focus();
    });
    document.addEventListener("keydown", handleKeyDown);
    yesBtnRef.current?.focus();

    return () => {
      document.body.classList.remove("freeze-ui");
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleClick = (choice) => {
    resolve(choice);
    closeToast();
  };

  return (
    <div className="confirm-toast-overlay">
      <div className="confirm-toast-wrapper">
        <p>{message}</p>
        <div className="confirm-buttons">
          <button className="confirm-btn yes" ref={yesBtnRef}  onClick={() => handleClick(true)}>Yes</button>
          <button className="confirm-btn no"  ref={noBtnRef} onClick={() => handleClick(false)}>No</button>
        </div>
      </div>
    </div>
  );
};

export const ConfirmToast = (message) => {
  return new Promise((resolve) => {
    toast(
      (toastProps) => (
        <ConfirmToastContent
          {...toastProps}
          message={message}
          resolve={resolve}
          closeToast={toastProps.closeToast}
        />
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        pauseOnHover: false,
        closeButton: false,
        hideProgressBar: true,
        className: "override-confirm-toast",    // for outer Toastify container
        bodyClassName: "confirm-toast-body",    // for body
        transition: null,                        // IMPORTANT: disables JS transitions
        position: "top-left",                    // must set something, but overridden by CSS
      }
    );
  });
};
