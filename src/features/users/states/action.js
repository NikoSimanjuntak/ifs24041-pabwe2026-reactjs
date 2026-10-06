import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper';
import {
  getProfile,
  getUserById,
  getUsers,
  postProfilePhoto,
  putProfile,
  putProfilePassword,
} from '../api/userApi';

export const ActionType = {
  RECEIVE_USERS: 'users/RECEIVE_USERS',
  RECEIVE_USER: 'users/RECEIVE_USER',
  RECEIVE_PROFILE: 'users/RECEIVE_PROFILE',
  SET_IS_PROFILE: 'users/SET_IS_PROFILE',
  SET_IS_CHANGE_PROFILE: 'users/SET_IS_CHANGE_PROFILE',
  SET_IS_CHANGE_PROFILE_PHOTO: 'users/SET_IS_CHANGE_PROFILE_PHOTO',
  SET_IS_CHANGE_PROFILE_PASSWORD: 'users/SET_IS_CHANGE_PROFILE_PASSWORD',
};

export const receiveUsersActionCreator = (users) => ({ type: ActionType.RECEIVE_USERS, payload: { users } });
export const receiveUserActionCreator = (user) => ({ type: ActionType.RECEIVE_USER, payload: { user } });
export const receiveProfileActionCreator = (profile) => ({ type: ActionType.RECEIVE_PROFILE, payload: { profile } });
export const setIsProfileActionCreator = (status) => ({ type: ActionType.SET_IS_PROFILE, payload: { status } });
export const setIsChangeProfileActionCreator = (status) => ({ type: ActionType.SET_IS_CHANGE_PROFILE, payload: { status } });
export const setIsChangeProfilePhotoActionCreator = (status) => ({ type: ActionType.SET_IS_CHANGE_PROFILE_PHOTO, payload: { status } });
export const setIsChangeProfilePasswordActionCreator = (status) => ({ type: ActionType.SET_IS_CHANGE_PROFILE_PASSWORD, payload: { status } });

export function asyncUsers() {
  return async (dispatch) => {
    try {
      dispatch(receiveUsersActionCreator(await getUsers()));
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

export function asyncUser(id) {
  return async (dispatch) => {
    try {
      dispatch(receiveUserActionCreator(await getUserById(id)));
    } catch (error) {
      showErrorDialog(error.message);
    }
  };
}

/** Memuat profil aktif. Mengembalikan profil, 'unauthorized' (401), atau null (gagal lain). */
export function asyncProfile() {
  return async (dispatch) => {
    dispatch(setIsProfileActionCreator(true));
    try {
      const profile = await getProfile();
      dispatch(receiveProfileActionCreator(profile));
      return profile;
    } catch (error) {
      dispatch(receiveProfileActionCreator(null));
      // 401 ditangani route guard (sesi dikeluarkan) tanpa dialog tambahan
      if (error.status === 401) return 'unauthorized';
      showErrorDialog(error.message);
      return null;
    } finally {
      dispatch(setIsProfileActionCreator(false));
    }
  };
}

export function asyncChangeProfile({ name, email }) {
  return async (dispatch) => {
    dispatch(setIsChangeProfileActionCreator(true));
    try {
      await putProfile({ name, email });
      dispatch(receiveProfileActionCreator(await getProfile()));
      showSuccessDialog('Profil berhasil diperbarui.');
      return true;
    } catch (error) {
      showErrorDialog(error.message, 'Gagal memperbarui profil');
      return false;
    } finally {
      dispatch(setIsChangeProfileActionCreator(false));
    }
  };
}

export function asyncChangeProfilePhoto(file) {
  return async (dispatch) => {
    dispatch(setIsChangeProfilePhotoActionCreator(true));
    try {
      await postProfilePhoto(file);
      dispatch(receiveProfileActionCreator(await getProfile()));
      showSuccessDialog('Foto profil berhasil diperbarui.');
      return true;
    } catch (error) {
      showErrorDialog(error.message, 'Gagal mengunggah foto');
      return false;
    } finally {
      dispatch(setIsChangeProfilePhotoActionCreator(false));
    }
  };
}

export function asyncChangeProfilePassword(payload) {
  return async (dispatch) => {
    dispatch(setIsChangeProfilePasswordActionCreator(true));
    try {
      await putProfilePassword(payload);
      showSuccessDialog('Kata sandi berhasil diubah.');
      return true;
    } catch (error) {
      showErrorDialog(error.message, 'Gagal mengubah kata sandi');
      return false;
    } finally {
      dispatch(setIsChangeProfilePasswordActionCreator(false));
    }
  };
}
