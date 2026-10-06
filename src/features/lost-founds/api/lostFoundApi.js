import { apiRequest } from '../../../helpers/apiHelper';

/**
 * GET /lost-founds
 * @param {{status?: 'lost'|'found', is_completed?: 0|1, is_me?: 1}} params
 */
export const getLostFounds = async (params = {}) =>
  (await apiRequest('/lost-founds', { params })).data.lost_founds;

/** GET /lost-founds/:id */
export const getLostFoundById = async (id) =>
  (await apiRequest(`/lost-founds/${id}`)).data.lost_found;

/** POST /lost-founds → id laporan baru */
export const postLostFound = async ({ title, description, status }) =>
  (
    await apiRequest('/lost-founds', {
      method: 'POST',
      body: { title, description, status },
    })
  ).data.lost_found_id;

/** PUT /lost-founds/:id */
export const putLostFound = async (id, { title, description, status, is_completed }) =>
  apiRequest(`/lost-founds/${id}`, {
    method: 'PUT',
    body: { title, description, status, is_completed: is_completed ? 1 : 0 },
  });

/** POST /lost-founds/:id/cover (multipart, field "cover") */
export const postLostFoundCover = async (id, file) => {
  const body = new FormData();
  body.append('cover', file);
  return apiRequest(`/lost-founds/${id}/cover`, { method: 'POST', body });
};

/** DELETE /lost-founds/:id */
export const deleteLostFound = async (id) =>
  apiRequest(`/lost-founds/${id}`, { method: 'DELETE' });

/** GET /lost-founds/stats/daily */
export const getLostFoundStatsDaily = async (params = {}) =>
  (await apiRequest('/lost-founds/stats/daily', { params })).data;

/** GET /lost-founds/stats/monthly */
export const getLostFoundStatsMonthly = async (params = {}) =>
  (await apiRequest('/lost-founds/stats/monthly', { params })).data;
