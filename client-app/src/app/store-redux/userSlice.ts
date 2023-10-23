import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { User, UserFormValues } from "../models/user";
import { router } from "../router/Routes";
import reduxStore, { ReduxRootState } from "./store";
import agent from "../api/agent";
import { commonSlice } from "./commonSlice";
import { useSelector } from "react-redux";
import { modalSlice } from "./modalSlice";

export type UserReduxStoreType = {
  user: User | null;
  fbLogin: boolean;
  refreshTokenTimeout?: any;
};

export const initialUserReduxStore: UserReduxStoreType = {
  user: null,
  fbLogin: false,
};

export const IsUserLoggedIn = ()=>{
  const user = useSelector((state:ReduxRootState)=>state.userReducer.user);
  return !!user;
}

export const userSlice = createSlice({
  name: "user",
  initialState: initialUserReduxStore,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      console.log(action.payload);
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
    fbLogin(state){
      
    },
    //TODO: Add more reducers
  },
  extraReducers: (builder) => {
    builder.addCase(
      loginUser.fulfilled,
      (state, action: PayloadAction<User>) => {
        state.user = action.payload;
      }
    );

    builder.addCase(
      getUser.fulfilled, (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    });
  },
});

export const loginUser = createAsyncThunk(
  "account/login",
  async (userForm: UserFormValues, { dispatch }) => {
    console.log(`"loginUser is called with values ${JSON.stringify(userForm)}."`);
    const user: User = await agent.Account.login(userForm);
    await dispatch(commonSlice.actions.setToken(user.token));
    await dispatch(userSlice.actions.login(user));
    //router.navigate('/activities');
    dispatch(modalSlice.actions.closeModal());

    return user;
  }
);

export const getUser = createAsyncThunk<User>(
  "account",
  async () => {
    const user: User = await agent.Account.current();
    return user;
  }
);
