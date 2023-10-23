import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ServerError } from "../models/serverError";

export type CommonReduxStoreType = {
  error: ServerError | null;
  token: string | null;
  appLoaded: boolean;
};

export const initialCommonReduxStoreType: CommonReduxStoreType = {
  error: null,
  token: localStorage.getItem("jwt"),
  appLoaded: false,
};

export const commonSlice = createSlice({
  name: "common",
  initialState: initialCommonReduxStoreType,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      console.log("Setting new token in Store");
      console.log(action.payload);
      state.token = action.payload;
    },
    logout: (state) => {
      state.token = null;
    },
    setAppLoaded:(state)=>{
      state.appLoaded = true;
    }
    //TODO: Add more reducers
  },
});
