import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "../../schema/app_state";
import { AppStore } from "../../schema/app_store";

export const globalDataSlice = createSlice({
  name: "global",
  initialState: {
    state: AppState.dummy().toJSON(),
    store: AppStore.dummy().toJSON(),
  },
  reducers: {
    setAppState: (state, action) => {
      state.state = action.payload;
    },
    setAppStore: (state, action) => {
      state.store = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setAppState, setAppStore } = globalDataSlice.actions;

export default globalDataSlice.reducer;
