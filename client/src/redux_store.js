import { configureStore } from '@reduxjs/toolkit'
import auth_token_slice from "./auth_token_store/auth_token_slice.js";
export default configureStore({
  reducer: {
    authTokenSlice: auth_token_slice
  },
});