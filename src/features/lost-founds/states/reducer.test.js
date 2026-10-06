import { describe, expect, it } from 'vitest';
import * as A from './action';
import * as R from './reducer';

describe('lost-found reducers', () => {
  it('data reducers', () => {
    expect(R.lostFoundsReducer(undefined)).toEqual([]);
    expect(R.lostFoundsReducer([], A.receiveLostFoundsActionCreator([{ id: 1 }]))).toEqual([{ id: 1 }]);
    expect(R.lostFoundReducer(undefined)).toBeNull();
    expect(R.lostFoundReducer(null, A.receiveLostFoundActionCreator({ id: 2 }))).toEqual({ id: 2 });
    expect(R.lostFoundStatsReducer(undefined)).toBeNull();
    expect(R.lostFoundStatsReducer(null, A.receiveLostFoundStatsActionCreator({ a: 1 }))).toEqual({ a: 1 });
    expect(R.lostFoundsReducer([1], { type: 'LAIN' })).toEqual([1]);
  });
  it.each([
    ['isLostFoundReducer', 'setIsLostFoundActionCreator'],
    ['isLostFoundAddReducer', 'setIsLostFoundAddActionCreator'],
    ['isLostFoundAddedReducer', 'setIsLostFoundAddedActionCreator'],
    ['isLostFoundChangeReducer', 'setIsLostFoundChangeActionCreator'],
    ['isLostFoundChangedReducer', 'setIsLostFoundChangedActionCreator'],
    ['isLostFoundChangeCoverReducer', 'setIsLostFoundChangeCoverActionCreator'],
    ['isLostFoundChangedCoverReducer', 'setIsLostFoundChangedCoverActionCreator'],
    ['isLostFoundDeleteReducer', 'setIsLostFoundDeleteActionCreator'],
    ['isLostFoundDeletedReducer', 'setIsLostFoundDeletedActionCreator'],
  ])('%s', (reducer, creator) => {
    expect(R[reducer](undefined)).toBe(false);
    expect(R[reducer](false, A[creator](true))).toBe(true);
    expect(R[reducer](true, { type: 'LAIN' })).toBe(true);
  });
});
