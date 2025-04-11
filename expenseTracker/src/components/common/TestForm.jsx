//temporary for testing


import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { Bounce, toast, ToastContainer } from "react-toastify";
import { UserNavbar } from "../user/UserNavbar";

export const TestForm = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, } = useForm();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const onSubmit = async (data) => {

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('contact', data.contact);
        formData.append('address', 'to aambardi gondal rajkot');
        formData.append('roleId', '67c7e9367afd6879270eb871');
        formData.append('image', data.image[0]);

        console.log(formData);

        toast.promise(
            axios.post("/user/url", formData).then((res) => {
                if (res.status === 200) {
                    navigate("/login/user");
                    return res.data; // Resolves toast with success
                } else {
                    throw new Error("Unexpected response status"); // Triggers error toast
                }
            }),
            {
                pending: "Registering your account...",
                success: "Registration successful! 🎉",
                error: {
                    render({ data }) {
                        return data.response?.data?.message || "Registration failed! Please try again.";
                    },
                },
            })
            .catch((error) => console.error("Registration error:", error));
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
        }
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
                            <span className="error-message">{errors.name?.message}</span>
                        </div>

                        <label htmlFor="image">image</label>
                        <div className="input-wrapper">
                            <input id="image" type="file" {...register("image")} ></input>
                        </div>

                        {/* Contact No */}
                        <label htmlFor="contact">Contact No.:</label>
                        <div className="input-wrapper">
                            <input id="contact" type="text" placeholder="Enter contact no." autoComplete="tel" className={errors.contact && "input-error"}
                                {...register("contact", Validators.contactValidator)} />
                            <span className="error-message">{errors.contact?.message}</span>
                        </div>

                        {/* Role */}
                        {/* <label htmlFor="role">Role:</label>
          <div className="input-wrapper">
            {/* <input id="role" type="text" placeholder="Enter contact no." className={errors.contact && "input-error"}
              {...register("contact", Validators.contactValidator)}/> 
            <select id="role" {...register("roleId", Validators.roleValidator)}>
              <option value="">-- Select --</option>
              <option value="67beb0ca6873669e17f490e9">User</option>
              <option value="67beb0a46873669e17f490e8">Admin</option>
            </select>
            <span className="error-message">{errors.roleId?.message}</span>
          </div> */}

                        {/* Email */}
                        <label htmlFor="email">Email:</label>
                        <div className="input-wrapper">
                            <input id="email" type="email" placeholder="Enter Email address" autoComplete="email" className={errors.email && "input-error"}
                                {...register("email", Validators.emailValidator)} />
                            <span className="error-message">{errors.email?.message}</span>
                        </div>

                        {/* Password */}
                        <label htmlFor="password">Password:</label>
                        <div className="input-wrapper">
                            <input id="password" type={showPassword ? "text" : "password"} placeholder="Enter Password" className={errors.password && "input-error"} {...register("password", Validators.passwordValidator)} />
                            <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </span>
                            <span className="error-message">{errors.password?.message}</span>
                        </div>

                        {/* Confirm Password */}
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <div className="input-wrapper">
                            <input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" className={errors.confirmPassword && "input-error"} {...register("confirmPassword", Validators.passwordValidator)} />
                            <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </span>
                            <span className="error-message">{errors.confirmPassword?.message}</span>
                        </div>


                        {/* Submit Button */}
                        <div className="actions">
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
