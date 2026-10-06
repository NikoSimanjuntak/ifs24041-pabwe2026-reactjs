import { ActionType } from './action';

export function lostFoundsReducer(state = [], action = {}) {
  return action.type === ActionType.RECEIVE_LOST_FOUNDS ? action.payload.lostFounds : state;
}
export function lostFoundReducer(state = null, action = {}) {
  return action.type === ActionType.RECEIVE_LOST_FOUND ? action.payload.lostFound : state;
}
export function lostFoundStatsReducer(state = null, action = {}) {
  return action.type === ActionType.RECEIVE_LOST_FOUND_STATS ? action.payload.stats : state;
}

const flag = (type) => (state = false, action = {}) =>
  action.type === type ? action.payload.status : state;

export const isLostFoundReducer = flag(ActionType.SET_IS_LOST_FOUND);
export const isLostFoundAddReducer = flag(ActionType.SET_IS_LOST_FOUND_ADD);
export const isLostFoundAddedReducer = flag(ActionType.SET_IS_LOST_FOUND_ADDED);
export const isLostFoundChangeReducer = flag(ActionType.SET_IS_LOST_FOUND_CHANGE);
export const isLostFoundChangedReducer = flag(ActionType.SET_IS_LOST_FOUND_CHANGED);
export const isLostFoundChangeCoverReducer = flag(ActionType.SET_IS_LOST_FOUND_CHANGE_COVER);
export const isLostFoundChangedCoverReducer = flag(ActionType.SET_IS_LOST_FOUND_CHANGED_COVER);
export const isLostFoundDeleteReducer = flag(ActionType.SET_IS_LOST_FOUND_DELETE);
export const isLostFoundDeletedReducer = flag(ActionType.SET_IS_LOST_FOUND_DELETED);
