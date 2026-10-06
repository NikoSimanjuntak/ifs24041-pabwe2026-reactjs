import { describe, expect, it, vi } from 'vitest';
import { apiRequest } from '../../../helpers/apiHelper';
import {
  deleteLostFound, getLostFoundById, getLostFoundStatsDaily, getLostFoundStatsMonthly,
  getLostFounds, postLostFound, postLostFoundCover, putLostFound,
} from './lostFoundApi';

vi.mock('../../../helpers/apiHelper', () => ({ apiRequest: vi.fn() }));

describe('lostFoundApi', () => {
  it('getLostFounds meneruskan filter sebagai query params', async () => {
    apiRequest.mockResolvedValue({ data: { lost_founds: [{ id: 1 }] } });
    expect(await getLostFounds({ status: 'lost', is_completed: 0, is_me: 1 })).toEqual([{ id: 1 }]);
    expect(apiRequest).toHaveBeenCalledWith('/lost-founds', { params: { status: 'lost', is_completed: 0, is_me: 1 } });
    await getLostFounds();
    expect(apiRequest).toHaveBeenLastCalledWith('/lost-founds', { params: {} });
  });
  it('getLostFoundById', async () => {
    apiRequest.mockResolvedValue({ data: { lost_found: { id: 9 } } });
    expect(await getLostFoundById(9)).toEqual({ id: 9 });
    expect(apiRequest).toHaveBeenCalledWith('/lost-founds/9');
  });
  it('postLostFound mengembalikan id', async () => {
    apiRequest.mockResolvedValue({ data: { lost_found_id: 5 } });
    expect(await postLostFound({ title: 't', description: 'd', status: 'lost' })).toBe(5);
    expect(apiRequest).toHaveBeenCalledWith('/lost-founds', { method: 'POST', body: { title: 't', description: 'd', status: 'lost' } });
  });
  it('putLostFound mengonversi is_completed menjadi 1/0', async () => {
    apiRequest.mockResolvedValue({});
    await putLostFound(3, { title: 't', description: 'd', status: 'found', is_completed: true });
    expect(apiRequest.mock.calls[0][1].body.is_completed).toBe(1);
    await putLostFound(3, { title: 't', description: 'd', status: 'found', is_completed: 0 });
    expect(apiRequest.mock.calls[1][1].body.is_completed).toBe(0);
  });
  it('postLostFoundCover mengirim field cover', async () => {
    apiRequest.mockResolvedValue({});
    const file = new File(['x'], 'c.png', { type: 'image/png' });
    await postLostFoundCover(4, file);
    const [path, opts] = apiRequest.mock.calls[0];
    expect(path).toBe('/lost-founds/4/cover');
    expect(opts.body.get('cover')).toBe(file);
  });
  it('deleteLostFound & statistik', async () => {
    apiRequest.mockResolvedValue({ data: { stats_losts: {} } });
    await deleteLostFound(2);
    expect(apiRequest).toHaveBeenLastCalledWith('/lost-founds/2', { method: 'DELETE' });
    expect(await getLostFoundStatsDaily({ total_data: 7 })).toEqual({ stats_losts: {} });
    expect(apiRequest).toHaveBeenLastCalledWith('/lost-founds/stats/daily', { params: { total_data: 7 } });
    await getLostFoundStatsMonthly();
    expect(apiRequest).toHaveBeenLastCalledWith('/lost-founds/stats/monthly', { params: {} });
  });
});
