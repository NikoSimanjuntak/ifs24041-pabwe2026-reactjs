import { describe, expect, it, vi } from 'vitest';
import { apiRequest } from '../../../helpers/apiHelper';
import { postLogin, postRegister } from './authApi';

vi.mock('../../../helpers/apiHelper', () => ({ apiRequest: vi.fn() }));

describe('authApi', () => {
  it('postLogin → POST /auth/login tanpa token', async () => {
    apiRequest.mockResolvedValue({ data: { token: 't' } });
    expect(await postLogin({ email: 'a@b.c', password: '123456' })).toEqual({ token: 't' });
    expect(apiRequest).toHaveBeenCalledWith('/auth/login', { method: 'POST', body: { email: 'a@b.c', password: '123456' }, auth: false });
  });
  it('postRegister → POST /auth/register', async () => {
    apiRequest.mockResolvedValue({ status: 'success' });
    await postRegister({ name: 'N', email: 'a@b.c', password: '123456' });
    expect(apiRequest).toHaveBeenCalledWith('/auth/register', { method: 'POST', body: { name: 'N', email: 'a@b.c', password: '123456' }, auth: false });
  });
});
