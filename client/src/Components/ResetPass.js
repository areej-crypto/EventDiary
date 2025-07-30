import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyResetCode, resetPassword, resetFlags } from '../Features/UserSlice';

const ResetPass = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Extract email from query parameters
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email') || '';

  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Local state to track if reset code is verified
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [errors, setErrors] = useState({});

  const { isLoading, isSuccess, isError, errorMessage, isCodeVerified: isCodeVerifiedRedux, isPasswordReset } = useSelector((state) => state.user);

  useEffect(() => {
    if (isCodeVerifiedRedux) {
      setIsCodeVerified(true);
      // Reset flags to avoid residual state
      dispatch(resetFlags());
    }
    if (isPasswordReset) {
      alert('Password has been reset successfully!');
      navigate('/login'); // Redirect to login page or any other page
      // Reset flags to avoid residual state
      dispatch(resetFlags());
    }
  }, [isCodeVerifiedRedux, isPasswordReset, navigate, dispatch]);

  // Password validation function
  const validatePassword = () => {
    const newErrors = {};

    // New password validation
    if (newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters.';
    } else if (!/[a-zA-Z]/.test(newPassword)) {
      newErrors.newPassword = 'New password must contain at least one letter.';
    } else if (!/[0-9]/.test(newPassword)) {
      newErrors.newPassword = 'New password must contain at least one number.';
    } else if (/[^a-zA-Z0-9]/.test(newPassword)) {
      newErrors.newPassword = 'New password cannot contain symbols.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    if (!email || !resetCode) {
      alert('Email and Reset Code are required.');
      return;
    }
    dispatch(verifyResetCode({ email, resetCode }));
  };

  const handleResetPassword = (e) => {
    e.preventDefault();

    // Validate new password before submitting
    if (!validatePassword()) {
      return; // Don't submit if validation fails
    }

    dispatch(resetPassword({ email, resetCode, newPassword }));
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={!isCodeVerified ? handleVerifyCode : handleResetPassword}>
        <h2 className="form-title">Reset Password</h2>

        {!isCodeVerified ? (
          <>
            <div className="form-group">
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                readOnly
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                placeholder="Enter the reset code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </>
        ) : (
          <>
            <div className="form-group">
              <input
                type="password"
                className="form-control"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              {errors.newPassword && <small className="error-text" style={{ color: 'red' }}>{errors.newPassword}</small>}
            </div>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </>
        )}

        {/* Display messages */}
        {isError && <p className="error-message">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default ResetPass;
