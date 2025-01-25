import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "../../schema/app_state";

export const globalDataSlice = createSlice({
  name: "global",
  initialState: {
    state: AppState.dummy().toJSON(),
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
