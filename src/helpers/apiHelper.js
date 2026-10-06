const ACCESS_TOKEN_KEY = 'accessToken';

/** Base URL REST API Delcom (didefinisikan lewat `define` pada vite.config.js). */
export const BASE_URL =
  typeof DELCOM_BASEURL !== 'undefined'
    ? DELCOM_BASEURL
    : 'https://open-api.delcom.org/api/v1';

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/* ------------------------------ Token storage ----------------------------- */
export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const putAccessToken = (token) =>
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
export const removeAccessToken = () => localStorage.removeItem(ACCESS_TOKEN_KEY);

/* --------------------------------- Helpers -------------------------------- */
/** Menyusun URL lengkap + query params (nilai kosong diabaikan). */
export const buildUrl = (path, params = {}) => {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
};

/** Mengubah path relatif dari API (mis. img/profile/1.png) menjadi URL absolut. */
export const assetUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${new URL(BASE_URL).origin}/${String(path).replace(/^\//, '')}`;
};

const firstValidationMessage = (data) => {
  if (!data || typeof data !== 'object') return null;
  const first = Object.values(data).find((v) => Array.isArray(v) && v.length);
  return first ? first[0] : null;
};

/**
 * Wrapper fetch ke Delcom API.
 * - menambahkan header Authorization: Bearer <token> otomatis
 * - mendukung query params, body JSON, dan FormData (upload file)
 * - melempar ApiError berisi pesan yang siap ditampilkan ke pengguna
 */
export async function apiRequest(
  path,
  { method = 'GET', params, body, auth = true } = {},
) {
  const headers = { Accept: 'application/json' };
  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body && !isForm) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    throw new ApiError(
      'Tidak dapat terhubung ke server. Periksa koneksi internet kamu.',
    );
  }

  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok || (json && json.status && json.status !== 'success')) {
    const detail = firstValidationMessage(json?.data);
    const message =
      detail || json?.message || `Permintaan gagal (${response.status})`;
    throw new ApiError(message, response.status, json?.data ?? null);
  }

  return json ?? {};
}
