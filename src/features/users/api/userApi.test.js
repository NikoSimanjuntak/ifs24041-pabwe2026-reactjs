import { describe, expect, it, vi } from 'vitest';
import { apiRequest } from '../../../helpers/apiHelper';
import {
  getProfile, getUserById, getUsers, postProfilePhoto, putProfile, putProfilePassword,
} from './userApi';

vi.mock('../../../helpers/apiHelper', () => ({ apiRequest: vi.fn() }));

describe('userApi', () => {
  it('mengambil daftar pengguna, detail, dan profil', async () => {
    apiRequest.mockResolvedValueOnce({ data: { users: [1] } });
    expect(await getUsers()).toEqual([1]);
    apiRequest.mockResolvedValueOnce({ data: { user: { id: 2 } } });
    expect(await getUserById(2)).toEqual({ id: 2 });
    expect(apiRequest).toHaveBeenLastCalledWith('/users/2');
    apiRequest.mockResolvedValueOnce({ data: { user: { id: 1 } } });
    expect(await getProfile()).toEqual({ id: 1 });
    expect(apiRequest).toHaveBeenLastCalledWith('/users/me');
  });
  it('putProfile → PUT /users/me', async () => {
    apiRequest.mockResolvedValue({ data: { user: {} } });
    await putProfile({ name: 'N', email: 'e@e.e' });
    expect(apiRequest).toHaveBeenCalledWith('/users/me', { method: 'PUT', body: { name: 'N', email: 'e@e.e' } });
  });
  it('postProfilePhoto mengirim FormData berisi field photo', async () => {
    apiRequest.mockResolvedValue({});
    const file = new File(['x'], 'p.png', { type: 'image/png' });
    await postProfilePhoto(file);
    const [path, opts] = apiRequest.mock.calls[0];
    expect(path).toBe('/users/me/photo');
    expect(opts.body.get('photo')).toBe(file);
  });
  it('putProfilePassword memakai /users/me/password', async () => {
    apiRequest.mockResolvedValue({});
    await putProfilePassword({ password: 'a', new_password: 'b', new_password_confirmation: 'b' });
    expect(apiRequest).toHaveBeenCalledWith('/users/me/password', expect.objectContaining({ method: 'PUT' }));
  });
  it('putProfilePassword fallback ke /users/password saat 404', async () => {
    apiRequest.mockRejectedValueOnce(Object.assign(new Error('nf'), { status: 404 })).mockResolvedValueOnce({ ok: 1 });
    expect(await putProfilePassword({ password: 'a', new_password: 'b', new_password_confirmation: 'b' })).toEqual({ ok: 1 });
    expect(apiRequest).toHaveBeenLastCalledWith('/users/password', expect.anything());
  });
  it('putProfilePassword melempar ulang error selain 404', async () => {
    apiRequest.mockRejectedValueOnce(Object.assign(new Error('salah'), { status: 422 }));
    await expect(putProfilePassword({})).rejects.toThrow('salah');
  });
});
