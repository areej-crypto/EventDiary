import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../Features/UserSlice"; // Redux action
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { LoginValidations } from "../Validations/LoginValidations"; 
import { Container } from "reactstrap";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user and error/success states from Redux store
  const { user, isLoading, isError, errorMessage, isSuccess } = useSelector((state) => state.user);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(LoginValidations),
  });

  const onSubmit = (data) => {
    dispatch(loginUser({ email: data.email, password: data.password }));
  };

  // Clear any existing user data when the Login page loads,
  // so that the Redux state starts as null.
  useEffect(() => {
    localStorage.removeItem('user');
  }, []);

  // Redirect user after a successful login
  useEffect(() => {
    // Only redirect if login has been successful and we have a valid user object
    if (user && isSuccess) {
      // Persist user data in localStorage (for other parts of the app)
      localStorage.setItem('user', JSON.stringify(user));

      // Check user role and navigate accordingly
      if (user.role === 'admin') {
        navigate('/admin-dashboard'); // Redirect admin to AdminDash
      } else {
        navigate('/content-feed'); // Redirect regular users to ContentFeed
      }
    }
  }, [user, isSuccess, navigate]);

  return (
    <Container className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <h1>Login</h1>
        <section className="form">
          <div className="form-group">
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Enter your email..."
              {...register("email")}
              required
            />
          </div>
          <p className="error">{errors.email?.message}</p>

          <div className="form-group">
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Enter your password..."
              {...register("password")}
              required
            />
          </div>
          <p className="error">{errors.password?.message}</p>

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'LOGIN'}
          </button>

          {isError && <p className="error">{errorMessage}</p>}
        </section>

        <div className="forgot-password-link">
          <p>
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>
        </div>

        <div className="register-link">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </form>
    </Container>
  );
};

export default Login;
