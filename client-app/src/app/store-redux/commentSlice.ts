import { HubConnection } from "@microsoft/signalr";
import { ChatComment } from "../models/comment";
import { createSlice } from "@reduxjs/toolkit";

export type CommentReduxSoreType = {
  comments: ChatComment[];
  hubConnection: HubConnection | null;
};

export const initialReduxStoreType = {
  comments: [],
  hubConnection: null,
};

export const commentSlice = createSlice({
  name: "comments",
  initialState: initialReduxStoreType,
  reducers: {
    //TODO
  },
});
