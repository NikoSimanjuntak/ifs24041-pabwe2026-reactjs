import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper';
import {
  deleteLostFound,
  getLostFoundById,
  getLostFoundStatsDaily,
  getLostFoundStatsMonthly,
  getLostFounds,
  postLostFound,
  postLostFoundCover,
  putLostFound,
} from '../api/lostFoundApi';

export const ActionType = {
  RECEIVE_LOST_FOUNDS: 'lostFounds/RECEIVE_LOST_FOUNDS',
  RECEIVE_LOST_FOUND: 'lostFounds/RECEIVE_LOST_FOUND',
  RECEIVE_LOST_FOUND_STATS: 'lostFounds/RECEIVE_LOST_FOUND_STATS',
  SET_IS_LOST_FOUND: 'lostFounds/SET_IS_LOST_FOUND',
  SET_IS_LOST_FOUND_ADD: 'lostFounds/SET_IS_LOST_FOUND_ADD',
  SET_IS_LOST_FOUND_ADDED: 'lostFounds/SET_IS_LOST_FOUND_ADDED',
  SET_IS_LOST_FOUND_CHANGE: 'lostFounds/SET_IS_LOST_FOUND_CHANGE',
  SET_IS_LOST_FOUND_CHANGED: 'lostFounds/SET_IS_LOST_FOUND_CHANGED',
  SET_IS_LOST_FOUND_CHANGE_COVER: 'lostFounds/SET_IS_LOST_FOUND_CHANGE_COVER',
  SET_IS_LOST_FOUND_CHANGED_COVER: 'lostFounds/SET_IS_LOST_FOUND_CHANGED_COVER',
  SET_IS_LOST_FOUND_DELETE: 'lostFounds/SET_IS_LOST_FOUND_DELETE',
  SET_IS_LOST_FOUND_DELETED: 'lostFounds/SET_IS_LOST_FOUND_DELETED',
};

const flagCreator = (type) => (status) => ({ type, payload: { status } });

export const receiveLostFoundsActionCreator = (lostFounds) => ({ type: ActionType.RECEIVE_LOST_FOUNDS, payload: { lostFounds } });
export const receiveLostFoundActionCreator = (lostFound) => ({ type: ActionType.RECEIVE_LOST_FOUND, payload: { lostFound } });
export const receiveLostFoundStatsActionCreator = (stats) => ({ type: ActionType.RECEIVE_LOST_FOUND_STATS, payload: { stats } });
export const setIsLostFoundActionCreator = flagCreator(ActionType.SET_IS_LOST_FOUND);
export const setIsLostFoundAddActionCreator = flagCreator(ActionType.SET_IS_LOST_FOUND_ADD);
export const setIsLostFoundAddedActionCreator = flagCreator(ActionType.SET_IS_LOST_FOUND_ADDED);
export const setIsLostFoundChangeActionCreator = flagCreator(ActionType.SET_IS_LOST_FOUND_CHANGE);
export const setIsLostFoundChangedActionCreator = flagCreator(ActionType.SET_IS_LOST_FOUND_CHANGED);
export const setIsLostFoundChangeCoverActionCreator = flagCreator(ActionType.SET_IS_LOST_FOUND_CHANGE_COVER);
export const setIsLostFoundChangedCoverActionCreator = flagCreator(ActionType.SET_IS_LOST_FOUND_CHANGED_COVER);
export const setIsLostFoundDeleteActionCreator = flagCreator(ActionType.SET_IS_LOST_FOUND_DELETE);
export const setIsLostFoundDeletedActionCreator = flagCreator(ActionType.SET_IS_LOST_FOUND_DELETED);

export function asyncLostFounds(params = {}) {
  return async (dispatch) => {
    dispatch(setIsLostFoundActionCreator(true));
    try {
      dispatch(receiveLostFoundsActionCreator(await getLostFounds(params)));
    } catch (error) {
      showErrorDialog(error.message, 'Gagal memuat laporan');
    } finally {
      dispatch(setIsLostFoundActionCreator(false));
    }
  };
}

export function asyncLostFound(id) {
  return async (dispatch) => {
    dispatch(receiveLostFoundActionCreator(null));
    dispatch(setIsLostFoundActionCreator(true));
    try {
      dispatch(receiveLostFoundActionCreator(await getLostFoundById(id)));
    } catch (error) {
      showErrorDialog(error.message, 'Gagal memuat detail');
    } finally {
      dispatch(setIsLostFoundActionCreator(false));
    }
  };
}

export function asyncLostFoundAdd(payload) {
  return async (dispatch) => {
    dispatch(setIsLostFoundAddedActionCreator(false));
    dispatch(setIsLostFoundAddActionCreator(true));
    try {
      const id = await postLostFound(payload);
      dispatch(setIsLostFoundAddedActionCreator(true));
      showSuccessDialog('Laporan berhasil ditambahkan.');
      return id ?? true;
    } catch (error) {
      showErrorDialog(error.message, 'Gagal menambah laporan');
      return false;
    } finally {
      dispatch(setIsLostFoundAddActionCreator(false));
    }
  };
}

export function asyncLostFoundChange(id, payload) {
  return async (dispatch) => {
    dispatch(setIsLostFoundChangedActionCreator(false));
    dispatch(setIsLostFoundChangeActionCreator(true));
    try {
      await putLostFound(id, payload);
      dispatch(setIsLostFoundChangedActionCreator(true));
      showSuccessDialog('Laporan berhasil diperbarui.');
      return true;
    } catch (error) {
      showErrorDialog(error.message, 'Gagal memperbarui laporan');
      return false;
    } finally {
      dispatch(setIsLostFoundChangeActionCreator(false));
    }
  };
}

export function asyncLostFoundChangeCover(id, file) {
  return async (dispatch) => {
    dispatch(setIsLostFoundChangedCoverActionCreator(false));
    dispatch(setIsLostFoundChangeCoverActionCreator(true));
    try {
      await postLostFoundCover(id, file);
      dispatch(setIsLostFoundChangedCoverActionCreator(true));
      showSuccessDialog('Cover berhasil diperbarui.');
      return true;
    } catch (error) {
      showErrorDialog(error.message, 'Gagal mengunggah cover');
      return false;
    } finally {
      dispatch(setIsLostFoundChangeCoverActionCreator(false));
    }
  };
}

export function asyncLostFoundDelete(id) {
  return async (dispatch) => {
    dispatch(setIsLostFoundDeletedActionCreator(false));
    dispatch(setIsLostFoundDeleteActionCreator(true));
    try {
      await deleteLostFound(id);
      dispatch(setIsLostFoundDeletedActionCreator(true));
      showSuccessDialog('Laporan berhasil dihapus.');
      return true;
    } catch (error) {
      showErrorDialog(error.message, 'Gagal menghapus laporan');
      return false;
    } finally {
      dispatch(setIsLostFoundDeleteActionCreator(false));
    }
  };
}

/** Memuat statistik harian (7 hari) dan bulanan (6 bulan). */
export function asyncLostFoundStats() {
  return async (dispatch) => {
    try {
      const [daily, monthly] = await Promise.all([
        getLostFoundStatsDaily({ total_data: 7 }),
        getLostFoundStatsMonthly({ total_data: 6 }),
      ]);
      dispatch(receiveLostFoundStatsActionCreator({ daily, monthly }));
    } catch {
      // statistik bersifat pelengkap; kegagalan tidak perlu mengganggu pengguna
      dispatch(receiveLostFoundStatsActionCreator(null));
    }
  };
}
