import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "../../schema/app_state_schema";

export const globalDataSlice = createSlice({
  name: "global",
  initialState: {
    state: new AppState({}),
  },
  reducers: {
    setAppState: (state, action) => {
      state.state = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setAppState } = globalDataSlice.actions;

export default globalDataSlice.reducer;
