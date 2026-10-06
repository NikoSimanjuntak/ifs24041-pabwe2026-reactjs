import { describe, expect, it } from 'vitest';
import store, { reducer } from './store';
import { receiveProfileActionCreator } from './features/users/states/action';

describe('store', () => {
  it('menggabungkan seluruh reducer auth, users, dan lost-founds', () => {
    const keys = Object.keys(store.getState());
    ['isAuthLogin', 'isAuthRegister', 'isAuthLogout', 'users', 'user', 'profile', 'isProfile',
      'isChangeProfile', 'isChangeProfilePhoto', 'isChangeProfilePassword', 'lostFounds', 'lostFound',
      'isLostFound', 'isLostFoundAdd', 'isLostFoundAdded', 'isLostFoundChange', 'isLostFoundChanged',
      'isLostFoundChangeCover', 'isLostFoundChangedCover', 'isLostFoundDelete', 'isLostFoundDeleted',
      'lostFoundStats'].forEach((k) => expect(keys).toContain(k));
    expect(keys).toHaveLength(Object.keys(reducer).length);
  });
  it('memperbarui state ketika action di-dispatch', () => {
    store.dispatch(receiveProfileActionCreator({ id: 1, name: 'Tes' }));
    expect(store.getState().profile).toEqual({ id: 1, name: 'Tes' });
  });
});
