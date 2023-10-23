import { createSlice } from "@reduxjs/toolkit";
import { Profile, UserActivity } from "../models/profile";

export type ProfileReduxStoreType = {
  profile: Profile | null;
  loadingProfile: boolean;
  uploading: boolean;
  loading: boolean;
  followings: Profile[];
  loadingFollowings: boolean;
  activeTab: number;
  userActivities: UserActivity[];
  loadingActivities: boolean;
};

export const initialProfileReduxStoreType: ProfileReduxStoreType = {
  profile: null,
  loadingProfile: false,
  uploading: false,
  loading: false,
  followings: [],
  loadingFollowings: false,
  activeTab: 0,
  userActivities: [],
  loadingActivities: false,
};

export const profileSlice = createSlice({
  name: "profile",
  initialState: initialProfileReduxStoreType,
  reducers: {
    //TODO
  },
});
