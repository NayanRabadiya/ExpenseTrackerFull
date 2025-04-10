import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "../styles/login.css";
import axios from "axios";
import { toast } from "react-toastify";
import { UserNavbar } from "./UserNavbar";

export const Login = () => {

  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    try {

        
        const response = await toast.promise(axios.post("/login/user", data), {
            pending: "Logging in...",
        success: "Login successful! 🎉",
        error: {
          render({ data }) {
            return data?.response?.data?.message || data?.message || "Login failed! Please try again.";
        }
        },
    });
    
    // console.log(response.data);
    
    if (response.status == 200 ) {
        localStorage.clear();
        localStorage.setItem("userData", JSON.stringify(response.data));
        localStorage.setItem("userid", response.data.id);
        localStorage.setItem("role", response.data.role.name);
        navigate("/user/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

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
    passwordValidator: {

      required: {
        value: true,
        message: "Password is required",
      },
      minLength: {
        value: 6,
        message: "Password must be at least 6 characters",
      },
    }
  }

  return (
    <>
      <UserNavbar></UserNavbar>
      <div className="login-container">
        <div className="login-card">
          <h1 className="title">Login</h1>
          <form onSubmit={handleSubmit(onSubmit)}>

            {/* Email*/}
            <label htmlFor="email">Email:</label>
            <div className="input-wrapper">
              <input type="text" id="email" autoComplete="email" placeholder="Enter Email address" className={errors.email && "input-error"} {...register("email", Validators.emailValidator)} />
              <span className="login-error-message">{errors.email?.message}</span>
            </div>


            {/* Password */}
            <label htmlFor="password">Password:</label>
            <div className="input-wrapper">
              <input id="password" type={showPassword ? "text" : "password"} placeholder="Enter Password" className={errors.password && "input-error"} {...register("password", Validators.passwordValidator)} />
              <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
              <span className="login-error-message">{errors.password?.message}</span>
            </div>

            <p className="forgot-password-link">
              <Link to="/forgotpassword">Forgot Password?</Link>
            </p>
            {/* Submit Button */}
            <div className="actions">
              <input type="submit" value="Login" className="btn-login" />
            </div>
          </form>

          <p className="register-link">
            Don't have an account? <Link to="/register">SignUp</Link>
          </p>
        </div>
      </div>
    </>
  );
};
