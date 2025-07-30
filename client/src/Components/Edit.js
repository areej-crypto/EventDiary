import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../Features/UserSlice";
import { useNavigate } from "react-router-dom";
import { Form, FormGroup, Label, Input, Button } from "reactstrap";

const Edit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, isError, errorMessage } = useSelector(
    (state) => state.user
  );

  // Initialize profile data directly from Redux user (or fallback to localStorage)
  const initialUser = user || JSON.parse(localStorage.getItem("user"));
  if (!initialUser) {
    navigate("/login");
  }

  const [profileData, setProfileData] = useState({
    uname: initialUser ? initialUser.uname : "",
    email: initialUser ? initialUser.email : "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    profilePic: null,
  });

  const [errors, setErrors] = useState({});

  // Update profileData if user changes
  useEffect(() => {
    if (initialUser) {
      setProfileData((prev) => ({
        ...prev,
        uname: initialUser.uname,
        email: initialUser.email,
      }));
    }
  }, [initialUser]);

  const validate = () => {
    const newErrors = {};
    if (!profileData.uname.trim()) {
      newErrors.uname = "Username is required.";
    } else if (profileData.uname.length < 3) {
      newErrors.uname = "Username must be at least 3 characters.";
    }

    if (profileData.oldPassword && profileData.oldPassword.length < 8) {
      newErrors.oldPassword = "Old password must be at least 8 characters.";
    }

     // Must be at least 8 characters, contain both letters and numbers, and no symbols
  if (profileData.newPassword) {
    if (profileData.newPassword.length < 8) {
      newErrors.newPassword = "New password must be at least 8 characters.";
    } else if (!/[a-zA-Z]/.test(profileData.newPassword)) {
      newErrors.newPassword = "New password must contain at least one letter.";
    } else if (!/[0-9]/.test(profileData.newPassword)) {
      newErrors.newPassword = "New password must contain at least one number.";
    } else if (/[^a-zA-Z0-9]/.test(profileData.newPassword)) {
      newErrors.newPassword = "New password cannot contain symbols.";
    }
  }

    if (
      profileData.newPassword &&
      profileData.newPassword !== profileData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setProfileData({
      ...profileData,
      profilePic: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentUser = user || JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
      alert("No user found. Please log in again.");
      navigate("/login");
      return;
    }

    if (!validate()) {
      return;
    }

    const formData = new FormData();
    formData.append("userId", currentUser.id);
    formData.append("uname", profileData.uname);
    formData.append("email", profileData.email);
    formData.append("password", profileData.oldPassword);
    formData.append("newPassword", profileData.newPassword);
    if (profileData.profilePic) {
      formData.append("pic", profileData.profilePic);
    }

    try {
      // Unwrap  to get the updated user data
      const updatedUser = await dispatch(updateProfile(formData)).unwrap();
      // Update localStorage immediately so that all components reflect the change
      localStorage.setItem("user", JSON.stringify(updatedUser));
      navigate("/profile");
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const handleCancel = () => {
    navigate("/profile");
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <h2 className="edit-profile-title">Edit Profile</h2>
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <FormGroup>
            <Label for="uname" className="edit-label">
              Username
            </Label>
            <Input
              type="text"
              id="uname"
              name="uname"
              value={profileData.uname}
              onChange={handleInputChange}
              required
            />
            {errors.uname && (
              <small className="error-text" style={{ color: "red" }}>
                {errors.uname}
              </small>
            )}
          </FormGroup>

          <FormGroup>
            <Label for="email" className="edit-label">
              Email
            </Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              disabled
            />
          </FormGroup>

          <FormGroup>
            <Label for="oldPassword" className="edit-label">
              Old Password
            </Label>
            <Input
              type="password"
              id="oldPassword"
              name="oldPassword"
              placeholder="Enter your current password"
              value={profileData.oldPassword}
              onChange={handleInputChange}
            />
            {errors.oldPassword && (
              <small className="error-text" style={{ color: "red" }}>
                {errors.oldPassword}
              </small>
            )}
          </FormGroup>

          <FormGroup>
            <Label for="newPassword" className="edit-label">
              New Password
            </Label>
            <Input
              type="password"
              id="newPassword"
              name="newPassword"
              placeholder="Enter a new password"
              value={profileData.newPassword}
              onChange={handleInputChange}
            />
            {errors.newPassword && (
              <small className="error-text" style={{ color: "red" }}>
                {errors.newPassword}
              </small>
            )}
          </FormGroup>

          <FormGroup>
            <Label for="confirmPassword" className="edit-label">
              Confirm New Password
            </Label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your new password"
              value={profileData.confirmPassword}
              onChange={handleInputChange}
            />
            {errors.confirmPassword && (
              <small className="error-text" style={{ color: "red" }}>
                {errors.confirmPassword}
              </small>
            )}
          </FormGroup>

          <FormGroup>
            <Label for="profilePic" className="edit-label">
              Profile Picture
            </Label>
            <Input
              type="file"
              id="profilePic"
              name="profilePic"
              onChange={handleFileChange}
            />
          </FormGroup>

          {isError && <div className="error-message">{errorMessage}</div>}

          <div className="edit-profile-buttons-vertical">
            <Button type="submit" color="primary" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" color="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Edit;
