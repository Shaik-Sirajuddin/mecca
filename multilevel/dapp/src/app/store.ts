import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice";
import globalReducer from "../features/global/globalSlice";
const store = configureStore({
  reducer: {
    user: userReducer,
    global: globalReducer,
  },
});
export default store;

export type IRootState = ReturnType<typeof store.getState>;
