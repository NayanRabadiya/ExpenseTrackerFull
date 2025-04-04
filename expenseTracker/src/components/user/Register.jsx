import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "../styles/register.css";
import axios from "axios";
import { toast } from "react-toastify";
import { UserNavbar } from "./UserNavbar";

export const Register = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, } = useForm();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data) => {


    const regdata = {
      name: data.name,
      contact: data.contact,
      email: data.email,
      password: data.password,
      roleId: "67c7e9367afd6879270eb871"
    };

    // console.log(regdata);

    const response = await toast.promise(axios.post("/user", regdata), {
      pending: "Registering your account...",
      success: "Registration successful! 🎉",
      error: {


        render({ data }) {
          return data.response.data?.message || data?.message || "Registration failed! Please try again.";
        },
      },
    });

    if (response.status === 200)
      navigate("/login/user");
  };


  const Validators = {
    nameValidator: {
      required: {
        value: true,
        message: "Full Name is required"
      },
      minLength: {
        value: 5,
        message: "Name must consist of atleast 5 character"
      }
    },
    contactValidator: {
      required: {
        value: true,
        message: "Contact is required"
      },
      pattern: {
        value: /^[0-9]{10}$/,
        message: "Enter a valid 10-digit number",
      },
    },
    roleValidator: {
      required: {
        value: true,
        message: "Role is required"
      },

    },
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
    <>

      <UserNavbar></UserNavbar>
      <div className="register-container">
        <div className="register-card">
          <h1 className="title">Register</h1>
          <form onSubmit={handleSubmit(onSubmit)}>

            {/* Full Name */}
            <label htmlFor="name">Full Name:</label>
            <div className="input-wrapper">
              <input id="name" type="text" placeholder="Enter Full Name" autoComplete="name" className={errors.name && "input-error"}
                {...register("name", Validators.nameValidator)} />
              <span className="register-error-message">{errors.name?.message}</span>
            </div>

            {/* Contact No */}
            <label htmlFor="contact">Contact No.:</label>
            <div className="input-wrapper">
              <input id="contact" type="text" placeholder="Enter contact no." autoComplete="phone" className={errors.contact && "input-error"}
                {...register("contact", Validators.contactValidator)} />
              <span className="register-error-message">{errors.contact?.message}</span>
            </div>


            {/* Email */}
            <label htmlFor="email">Email:</label>
            <div className="input-wrapper">
              <input id="email" type="email" placeholder="Enter Email address" autoComplete="email" className={errors.email && "input-error"}
                {...register("email", Validators.emailValidator)} />
              <span className="register-error-message">{errors.email?.message}</span>
            </div>

            {/* Password */}
            <label htmlFor="password">Password:</label>
            <div className="input-wrapper">
              <input id="password" type={showPassword ? "text" : "password"} placeholder="Enter Password" className={errors.password && "input-error"} {...register("password", Validators.passwordValidator)} />
              <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
              <span className="register-error-message">{errors.password?.message}</span>
            </div>

            {/* Confirm Password */}
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <div className="input-wrapper">
              <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" className={errors.confirmPassword && "input-error"} {...register("confirmPassword", Validators.confirmPasswordValidator)} />
              <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
              <span className="register-error-message">{errors.confirmPassword?.message}</span>
            </div>


            {/* Submit Button */}
            <div className="register-actions">
              <input type="submit" value="Register" className="btn-register" />
            </div>
          </form>

          {/* Login Link */}
          <p className="login-link">
            Already have an account? <Link to="/login/user">Login</Link>
          </p>
        </div>
      </div>
    </>

  );
};
