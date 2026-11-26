import { test } from 'node:test';
import assert from 'node:assert/strict';
import { displayPlaceName } from '../normalizeCity';
import { slugToCity } from '../../destinationSlug';

test('displayPlaceName capitalises lowercase input', () => {
  assert.equal(displayPlaceName('taipei'), 'Taipei');
  assert.equal(displayPlaceName('new york'), 'New York');
  assert.equal(displayPlaceName('  paris  '), 'Paris');
  assert.equal(displayPlaceName('ho  chi minh city'), 'Ho Chi Minh City');
});

test('displayPlaceName handles non-ASCII letters', () => {
  assert.equal(displayPlaceName('zürich'), 'Zürich');
  assert.equal(displayPlaceName('são paulo'), 'São Paulo');
  assert.equal(displayPlaceName('île-de-france'), 'Île-de-France');
});

test('displayPlaceName keeps joining words lowercase mid-name', () => {
  assert.equal(displayPlaceName('rio de janeiro'), 'Rio de Janeiro');
  assert.equal(displayPlaceName('stoke-on-trent'), 'Stoke-on-Trent');
  assert.equal(displayPlaceName('frankfurt am main'), 'Frankfurt am Main');
  assert.equal(displayPlaceName('la paz'), 'La Paz');
  assert.equal(displayPlaceName('los angeles'), 'Los Angeles');
});

test('displayPlaceName trusts already-cased input', () => {
  assert.equal(displayPlaceName('McLaren Vale'), 'McLaren Vale');
  assert.equal(displayPlaceName("Xi'an"), "Xi'an");
  assert.equal(displayPlaceName('NYC'), 'NYC');
  assert.equal(displayPlaceName('Rio de Janeiro'), 'Rio de Janeiro');
});

test('displayPlaceName tolerates empty input', () => {
  assert.equal(displayPlaceName(''), '');
  assert.equal(displayPlaceName(null), '');
  assert.equal(displayPlaceName(undefined), '');
  assert.equal(displayPlaceName('   '), '');
});

test('slugToCity humanises non-curated slugs with Unicode-safe casing', () => {
  assert.equal(slugToCity('taipei'), 'Taipei');
  assert.equal(slugToCity('new-york'), 'New York');
  assert.equal(slugToCity('z%C3%BCrich'), 'Zürich');
  assert.equal(slugToCity('rio-de-janeiro'), 'Rio de Janeiro');
});
