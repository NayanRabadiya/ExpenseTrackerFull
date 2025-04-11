import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/ResetPassword.css";
import { toast } from "react-toastify";


export const ResetPassword = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const token = useParams().token;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const onSubmit = async (data) => {
    // console.log(data)
    const obj = {
      password: data.password,
      token: token
    }

    try {
      const response = await toast.promise(axios.post("/resetpassword", obj), {
        pending: "resetting password...",
        success: "password reset! please login",
        error: {
          render({ data }) {
            // console.log(data.response.data.detail);
            return data.response.data?.detail || data?.message || "reset failed! Please try again.";
          }
        },
      });
      if (response.status == 200) {
        navigate("/login/user");
      }
    } catch (error) {
      console.error("password reset error:", error);
    }
  }

  const Validators = {
    passwordValidator: {
      required: {
        value: true,
        message: "Password is required",
      },
      minLength: {
        value: 6,
        message: "Password must be at least 6 characters",
      },
    },
    confirmPasswordValidator: {
      required: {
        value: true,
        message: "Confirm Password is required",
      },
      validate: (value, { password }) =>
        value === password || "Passwords do not match",
    },

  }



  return (
    <div className="reset-container">
      <div className="reset-card">
        <h1 className="title">Reset Password</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Password */}
          <label htmlFor="password">New Password:</label>
          <div className="input-wrapper">
            <input id="password" type={showPassword ? "text" : "password"} placeholder="Enter New Password" className={errors.password && "input-error"} {...register("password", Validators.passwordValidator)} />
            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
            <span className="reset-error-message">{errors.password?.message}</span>
          </div>

          {/* Confirm Password */}
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <div className="input-wrapper">
            <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm New Password" className={errors.confirmPassword && "input-error"} {...register("confirmPassword", Validators.confirmPasswordValidator)} />
            <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
            <span className="reset-error-message">{errors.confirmPassword?.message}</span>
          </div>

          {/* Submit Button */}
          <div className="reset-password-actions">
            <input type="submit" value="Reset" className="btn-reset" />
          </div>
        </form>
      </div>
    </div>
  );
};