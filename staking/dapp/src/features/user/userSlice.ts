import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    dataAccountId: "",
    data: {},
    dataAccExists: false,
    ataExists: false,
    tokenBalance: "0",
  },
  reducers: {
    setUserDataAccountId: (state, action) => {
      state.dataAccountId = action.payload;
    },
    setUserPdaExists: (state, action) => {
      state.dataAccExists = action.payload;
    },
    setUserAtaExists: (state, action) => {
      state.ataExists = action.payload;
    },
    setUserData: (state, action) => {
      state.data = action.payload;
    },
    setTokenBalance: (state, action) => {
      state.tokenBalance = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {
  setUserData,
  setUserDataAccountId,
  setUserPdaExists,
  setUserAtaExists,
  setTokenBalance,
} = userSlice.actions;

export default userSlice.reducer;
