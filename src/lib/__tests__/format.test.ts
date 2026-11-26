import { test } from 'node:test';
import assert from 'node:assert/strict';
import { displayDestination, formatPlaceName } from '../cities/normalizeCity';
import { formatDateRange, formatDayDate, parseIsoDateLocal, tripDayCount } from '../date';
import { entityLabel } from '../map/categoryColors';

test('formatPlaceName title-cases lowercase words and keeps authored casing', () => {
  assert.equal(formatPlaceName('taipei, Taiwan'), 'Taipei, Taiwan');
  assert.equal(formatPlaceName('new york, USA'), 'New York, USA');
  assert.equal(formatPlaceName('rio de janeiro'), 'Rio de Janeiro');
  assert.equal(formatPlaceName('aix-en-provence'), 'Aix-en-Provence');
  assert.equal(formatPlaceName('la paz, bolivia'), 'La Paz, Bolivia');
  assert.equal(formatPlaceName('  mexico   city '), 'Mexico City');
  assert.equal(formatPlaceName(null), '');
});

test('displayDestination splits city and country', () => {
  assert.deepEqual(displayDestination('taipei, Taiwan'), {
    city: 'Taipei',
    country: 'Taiwan',
    full: 'Taipei, Taiwan',
  });
  assert.deepEqual(displayDestination('barcelona'), { city: 'Barcelona', country: null, full: 'Barcelona' });
  assert.equal(displayDestination('sitges, catalonia, spain').country, 'Spain');
});

test('parseIsoDateLocal reads the calendar date, not UTC midnight', () => {
  const d = parseIsoDateLocal('2026-12-28');
  assert.ok(d);
  assert.equal(d.getFullYear(), 2026);
  assert.equal(d.getMonth(), 11);
  assert.equal(d.getDate(), 28);
  assert.equal(parseIsoDateLocal('2026-12-28T00:00:00Z')?.getDate(), 28);
  assert.equal(parseIsoDateLocal('not a date'), null);
});

test('formatDayDate', () => {
  assert.equal(formatDayDate('2026-12-28'), 'Mon, Dec 28');
  assert.equal(formatDayDate('garbage'), 'garbage');
  assert.equal(formatDayDate(undefined), '');
});

test('formatDateRange covers same-month, cross-month and cross-year', () => {
  assert.equal(formatDateRange('2026-12-28', '2026-12-31'), 'Dec 28–31');
  assert.equal(formatDateRange('2026-11-28', '2026-12-02'), 'Nov 28 – Dec 2');
  assert.equal(formatDateRange('2026-12-30', '2027-01-02'), 'Dec 30, 2026 – Jan 2, 2027');
  assert.equal(formatDateRange('2026-12-28', '2026-12-28'), 'Dec 28');
  assert.equal(formatDateRange('2026-12-28', null), 'Dec 28');
  assert.equal(formatDateRange(null, undefined), null);
});

test('tripDayCount is inclusive', () => {
  assert.equal(tripDayCount('2026-12-28', '2026-12-31'), 4);
  assert.equal(tripDayCount('2026-12-28', '2026-12-28'), 1);
  assert.equal(tripDayCount('2026-12-31', '2026-12-28'), null);
  assert.equal(tripDayCount(null, '2026-12-28'), null);
});

test('entityLabel uses one vocabulary', () => {
  assert.equal(entityLabel('exploration'), 'Sight');
  assert.equal(entityLabel('restaurant'), 'Food');
  assert.equal(entityLabel('viator'), 'Tour');
  assert.equal(entityLabel('something_else'), 'Place');
  assert.equal(entityLabel(undefined), 'Place');
});
