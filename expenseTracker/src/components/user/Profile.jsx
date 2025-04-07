import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Profile.css";

export const Profile = () => {
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
    try {
      console.log("userData", userData);
      const formData = new FormData();
      
      formData.append("name", userData.name);
      formData.append("email", userData.email);
      formData.append("contact", userData.contact);
      formData.append("address", userData.address);
      formData.append("roleId", userData.roleId);
      // formData.append("image", selectedFile);
  
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      const res = await axios.put(`/user/${userData.id}`, formData);
  
      console.log("Response:", res.data);
  
      //  Check if API returns the new image URL
      if (res.data.imgUrl) {
        setImage(res.data.imgUrl); // Update the displayed image
        setUserData((prev) => ({ ...prev, imgUrl: res.data.imgUrl })); // Update userData
        localStorage.setItem("userData", JSON.stringify({ ...userData, imgUrl: res.data.imgUrl })); // Store updated data
      }
  
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };
  

  //  Handle logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login/user");
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
