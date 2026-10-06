import { describe, expect, it } from 'vitest';
import { putAccessToken } from '../../../helpers/apiHelper';
import { setIsAuthLoginActionCreator, setIsAuthLogoutActionCreator, setIsAuthRegisterActionCreator } from './action';
import { isAuthLoginReducer, isAuthLogoutReducer, isAuthRegisterReducer } from './reducer';

describe('auth reducers', () => {
  it('isAuthLogin: default dari token & mengikuti action', () => {
    expect(isAuthLoginReducer(undefined)).toBe(false);
    putAccessToken('x');
    expect(isAuthLoginReducer(undefined)).toBe(true);
    expect(isAuthLoginReducer(true, setIsAuthLoginActionCreator(false))).toBe(false);
    expect(isAuthLoginReducer(true, { type: 'LAIN' })).toBe(true);
  });
  it('isAuthRegister', () => {
    expect(isAuthRegisterReducer(undefined)).toBe(false);
    expect(isAuthRegisterReducer(false, setIsAuthRegisterActionCreator(true))).toBe(true);
  });
  it('isAuthLogout', () => {
    expect(isAuthLogoutReducer(undefined)).toBe(false);
    expect(isAuthLogoutReducer(false, setIsAuthLogoutActionCreator(true))).toBe(true);
  });
});
