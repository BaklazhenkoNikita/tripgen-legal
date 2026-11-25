import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  closeStreamingTail,
  entityLinksToMarkdown,
  parseEntityHref,
  stripEntityLinks,
} from '../markdown';

test('closeStreamingTail hides unclosed trailing constructs', () => {
  assert.equal(closeStreamingTail('Try **Bel'), 'Try ');
  assert.equal(closeStreamingTail('Try **Belém** now'), 'Try **Belém** now');
  assert.equal(closeStreamingTail('See [Time Out'), 'See ');
  assert.equal(closeStreamingTail('See [Time Out](https://x'), 'See ');
  assert.equal(closeStreamingTail('See [T](https://x.com) ok'), 'See [T](https://x.com) ok');
  assert.equal(closeStreamingTail('Visit [[activity:abc|Bel'), 'Visit ');
  assert.equal(closeStreamingTail('Visit [[activity:abc|Belém]] today'), 'Visit [[activity:abc|Belém]] today');
  assert.equal(closeStreamingTail('run `npm'), 'run ');
  assert.equal(closeStreamingTail('- item one\n- item two'), '- item one\n- item two');
});

test('entity links round-trip through markdown hrefs', () => {
  const md = entityLinksToMarkdown('Go to [[activity:65f0|Belém [Tower]]] then [[restaurant:r1|Time Out]].');
  assert.match(md, /\[Time Out\]\(#periplo-entity\/restaurant\/r1\)/);
  assert.deepEqual(parseEntityHref('#periplo-entity/restaurant/r1'), { type: 'restaurant', id: 'r1' });
  assert.equal(parseEntityHref('https://example.com'), null);
  assert.equal(stripEntityLinks('A [[activity:1|Tower]] B'), 'A Tower B');
});
