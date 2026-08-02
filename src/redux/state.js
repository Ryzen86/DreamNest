import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  listings: [],
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
    },
    setListings: (state, action) => {
      state.listings = action.payload.listings;
    },
    setTripList: (state, action) => {
      if (!state.user) return;
      state.user.tripList = action.payload;
    },
    setWishList: (state, action) => {
      if (!state.user) return;
      state.user.wishList = action.payload;
    },
    setPropertyList: (state, action) => {
      if (!state.user) return;
      state.user.propertyList = action.payload;
    },
    setReservationList: (state, action) => {
      if (!state.user) return;
      state.user.reservationList = action.payload;
    },
    setUserRole: (state, action) => {
      if (state.user) {
        state.user.role = action.payload;
      }
    },
    prependListing: (state, action) => {
      const listing = action.payload;
      if (!listing?._id) return;
      state.listings = [
        listing,
        ...(state.listings || []).filter((l) => l._id !== listing._id),
      ];
    },
  },
});

export const {
  setLogin,
  setLogout,
  setListings,
  setTripList,
  setWishList,
  setPropertyList,
  setReservationList,
  setUserRole,
  prependListing,
} = userSlice.actions;
export default userSlice.reducer;
