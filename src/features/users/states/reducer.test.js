import { describe, expect, it } from 'vitest';
import * as A from './action';
import * as R from './reducer';

describe('users reducers', () => {
  it('users, user, profile', () => {
    expect(R.usersReducer(undefined)).toEqual([]);
    expect(R.usersReducer([], A.receiveUsersActionCreator([{ id: 1 }]))).toEqual([{ id: 1 }]);
    expect(R.userReducer(undefined)).toBeNull();
    expect(R.userReducer(null, A.receiveUserActionCreator({ id: 2 }))).toEqual({ id: 2 });
    expect(R.profileReducer(undefined)).toBeNull();
    expect(R.profileReducer(null, A.receiveProfileActionCreator({ id: 3 }))).toEqual({ id: 3 });
    expect(R.profileReducer({ id: 3 }, { type: 'LAIN' })).toEqual({ id: 3 });
  });
  it('flag reducers', () => {
    expect(R.isProfileReducer(undefined)).toBe(false);
    expect(R.isProfileReducer(false, A.setIsProfileActionCreator(true))).toBe(true);
    expect(R.isChangeProfileReducer(false, A.setIsChangeProfileActionCreator(true))).toBe(true);
    expect(R.isChangeProfilePhotoReducer(false, A.setIsChangeProfilePhotoActionCreator(true))).toBe(true);
    expect(R.isChangeProfilePasswordReducer(false, A.setIsChangeProfilePasswordActionCreator(true))).toBe(true);
    expect(R.isChangeProfileReducer(true, { type: 'LAIN' })).toBe(true);
  });
});
