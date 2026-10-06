import { configureStore } from '@reduxjs/toolkit';
import {
  isAuthLoginReducer,
  isAuthLogoutReducer,
  isAuthRegisterReducer,
} from './features/auth/states/reducer';
import {
  isChangeProfilePasswordReducer,
  isChangeProfilePhotoReducer,
  isChangeProfileReducer,
  isProfileReducer,
  profileReducer,
  userReducer,
  usersReducer,
} from './features/users/states/reducer';
import {
  isLostFoundAddReducer,
  isLostFoundAddedReducer,
  isLostFoundChangeCoverReducer,
  isLostFoundChangeReducer,
  isLostFoundChangedCoverReducer,
  isLostFoundChangedReducer,
  isLostFoundDeleteReducer,
  isLostFoundDeletedReducer,
  isLostFoundReducer,
  lostFoundReducer,
  lostFoundStatsReducer,
  lostFoundsReducer,
} from './features/lost-founds/states/reducer';

export const reducer = {
  // auth
  isAuthLogin: isAuthLoginReducer,
  isAuthRegister: isAuthRegisterReducer,
  isAuthLogout: isAuthLogoutReducer,
  // users
  users: usersReducer,
  user: userReducer,
  profile: profileReducer,
  isProfile: isProfileReducer,
  isChangeProfile: isChangeProfileReducer,
  isChangeProfilePhoto: isChangeProfilePhotoReducer,
  isChangeProfilePassword: isChangeProfilePasswordReducer,
  // lost & founds
  lostFounds: lostFoundsReducer,
  lostFound: lostFoundReducer,
  isLostFound: isLostFoundReducer,
  isLostFoundAdd: isLostFoundAddReducer,
  isLostFoundAdded: isLostFoundAddedReducer,
  isLostFoundChange: isLostFoundChangeReducer,
  isLostFoundChanged: isLostFoundChangedReducer,
  isLostFoundChangeCover: isLostFoundChangeCoverReducer,
  isLostFoundChangedCover: isLostFoundChangedCoverReducer,
  isLostFoundDelete: isLostFoundDeleteReducer,
  isLostFoundDeleted: isLostFoundDeletedReducer,
  lostFoundStats: lostFoundStatsReducer,
};

const store = configureStore({ reducer });

export default store;
