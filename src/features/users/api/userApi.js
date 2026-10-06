import { apiRequest } from '../../../helpers/apiHelper';

/** GET /users */
export const getUsers = async () => (await apiRequest('/users')).data.users;

/** GET /users/:id */
export const getUserById = async (id) => (await apiRequest(`/users/${id}`)).data.user;

/** GET /users/me */
export const getProfile = async () => (await apiRequest('/users/me')).data.user;

/** PUT /users/me */
export const putProfile = async ({ name, email }) =>
  (await apiRequest('/users/me', { method: 'PUT', body: { name, email } })).data;

/** POST /users/me/photo (multipart, field "photo") */
export const postProfilePhoto = async (file) => {
  const body = new FormData();
  body.append('photo', file);
  return apiRequest('/users/me/photo', { method: 'POST', body });
};

/**
 * PUT /users/me/password.
 * Dokumentasi Delcom mencatat endpoint /users/password; bila path "me" belum
 * tersedia (404), request otomatis diulang ke path dokumentasi.
 */
export const putProfilePassword = async ({
  password,
  new_password,
  new_password_confirmation,
}) => {
  const body = { password, new_password, new_password_confirmation };
  try {
    return await apiRequest('/users/me/password', { method: 'PUT', body });
  } catch (error) {
    if (error.status !== 404) throw error;
    return apiRequest('/users/password', { method: 'PUT', body });
  }
};
