import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Predefined Admin Credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin12345';

// Async thunk for adding a new user (registration)
export const addUser = createAsyncThunk(
  'user/addUser',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://127.0.0.1:8080/insertUser', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Error in addUser:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message ||  'Failed to register' );
    }
  }
);

// Async thunk for logging in
export const loginUser = createAsyncThunk(
  'user/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Check if credentials match admin credentials
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Return admin user object
        return {
          user: {
            id: 'admin123', 
            uname: 'Admin',
            email: ADMIN_EMAIL,
            role: 'admin',
            pic: '', // Add default admin profile picture
          },
        };
      }

      // Otherwise, proceed with regular login via API
      const response = await axios.post('http://127.0.0.1:8080/login', { email, password });
      
      //  backend returns an object with a 'user' property
      return response.data;
    } catch (error) {
      console.error('Error in loginUser:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || 'Login failed');
    }
  }
);

// Async thunk for logging out
export const performLogout = createAsyncThunk(
  'user/performLogout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://127.0.0.1:8080/logout');
      return response.data;
    } catch (error) {
      console.error('Error in performLogout:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || 'Logout failed');
    }
  }
);

// Async thunk for "Forgot Password"
export const forgotPassword = createAsyncThunk(
  'user/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://127.0.0.1:8080/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Error in forgotPassword:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Async thunk for verifying reset code
export const verifyResetCode = createAsyncThunk(
  'user/verifyResetCode',
  async ({ email, resetCode }, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://127.0.0.1:8080/verify-reset-code', { email, resetCode });
      return response.data;
    } catch (error) {
      console.error('Error in verifyResetCode:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || 'Verification failed');
    }
  }
);

// Async thunk for "Reset Password"
export const resetPassword = createAsyncThunk(
  'user/resetPassword',
  async ({ email, resetCode, newPassword }, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://127.0.0.1:8080/reset-password', { email, resetCode, newPassword });
      return response.data;
    } catch (error) {
      console.error('Error in resetPassword:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || 'Error resetting password');
    }
  }
);

// Async thunk for updating user profile
export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('http://127.0.0.1:8080/edit-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Error in updateProfile:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state with separate flags
const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: '',
  isResetCodeSent: false,       // Flag for forgotPassword
  isCodeVerified: false,       // Flag for verifyResetCode
  isPasswordReset: false,      // Flag for resetPassword
  isProfileUpdated: false,     // Flag for updateProfile
};

// Create slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.errorMessage = '';
      localStorage.removeItem('user');
      // Reset all flags
      state.isResetCodeSent = false;
      state.isCodeVerified = false;
      state.isPasswordReset = false;
      state.isProfileUpdated = false;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    resetFlags: (state) => {
      state.isSuccess = false;
      state.isError = false;
      state.errorMessage = '';
      state.isResetCodeSent = false;
      state.isCodeVerified = false;
      state.isPasswordReset = false;
      state.isProfileUpdated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // addUser cases
      .addCase(addUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = '';
        state.isSuccess = false;
      })
      .addCase(addUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(addUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || 'Failed to register user';
      })

      // loginUser cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = '';
        state.isSuccess = false;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.errorMessage = '';
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || 'Login failed';
      })

      // performLogout cases
      .addCase(performLogout.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = '';
      })
      .addCase(performLogout.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = null;
        localStorage.removeItem('user');
      })
      .addCase(performLogout.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || 'Logout failed';
      })

      // forgotPassword cases
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = '';
        state.isSuccess = false;
        state.isResetCodeSent = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isResetCodeSent = true;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || 'Failed to send reset code';
      })

      // verifyResetCode cases
      .addCase(verifyResetCode.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = '';
        state.isSuccess = false;
      })
      .addCase(verifyResetCode.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isCodeVerified = true;
      })
      .addCase(verifyResetCode.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || 'Failed to verify reset code';
      })

      // resetPassword cases
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = '';
        state.isSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isPasswordReset = true;
        state.user = null;
        localStorage.removeItem('user');
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || 'Failed to reset password';
      })

      // updateProfile cases
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = '';
        state.isSuccess = false;
        state.isProfileUpdated = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isProfileUpdated = true;
        state.user = action.payload.user; // Assuming backend returns updated user
        state.errorMessage = '';
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || 'Failed to update profile';
      });
  },
});

export const { logout, updateUser, resetFlags } = userSlice.actions;
export default userSlice.reducer;
