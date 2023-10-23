import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type ModalReduxStoreType = {
  open: boolean;
  elementName: string | null;
};

export const initialModalReduxStoreType: ModalReduxStoreType = {
  open: false,
  elementName: null,
};

export const modalSlice = createSlice({
  name: "modal",
  initialState: initialModalReduxStoreType,
  reducers: {
    openModal: (
      state: ModalReduxStoreType,
      action: PayloadAction< string>
    ) => {
      state.open = true;
      state.elementName = action.payload;
    },
    closeModal: (state: ModalReduxStoreType) => {
      state.open = false;
      state.elementName = null;
    },
  },
});
