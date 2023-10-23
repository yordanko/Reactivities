import {
  ThunkMiddleware,
  combineReducers,
  configureStore,
  createStore,
} from "@reduxjs/toolkit";
import { activitySlice } from "./activitySlice";
import { commentSlice } from "./commentSlice";
import { commonSlice } from "./commonSlice";
import { modalSlice } from "./modalSlice";
import { profileSlice } from "./profileSlice";
import { userSlice } from "./userSlice";
import thunk from "redux-thunk";
import { enableMapSet } from "immer";
import { useDispatch } from "react-redux";
export const reduxStore = configureStore({
  reducer: combineReducers({
    activityReducer: activitySlice.reducer,
    commentReducer: commentSlice.reducer,
    commonReducer: commonSlice.reducer,
    modalReducer: modalSlice.reducer,
    profileReducer: profileSlice.reducer,
    userReducer: userSlice.reducer,
  }),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default reduxStore;
export type ReduxDispatch = typeof reduxStore.dispatch;
export const useAppDispatch: () => ReduxDispatch = useDispatch;
export type ReduxRootState = ReturnType<typeof reduxStore.getState>;
