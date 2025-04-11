import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Profile.css";
import { toast } from "react-toastify";

export const AdminProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [image, setImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  //  Load stored user data
  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData")) || {};
    setUserData(storedData);
    setImage(storedData.imgUrl);
  }, []);

  //  Handle input changes
  const handleInputChange = (e) => {
    setUserData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  //  Handle profile picture change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setSelectedFile(file);
    }
  };

  //  Handle form submission
  const handleSaveClick = async () => {

    if (!userData.name || !userData.contact) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      console.log("userData", userData);
      const formData = new FormData();

      formData.append("name", userData.name);
      formData.append("email", userData.email);
      formData.append("contact", userData.contact);
      formData.append("address", userData.address);
      formData.append("roleId", userData.roleId);

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }


      const res = await toast.promise(
        axios.put(`/user/${userData.id}`, formData),
        {
          pending: "Updating your profile...",
          success: "Profile updated successfully! 🎉",
          error: "Failed to update profile. Please try again.",
        }
      )

      console.log("Response:", res.data);
      if (res.data.imgUrl) {
        setImage(res.data.imgUrl); 
      }
      setUserData((prev) => ({ ...prev, ...res.data })); 
      localStorage.setItem("userData", JSON.stringify({ ...userData, ...res.data })); 

    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };


  //  Handle logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login/admin");
  };
  

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="title">My Profile</h2>

        {/*  Profile Photo Upload */}
        <div className="profile-photo">
          <img src={image || "../images/profile.jpg"} alt="Profile" />
          <input type="file" id="profilePic" accept="image/*" onChange={handleImageChange} />
          <label htmlFor="profilePic" className="upload-btn">Change Photo</label>
        </div>

        {/* Profile Form */}
        <form className="profile-form">
          <label>Name:</label>
          <input type="text" name="name" value={userData.name || ""} onChange={handleInputChange} />

          <label>Email:</label>
          <input type="email" name="email" value={userData.email || ""} readOnly />

          <label>Phone:</label>
          <input type="tel" name="contact" value={userData.contact || ""} onChange={handleInputChange} />

          <label>Address:</label>
          <textarea name="address" value={userData.address || ""} onChange={handleInputChange} rows="4"></textarea>

          <button type="button" className="btn btn-update" onClick={handleSaveClick}>
            Update Profile
          </button>
        </form>

        <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};
