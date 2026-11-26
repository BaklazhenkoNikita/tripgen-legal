import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getBrokenImages,
  markImageBroken,
  orderByHealth,
  resetBrokenImages,
  subscribeBrokenImages,
} from '../brokenImages';

const A = 'https://img.test/a.jpg';
const B = 'https://img.test/b.jpg';
const C = 'https://img.test/c.jpg';
const D = 'https://img.test/d.jpg';

beforeEach(() => resetBrokenImages());

test('orderByHealth keeps the original order when nothing is broken', () => {
  assert.deepEqual(orderByHealth([A, B, C], new Set()), [A, B, C]);
});

test('orderByHealth moves a broken first photo to the end', () => {
  assert.deepEqual(orderByHealth([A, B, C], new Set([A])), [B, C, A]);
});

test('orderByHealth keeps both groups in their original order', () => {
  assert.deepEqual(orderByHealth([A, B, C, D], new Set([C, A])), [B, D, A, C]);
});

test('orderByHealth drops empty and duplicate URLs', () => {
  assert.deepEqual(orderByHealth([A, null, '', undefined, B, A], new Set()), [A, B]);
});

test('orderByHealth ignores broken URLs that are not in the list', () => {
  assert.deepEqual(orderByHealth([A, B], new Set([D])), [A, B]);
});

test('orderByHealth handles an empty list and an all-broken list', () => {
  assert.deepEqual(orderByHealth([], new Set([A])), []);
  assert.deepEqual(orderByHealth([A, B], new Set([A, B])), [A, B]);
});

test('markImageBroken records the URL and notifies subscribers', () => {
  let calls = 0;
  const unsubscribe = subscribeBrokenImages(() => {
    calls += 1;
  });
  const before = getBrokenImages();
  markImageBroken(A);
  assert.equal(calls, 1);
  assert.ok(getBrokenImages().has(A));
  // New snapshot identity so useSyncExternalStore re-renders.
  assert.notEqual(getBrokenImages(), before);
  unsubscribe();
  markImageBroken(B);
  assert.equal(calls, 1);
});

test('marking the same URL twice (or an empty URL) is a no-op', () => {
  let calls = 0;
  const unsubscribe = subscribeBrokenImages(() => {
    calls += 1;
  });
  markImageBroken(A);
  const snapshot = getBrokenImages();
  markImageBroken(A);
  markImageBroken(null);
  markImageBroken('');
  assert.equal(calls, 1);
  assert.equal(getBrokenImages(), snapshot);
  unsubscribe();
});
