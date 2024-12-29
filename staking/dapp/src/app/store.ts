import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice";
import globalReducer from "../features/globalData/globalDataSlice";
const store = configureStore({
  reducer: {
    user: userReducer,
    global: globalReducer,
  },
});
export default store;

export type IRootState = ReturnType<typeof store.getState>;
