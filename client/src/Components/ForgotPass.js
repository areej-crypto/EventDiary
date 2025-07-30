import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword, resetFlags } from "../Features/UserSlice";
import { useNavigate } from 'react-router-dom';

const ForgotPass = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isLoading, isSuccess, isError, errorMessage, isResetCodeSent } = useSelector((state) => state.user);

  useEffect(() => {
    if (isResetCodeSent) {
      // Redirect to reset password page with email as a query parameter
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      // Reset flags to avoid residual state
      dispatch(resetFlags());
    }
  }, [isResetCodeSent, navigate, email, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(forgotPassword(email));
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="form-title">Forgot Password</h2>
        <div className="form-group">
          <input
            type="email"
            className="form-control"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Code"}
        </button>
        {isSuccess && !isResetCodeSent && (
          <p className="success-message">Reset code sent successfully! Please check your email.</p>
        )}
        {isError && <p className="error-message">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default ForgotPass;
