import { createSlice } from '@reduxjs/toolkit'

const authTokenSlice = createSlice({
  name: 'AuthenticationSlice',
  initialState: {
    authToken: sessionStorage.getItem('access_token') || null,
    isLoggedIn: !!sessionStorage.getItem('access_token')
  },
  reducers: {
    setAuthToken: (state, action) => {
      sessionStorage.setItem('access_token', action.payload.access_token);
      state.isLoggedIn = true;
      state.authToken = action.payload.access_token
    },
    removeAuthToken: (state, action) => {
      sessionStorage.removeItem('access_token');
      state.isLoggedIn = false;
      state.authToken = null;
    }
  }
});

export const { setAuthToken, removeAuthToken } = authTokenSlice.actions
export default authTokenSlice.reducer