import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Handshake, Landmark, ScrollText, Sparkles, UtensilsCrossed, Wine } from 'lucide-react';
import { iconForSection } from '../sectionIcons';

test('iconForSection maps backend Ionicons names', () => {
  assert.equal(iconForSection({ title: 'Anything', icon: 'restaurant-outline' }), UtensilsCrossed);
  assert.equal(iconForSection({ title: 'Anything', icon: 'wine' }), Wine);
  assert.equal(iconForSection({ title: 'Anything', icon: 'hand-left-outline' }), Handshake);
});

test('iconForSection falls back to title keywords', () => {
  assert.equal(iconForSection({ title: 'Architectural Details', icon: 'not-a-real-icon' }), Landmark);
  assert.equal(iconForSection({ title: 'The Story' }), ScrollText);
  assert.equal(iconForSection({ title: 'Cuisine & Signature Dishes', icon: null }), UtensilsCrossed);
});

test('iconForSection defaults to Sparkles', () => {
  assert.equal(iconForSection({ title: 'Zzz' }), Sparkles);
  assert.equal(iconForSection({}), Sparkles);
});
