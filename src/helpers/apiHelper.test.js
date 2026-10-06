import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError, BASE_URL, apiRequest, assetUrl, buildUrl, getAccessToken, putAccessToken, removeAccessToken,
} from './apiHelper';

const mockFetch = (body, { ok = true, status = 200 } = {}) =>
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok, status, json: async () => body }));

afterEach(() => vi.unstubAllGlobals());

describe('token storage', () => {
  it('menyimpan, membaca, dan menghapus token', () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken('abc');
    expect(getAccessToken()).toBe('abc');
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});

describe('buildUrl & assetUrl', () => {
  it('menambahkan query params dan mengabaikan nilai kosong', () => {
    const url = buildUrl('/lost-founds', { status: 'lost', is_me: 1, a: '', b: null, c: undefined });
    expect(url).toBe(`${BASE_URL}/lost-founds?status=lost&is_me=1`);
  });
  it('mengubah path relatif menjadi absolut', () => {
    expect(assetUrl(null)).toBeNull();
    expect(assetUrl('https://x.test/a.png')).toBe('https://x.test/a.png');
    expect(assetUrl('img/a.png')).toBe('https://open-api.delcom.org/img/a.png');
    expect(assetUrl('/img/a.png')).toBe('https://open-api.delcom.org/img/a.png');
  });
});

describe('apiRequest', () => {
  it('mengirim bearer token dan body JSON', async () => {
    putAccessToken('tkn');
    mockFetch({ status: 'success', data: { ok: 1 } });
    const res = await apiRequest('/x', { method: 'POST', body: { a: 1 }, params: { q: 'z' } });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toContain('/x?q=z');
    expect(init.headers.Authorization).toBe('Bearer tkn');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(init.body).toBe('{"a":1}');
    expect(res.data.ok).toBe(1);
  });
  it('tidak menambahkan token bila auth=false', async () => {
    putAccessToken('tkn');
    mockFetch({ status: 'success' });
    await apiRequest('/x', { auth: false });
    expect(fetch.mock.calls[0][1].headers.Authorization).toBeUndefined();
  });
  it('mengirim FormData tanpa Content-Type manual', async () => {
    mockFetch({ status: 'success' });
    const body = new FormData();
    await apiRequest('/x', { method: 'POST', body });
    const init = fetch.mock.calls[0][1];
    expect(init.body).toBe(body);
    expect(init.headers['Content-Type']).toBeUndefined();
  });
  it('melempar ApiError dengan pesan validasi pertama', async () => {
    mockFetch({ status: 'fail', message: 'Data tidak valid', data: { email: ['Email salah'] } }, { ok: false, status: 422 });
    await expect(apiRequest('/x')).rejects.toMatchObject({ name: 'ApiError', message: 'Email salah', status: 422 });
  });
  it('memakai pesan umum / pesan default bila tidak ada detail', async () => {
    mockFetch({ status: 'fail', message: 'Unauthenticated.' }, { ok: false, status: 401 });
    await expect(apiRequest('/x')).rejects.toThrow('Unauthenticated.');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => { throw new Error('bad'); } }));
    await expect(apiRequest('/x')).rejects.toThrow('Permintaan gagal (500)');
  });
  it('mengembalikan objek kosong bila respons sukses tanpa JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => { throw new Error('x'); } }));
    expect(await apiRequest('/x')).toEqual({});
  });
  it('menangani kegagalan jaringan', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('net')));
    const err = await apiRequest('/x').catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toMatch(/Tidak dapat terhubung/);
  });
});
