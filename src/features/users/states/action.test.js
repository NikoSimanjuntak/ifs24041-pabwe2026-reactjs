import { describe, expect, it, vi } from 'vitest';
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper';
import * as api from '../api/userApi';
import * as A from './action';

vi.mock('../api/userApi');
vi.mock('../../../helpers/toolsHelper');

const run = async (thunk) => {
  const dispatch = vi.fn();
  const result = await thunk(dispatch);
  return { dispatch, result };
};

describe('users action creators', () => {
  it('membuat payload yang benar', () => {
    expect(A.receiveUsersActionCreator([1])).toEqual({ type: A.ActionType.RECEIVE_USERS, payload: { users: [1] } });
    expect(A.receiveUserActionCreator({ id: 1 }).type).toBe(A.ActionType.RECEIVE_USER);
    expect(A.receiveProfileActionCreator(null).payload.profile).toBeNull();
    expect(A.setIsProfileActionCreator(true).payload.status).toBe(true);
    expect(A.setIsChangeProfileActionCreator(true).type).toBe(A.ActionType.SET_IS_CHANGE_PROFILE);
    expect(A.setIsChangeProfilePhotoActionCreator(true).type).toBe(A.ActionType.SET_IS_CHANGE_PROFILE_PHOTO);
    expect(A.setIsChangeProfilePasswordActionCreator(true).type).toBe(A.ActionType.SET_IS_CHANGE_PROFILE_PASSWORD);
  });
});

describe('users thunks', () => {
  it('asyncUsers & asyncUser', async () => {
    api.getUsers.mockResolvedValue([{ id: 1 }]);
    let { dispatch } = await run(A.asyncUsers());
    expect(dispatch).toHaveBeenCalledWith(A.receiveUsersActionCreator([{ id: 1 }]));
    api.getUserById.mockResolvedValue({ id: 2 });
    ({ dispatch } = await run(A.asyncUser(2)));
    expect(dispatch).toHaveBeenCalledWith(A.receiveUserActionCreator({ id: 2 }));
    api.getUsers.mockRejectedValue(new Error('x'));
    api.getUserById.mockRejectedValue(new Error('y'));
    await run(A.asyncUsers());
    await run(A.asyncUser(2));
    expect(showErrorDialog).toHaveBeenCalledTimes(2);
  });
  it('asyncProfile: sukses, 401 (tanpa dialog), error lain', async () => {
    api.getProfile.mockResolvedValue({ id: 1 });
    let { result } = await run(A.asyncProfile());
    expect(result).toEqual({ id: 1 });
    api.getProfile.mockRejectedValue(Object.assign(new Error('Unauthenticated'), { status: 401 }));
    ({ result } = await run(A.asyncProfile()));
    expect(result).toBe('unauthorized');
    expect(showErrorDialog).not.toHaveBeenCalled();
    api.getProfile.mockRejectedValue(new Error('server'));
    ({ result } = await run(A.asyncProfile()));
    expect(result).toBeNull();
    expect(showErrorDialog).toHaveBeenCalledWith('server');
  });
  it.each([
    ['asyncChangeProfile', () => A.asyncChangeProfile({ name: 'n', email: 'e' }), 'putProfile'],
    ['asyncChangeProfilePhoto', () => A.asyncChangeProfilePhoto(new File(['x'], 'a.png')), 'postProfilePhoto'],
    ['asyncChangeProfilePassword', () => A.asyncChangeProfilePassword({}), 'putProfilePassword'],
  ])('%s sukses lalu gagal', async (_n, make, apiFn) => {
    api[apiFn].mockResolvedValue({});
    api.getProfile.mockResolvedValue({ id: 1 });
    expect((await run(make())).result).toBe(true);
    expect(showSuccessDialog).toHaveBeenCalled();
    api[apiFn].mockRejectedValue(new Error('gagal'));
    expect((await run(make())).result).toBe(false);
    expect(showErrorDialog).toHaveBeenCalled();
  });
});
