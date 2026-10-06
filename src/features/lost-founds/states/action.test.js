import { describe, expect, it, vi } from 'vitest';
import { showErrorDialog, showSuccessDialog } from '../../../helpers/toolsHelper';
import * as api from '../api/lostFoundApi';
import * as A from './action';

vi.mock('../api/lostFoundApi');
vi.mock('../../../helpers/toolsHelper');

const run = async (thunk) => {
  const dispatch = vi.fn();
  const result = await thunk(dispatch);
  return { dispatch, result };
};

describe('lost-found action creators', () => {
  it('membuat action data dan flag', () => {
    expect(A.receiveLostFoundsActionCreator([1]).payload.lostFounds).toEqual([1]);
    expect(A.receiveLostFoundActionCreator({ id: 1 }).payload.lostFound).toEqual({ id: 1 });
    expect(A.receiveLostFoundStatsActionCreator({}).type).toBe(A.ActionType.RECEIVE_LOST_FOUND_STATS);
    expect(A.setIsLostFoundActionCreator(true)).toEqual({ type: A.ActionType.SET_IS_LOST_FOUND, payload: { status: true } });
    expect(A.setIsLostFoundAddActionCreator(true).type).toBe(A.ActionType.SET_IS_LOST_FOUND_ADD);
    expect(A.setIsLostFoundAddedActionCreator(true).type).toBe(A.ActionType.SET_IS_LOST_FOUND_ADDED);
    expect(A.setIsLostFoundChangeActionCreator(true).type).toBe(A.ActionType.SET_IS_LOST_FOUND_CHANGE);
    expect(A.setIsLostFoundChangedActionCreator(true).type).toBe(A.ActionType.SET_IS_LOST_FOUND_CHANGED);
    expect(A.setIsLostFoundChangeCoverActionCreator(true).type).toBe(A.ActionType.SET_IS_LOST_FOUND_CHANGE_COVER);
    expect(A.setIsLostFoundChangedCoverActionCreator(true).type).toBe(A.ActionType.SET_IS_LOST_FOUND_CHANGED_COVER);
    expect(A.setIsLostFoundDeleteActionCreator(true).type).toBe(A.ActionType.SET_IS_LOST_FOUND_DELETE);
    expect(A.setIsLostFoundDeletedActionCreator(true).type).toBe(A.ActionType.SET_IS_LOST_FOUND_DELETED);
  });
});

describe('lost-found thunks', () => {
  it('asyncLostFounds sukses dan gagal', async () => {
    api.getLostFounds.mockResolvedValue([{ id: 1 }]);
    const { dispatch } = await run(A.asyncLostFounds({ is_me: 1 }));
    expect(api.getLostFounds).toHaveBeenCalledWith({ is_me: 1 });
    expect(dispatch).toHaveBeenCalledWith(A.receiveLostFoundsActionCreator([{ id: 1 }]));
    expect(dispatch).toHaveBeenLastCalledWith(A.setIsLostFoundActionCreator(false));
    api.getLostFounds.mockRejectedValue(new Error('x'));
    await run(A.asyncLostFounds());
    expect(showErrorDialog).toHaveBeenCalled();
  });
  it('asyncLostFound sukses dan gagal', async () => {
    api.getLostFoundById.mockResolvedValue({ id: 7 });
    const { dispatch } = await run(A.asyncLostFound(7));
    expect(dispatch).toHaveBeenCalledWith(A.receiveLostFoundActionCreator({ id: 7 }));
    api.getLostFoundById.mockRejectedValue(new Error('x'));
    await run(A.asyncLostFound(7));
    expect(showErrorDialog).toHaveBeenCalled();
  });
  it('asyncLostFoundAdd mengembalikan id / false', async () => {
    api.postLostFound.mockResolvedValue(11);
    let { result, dispatch } = await run(A.asyncLostFoundAdd({}));
    expect(result).toBe(11);
    expect(dispatch).toHaveBeenCalledWith(A.setIsLostFoundAddedActionCreator(true));
    api.postLostFound.mockResolvedValue(undefined);
    expect((await run(A.asyncLostFoundAdd({}))).result).toBe(true);
    api.postLostFound.mockRejectedValue(new Error('x'));
    expect((await run(A.asyncLostFoundAdd({}))).result).toBe(false);
  });
  it.each([
    ['Change', () => A.asyncLostFoundChange(1, {}), 'putLostFound', 'SET_IS_LOST_FOUND_CHANGED'],
    ['ChangeCover', () => A.asyncLostFoundChangeCover(1, new File(['x'], 'a.png')), 'postLostFoundCover', 'SET_IS_LOST_FOUND_CHANGED_COVER'],
    ['Delete', () => A.asyncLostFoundDelete(1), 'deleteLostFound', 'SET_IS_LOST_FOUND_DELETED'],
  ])('asyncLostFound%s sukses & gagal', async (_n, make, apiFn, flagType) => {
    api[apiFn].mockResolvedValue({});
    const { result, dispatch } = await run(make());
    expect(result).toBe(true);
    expect(dispatch).toHaveBeenCalledWith({ type: A.ActionType[flagType], payload: { status: true } });
    expect(showSuccessDialog).toHaveBeenCalled();
    api[apiFn].mockRejectedValue(new Error('x'));
    expect((await run(make())).result).toBe(false);
    expect(showErrorDialog).toHaveBeenCalled();
  });
  it('asyncLostFoundStats menggabungkan statistik harian & bulanan', async () => {
    api.getLostFoundStatsDaily.mockResolvedValue({ d: 1 });
    api.getLostFoundStatsMonthly.mockResolvedValue({ m: 1 });
    let { dispatch } = await run(A.asyncLostFoundStats());
    expect(dispatch).toHaveBeenCalledWith(A.receiveLostFoundStatsActionCreator({ daily: { d: 1 }, monthly: { m: 1 } }));
    api.getLostFoundStatsDaily.mockRejectedValue(new Error('x'));
    ({ dispatch } = await run(A.asyncLostFoundStats()));
    expect(dispatch).toHaveBeenCalledWith(A.receiveLostFoundStatsActionCreator(null));
  });
});
