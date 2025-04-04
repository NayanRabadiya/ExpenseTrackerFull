import React from 'react'
import { useForm } from 'react-hook-form'
import "../styles/ForgotPassword.css"
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const ForgotPassword = () => {

    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm();

    const Validators = {
        emailValidator: {
            required: {
                value: true,
                message: "Email is required"
            },
            pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Invalid email format",
            },
        },
    }

    const onSubmit = async (data) => {
        try {

            const response = await toast.promise(axios.post("/forgotpassword", data), {
                pending: "sending email...",
                success: "check your mail for reset link",
                error: {
                    render({ data }) {
                        return data?.response?.data?.detail || data?.message || "reset failed! Please try again.";
                    }
                },
            },{autoClose:10000});

            if (response.status == 200) {
                navigate("/login/user/user");
            }
            
        } catch (error) {
            console.error("forgot password error:", error);
        }
    }

    return (
        <div className="forgot-container">
            <div className="forgot-card">
                <h1 className="title">Forgot Password</h1>
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/* Email*/}
                    <label htmlFor="email">Email:</label>
                    <div className="input-wrapper">
                        <input type="text" id="email" autoComplete="email" placeholder="Enter Email address" className={errors.email && "input-error"} {...register("email", Validators.emailValidator)} />
                        <span className="forgot-password-error-message">{errors.email?.message}</span>
                    </div>

                    {/* Submit Button */}
                    <div className="forgot-password-actions">
                        <input type="submit" value="Reset Password" className="btn-forgot" />
                    </div>
                </form>


            </div>
        </div>
    )
}
