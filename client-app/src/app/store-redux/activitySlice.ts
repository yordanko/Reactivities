import { PayloadAction,  createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { Activity, UserActivity } from "../models/activity";
import { PageParams, PageResult, Pagination } from "../models/pagination";
import { ReduxRootState } from "./store";
import agent from "../api/agent";
import { User } from "../models/user";

export const DEFAULT_PAGE_NUMBER = 1;
export const DEFAULT_PAGE_SIZE = 2;

export type ActivityReduxSoreType = {
  activityRegistry: Array<Activity>;
  selectedActivity?: Activity;
  editMode: boolean;
  loading: boolean;
  loadingInitial: boolean;
  pagination: Pagination | null;
  pageParams: PageParams;
  predicate: Array<{ key: string; action: boolean | Date }>;
};

export const initialActivityReduxSore: ActivityReduxSoreType = {
  activityRegistry: [],
  selectedActivity: undefined,
  editMode: false,
  loading: false,
  loadingInitial: false,
  pagination: null,
  pageParams: { pageNumber: DEFAULT_PAGE_NUMBER, pageSize: DEFAULT_PAGE_SIZE },
  predicate: [{ key: "all", action: true }],
};

export const axiosParams = (state: ActivityReduxSoreType): URLSearchParams => {
  const params = new URLSearchParams();
  params.append("pageNumber", state.pageParams.pageNumber.toString());
  params.append("pageSize", state.pageParams.pageSize.toString());
  state.predicate.forEach((value) => {
    if (value.key === "startDate") {
      params.append(value.key, (value.action as Date).toISOString());
    } else {
      params.append(value.key, value.action.toString());
    }
  });

  return params;
};

export const activitySlice = createSlice({
  name: "activities",
  initialState: initialActivityReduxSore,
  reducers: {
    setPageParams: (
      state: ActivityReduxSoreType,
      action: PayloadAction<PageParams>
    ) => {
      state.pageParams = action.payload;
    },
    setPredicate: (
      state: ActivityReduxSoreType,
      action: PayloadAction<{ predicated: string; value: boolean | Date }>
    ) => {
      const resetPredicate = () => {
        state.predicate.forEach((value, index) => {
          if (value.key !== "startDate") state.predicate.splice(index, 1);
        });
      };
      switch (action.payload.predicated) {
        case "all":
          resetPredicate();
          state.predicate.push({ key: "all", action: true });
          break;
        case "isGoing":
          resetPredicate();
          state.predicate.push({ key: "isGoing", action: true });
          break;
        case "isHost":
          resetPredicate();
          state.predicate.push({ key: "isHost", action: true });
          break;
        case "startDate":
          const startDateIndex = state.predicate.findIndex(
            (item) => item.key === "startDate"
          );
          state.predicate[startDateIndex].action = action.payload.value;
          break;
      }
    },
    setActivity(state: ActivityReduxSoreType, action: PayloadAction<UserActivity>) {

      const {user, activity} = action.payload;
      if(user){
        activity.isGoing = activity.attendees!.some(
          (a) => a.username === user.username
        );
        activity.isHost = activity.hostUsername === user.username;
        activity.host = activity.attendees?.find(
          (x) => x.username === activity.hostUsername
        );
      }
      activity.date = new Date(activity.date!);

      //new activity
      if (state.activityRegistry.findIndex((a) => a.id === activity.id) === -1){
        state.activityRegistry.push(activity);
      }
      else{
        //update existing
        const activityIndexToUpdate = state.activityRegistry.findIndex((a) => a.id === activity.id); 
        state.activityRegistry[activityIndexToUpdate] = activity;
      }
    },
    setLoadingInitial(
      state: ActivityReduxSoreType,
      action: PayloadAction<boolean>
    ) {
      state.loadingInitial = action.payload;
    },
    setPagination(
      state: ActivityReduxSoreType,
      action: PayloadAction<Pagination | null>
    ) {
      state.pagination = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      getDashboardActivity.fulfilled,
      (
        state: ActivityReduxSoreType,
        action: PayloadAction<PageResult<Activity[]>>
      ) => {
        console.log(action.payload);
        state.pagination = action.payload.pagination;
        action.payload.data.forEach(activity => { state.activityRegistry.push(activity)});
      }
    );
  },
});

export const getDashboardActivity = createAsyncThunk(
  "activity/getDashboardActivity",
  async (_, { getState, dispatch }) => {
    console.log("inside createAsyncThunk");

    //build page parameters from current store state
    const state: ReduxRootState = getState();
    const searchParams = new URLSearchParams();
    const { pageParams, predicate } = state.activityReducer as ActivityReduxSoreType;
    searchParams.append("pageNumber", pageParams.pageNumber.toString());
    searchParams.append("pageSize", pageParams.pageSize.toString());

    //set predicate array
    predicate.forEach(
      (loopPredicate: { key: string; action: boolean | Date }) => {
        if (loopPredicate.key === "startDate") {
          searchParams.append(
            loopPredicate.key,
            (loopPredicate.action as Date).toISOString()
          );
        } else {
          searchParams.append(
            loopPredicate.key,
            loopPredicate.action.toString()
          );
        }
      }
    );
    await dispatch(activitySlice.actions.setLoadingInitial(true));
    //get activities
    const result: PageResult<Activity[]> = await agent.Activities.listPage(
      searchParams
    );

    console.log(result);

    //build activities
    result.data.forEach((activity) => {
      if (state.userReducer.user as User) {
        activity.isGoing = activity.attendees!.some(
          (a) => a.username === state.userReducer.user.username
        );
        activity.isHost =
          activity.hostUsername === state.userReducer.user.username;
        activity.host = activity.attendees?.find(
          (x) => x.username === activity.hostUsername
        );
      }
      activity.date = new Date(activity.date!);
    });
    await dispatch(activitySlice.actions.setLoadingInitial(false));

    return result;
  }
);
