import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

//CREATE A POST 
export const createPost = createAsyncThunk(
  'post/createPost',
  async (formData, { rejectWithValue }) => {
    try {
      // formData includes userId, textContent, image
      const response = await axios.post('http://127.0.0.1:8080/createPost', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Error in createPost:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

//FETCH ALL POSTS 
export const fetchPosts = createAsyncThunk(
  'post/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('http://127.0.0.1:8080/posts');
      return response.data;
    } catch (error) {
      console.error('Error in fetchPosts:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

//DELETE A POST
export const deletePost = createAsyncThunk(
  'post/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await axios.delete(`http://127.0.0.1:8080/posts/${postId}`);
      // Return the deleted postId so it can be removed from the store
      return postId;
    } catch (error) {
      console.error('Error in deletePost:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// UPDATE A POST 
export const updatePost = createAsyncThunk(
  'post/updatePost',
  async ({ postId, textContent }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`http://127.0.0.1:8080/posts/${postId}`, { textContent });
      return response.data; // Expected to return the updated post
    } catch (error) {
      console.error('Error in updatePost:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// LIKE A POST
export const likePost = createAsyncThunk(
  'post/likePost',
  async ({ postId, userId }, { rejectWithValue }) => {
    try {
      // Calls POST /posts/:id/like, sending userId in body
      const response = await axios.post(`http://127.0.0.1:8080/posts/${postId}/like`, {
        userId
      });
      return response.data; // The updated post with new likes
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// REMIND 
export const remindPost = createAsyncThunk(
  'post/remindPost',
  async ({ postId, userId }, { rejectWithValue }) => {
    try {
      await axios.post(`http://127.0.0.1:8080/posts/${postId}/remind`, { userId });
      return { postId };
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);


// COMMENT ON A POST
export const commentPost = createAsyncThunk(
  'post/commentPost',
  async ({ postId, userName, text, userId }, { rejectWithValue }) => {
    try {
      // Calls POST /posts/:id/comment, sending userName and text
      const response = await axios.post(`http://127.0.0.1:8080/posts/${postId}/comment`, {
        userName,
        text,
        userId
      });
      return response.data; // The updated post with new comments
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

//DELETE COMMENT 
export const deleteComment = createAsyncThunk(
  'post/deleteComment',
  async ({ postId, commentId }, { rejectWithValue }) => {
    try {
      // DELETE /posts/:postId/comment/:commentId
      const response = await axios.delete(`http://127.0.0.1:8080/posts/${postId}/comment/${commentId}`);
      return response.data; // The updated post
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


// NLP MODERATION
export const moderatePost = createAsyncThunk(
  'post/moderatePost',
  async ({ userEmail, post_text }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:8080/moderatePost',
        { userEmail, post_text },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data.prediction;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  posts: [],
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: ''
};

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    resetPostState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.errorMessage = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE POST
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.errorMessage = '';
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Insert new post at the top of the array
        state.posts.unshift(action.payload.post);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || 'Failed to create post';
      })

      // FETCH POSTS
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.posts = action.payload; // Overwrite with fresh list
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || 'Failed to fetch posts';
      })
      
      // DELETE POST
      .addCase(deletePost.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.errorMessage = '';
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Remove the deleted post from the state.posts array
        state.posts = state.posts.filter(post => post._id !== action.payload);
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || 'Failed to delete post';
      })
            // UPDATE POST
            .addCase(updatePost.pending, (state) => {
              state.isLoading = true;
              state.isError = false;
              state.isSuccess = false;
              state.errorMessage = '';
            })
            .addCase(updatePost.fulfilled, (state, action) => {
              state.isLoading = false;
              state.isSuccess = true;
              const index = state.posts.findIndex(post => post._id === action.payload._id);
              if (index !== -1) {
                state.posts[index] = action.payload;
              }
            })
            .addCase(updatePost.rejected, (state, action) => {
              state.isLoading = false;
              state.isError = true;
              state.errorMessage = action.payload || 'Failed to update post';
            })
            // LIKE POST
      .addCase(likePost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(likePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Replace the old post in state.posts with the updated one
        const updatedPost = action.payload; // The updated post from server
        const index = state.posts.findIndex((p) => p._id === updatedPost._id);
        if (index !== -1) {
          state.posts[index] = updatedPost;
        }
      })
      .addCase(likePost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || 'Failed to like post';
      })

      // COMMENT POST
      .addCase(commentPost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(commentPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Replace the old post in state.posts with the updated one
        const updatedPost = action.payload; // The updated post from server
        const index = state.posts.findIndex((p) => p._id === updatedPost._id);
        if (index !== -1) {
          state.posts[index] = updatedPost;
        }
      })
      .addCase(commentPost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || 'Failed to comment on post';
      })
      // DELETE COMMENT
      .addCase(deleteComment.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        const updatedPost = action.payload;
        const index = state.posts.findIndex((p) => p._id === updatedPost._id);
        if (index !== -1) {
          state.posts[index] = updatedPost;
        }
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || 'Failed to delete comment';
      })
      .addCase(moderatePost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(moderatePost.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(moderatePost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload;
      })
    .addCase(remindPost.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(remindPost.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
    })
    .addCase(remindPost.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload || 'Failed to set reminder';
    });
    }
  });

 

/*
      //MODERATION
      .addCase(moderatePost.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(moderatePost.fulfilled, (state, action) => {
        state.isLoading = false;
        // You can update state with the prediction if needed.
        // For example, you might store a flag if the post is offensive.
        state.moderationPrediction = action.payload;
      })
      .addCase(moderatePost.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload || 'Failed to moderate post';
      });
  
  },*/




export const { resetPostState } = postSlice.actions;
export default postSlice.reducer;
