import { createSlice } from '@reduxjs/toolkit'

const authTokenSlice = createSlice({
  name: 'AuthenticationSlice',
  initialState: {
    access_token: sessionStorage.getItem('access_token') || null,
    is_logged_in: !!sessionStorage.getItem('access_token'),
    user_id: sessionStorage.getItem('user_id') || null
  },
  reducers: {
    setAuthToken: (state, action) => {
      sessionStorage.setItem('access_token', action.payload.access_token);
      sessionStorage.setItem('user_id', action.payload.user_id);
      state.is_logged_in = true;
      state.access_token = action.payload.access_token;
      state.user_id = action.payload.user_id;
    },
    removeAuthToken: (state, action) => {
      sessionStorage.removeItem('access_token');
      state.is_logged_in = false;
      state.access_token = null;
      state.user_id = null;
    }
  }
});

export const { setAuthToken, removeAuthToken } = authTokenSlice.actions
export default authTokenSlice.reducer