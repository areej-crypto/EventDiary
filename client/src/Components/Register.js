import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { addUser } from "../Features/UserSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { RegValidations } from "../Validations/RegValidations";
import { Container } from "reactstrap";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const msg = useSelector((state) => state.user?.errorMessage || "");

  const {
    register,
    handleSubmit: submitForm,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(RegValidations),
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setProfilePreview(URL.createObjectURL(file)); 
      console.log("File selected:", file);
    }
  };

  const handleSubmit = (data) => {
    const formData = new FormData();
    formData.append('uname', name);
    formData.append('email', email);
    formData.append('password', password);
    if (profilePicture) formData.append('pic', profilePicture);
  
    dispatch(addUser(formData)).then((res) => {
      if (res.meta.requestStatus === 'fulfilled') {
        navigate('/login'); // Navigate after successful registration
      }
    });
  };

  return (
    <Container className="auth-container">
      <form className="auth-form" onSubmit={submitForm(handleSubmit)}>
        <h1>Register</h1>
        <section className="form">
          <div className="form-group">
            <input
              type="text"
              className="form-control"
              id="name"
              placeholder="Enter your name..."
              {...register("name", {
                value: name,
                onChange: (e) => setName(e.target.value),
              })}
            />
          </div>
          <p className="error">{errors.name?.message}</p>

          <div className="form-group">
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Enter your email..."
              {...register("email", {
                value: email,
                onChange: (e) => setEmail(e.target.value),
              })}
            />
          </div>
          <p className="error">{errors.email?.message}</p>

          <div className="form-group">
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Enter your password..."
              {...register("password", {
                value: password,
                onChange: (e) => setPassword(e.target.value),
              })}
            />
          </div>
          <p className="error">{errors.password?.message}</p>

          <div className="form-group">
            <input
              type="password"
              className="form-control"
              id="confirmPassword"
              placeholder="Confirm your password..."
              {...register("confirmPassword", {
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value),
              })}
            />
          </div>
          <p className="error">{errors.confirmPassword?.message}</p>

          <div className="form-group">
            <input
              type="file"
              className="form-control"
              id="profilePicture"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {profilePreview && (
            <div className="form-group">
              <img src={profilePreview} alt="Profile Preview" className="profile-preview" />
            </div>
          )}

          <button type="submit" className="btn btn-primary">
            REGISTER
          </button>
        {msg && (
  <p className="error">
    {typeof msg === 'string' ? msg : msg.error || 'Something went wrong'}
  </p>
)}

        </section>

        <div className="login-link">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </form>
    </Container>
  );
};

export default Register;
