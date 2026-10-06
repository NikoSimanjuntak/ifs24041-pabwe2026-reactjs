import { describe, expect, it, vi } from 'vitest';
import { getAccessToken, putAccessToken } from '../../../helpers/apiHelper';
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper';
import { postLogin, postRegister } from '../api/authApi';
import {
  ActionType, asyncAuthLogin, asyncAuthLogout, asyncAuthRegister,
  setIsAuthLoginActionCreator, setIsAuthLogoutActionCreator, setIsAuthRegisterActionCreator,
} from './action';

vi.mock('../api/authApi');
vi.mock('../../../helpers/toolsHelper');

describe('auth action creators', () => {
  it('membuat action yang benar', () => {
    expect(setIsAuthLoginActionCreator(true)).toEqual({ type: ActionType.SET_IS_AUTH_LOGIN, payload: { status: true } });
    expect(setIsAuthRegisterActionCreator(false)).toEqual({ type: ActionType.SET_IS_AUTH_REGISTER, payload: { status: false } });
    expect(setIsAuthLogoutActionCreator(true)).toEqual({ type: ActionType.SET_IS_AUTH_LOGOUT, payload: { status: true } });
  });
});

describe('auth thunks', () => {
  it('asyncAuthLogin berhasil menyimpan token', async () => {
    postLogin.mockResolvedValue({ token: 'abc' });
    const dispatch = vi.fn();
    expect(await asyncAuthLogin({ email: 'a', password: 'b' })(dispatch)).toBe(true);
    expect(getAccessToken()).toBe('abc');
    expect(dispatch).toHaveBeenCalledWith(setIsAuthLoginActionCreator(true));
  });
  it('asyncAuthLogin gagal bila token tidak ada atau API error', async () => {
    const dispatch = vi.fn();
    postLogin.mockResolvedValue({});
    expect(await asyncAuthLogin({})(dispatch)).toBe(false);
    postLogin.mockRejectedValue(new Error('salah'));
    expect(await asyncAuthLogin({})(dispatch)).toBe(false);
    expect(showErrorDialog).toHaveBeenLastCalledWith('salah', 'Gagal masuk');
  });
  it('asyncAuthRegister sukses & gagal', async () => {
    const dispatch = vi.fn();
    postRegister.mockResolvedValue({});
    expect(await asyncAuthRegister({})(dispatch)).toBe(true);
    expect(showSuccessDialog).toHaveBeenCalled();
    postRegister.mockRejectedValue(new Error('dobel'));
    expect(await asyncAuthRegister({})(dispatch)).toBe(false);
    expect(dispatch).toHaveBeenLastCalledWith(setIsAuthRegisterActionCreator(false));
  });
  it('asyncAuthLogout menghapus token dan mereset sesi', async () => {
    putAccessToken('x');
    const dispatch = vi.fn();
    await asyncAuthLogout()(dispatch);
    expect(getAccessToken()).toBeNull();
    expect(dispatch).toHaveBeenCalledWith(setIsAuthLoginActionCreator(false));
    expect(dispatch).toHaveBeenCalledWith(setIsAuthLogoutActionCreator(true));
  });
});
