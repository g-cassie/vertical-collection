import { moduleForComponent } from 'ember-qunit';
import {
  find,
  scrollTo
} from 'ember-native-dom-helpers';

import waitForRender from 'dummy/tests/helpers/wait-for-render';
import getNumbers from 'dummy/lib/get-numbers';

import { paddingBefore, paddingAfter } from 'dummy/tests/helpers/measurement';
import { prepend, replaceArray } from 'dummy/tests/helpers/array';

import {
  testScenarios,
  dynamicSimpleScenarioFor,
  standardTemplate
} from 'dummy/tests/helpers/test-scenarios';

moduleForComponent('vertical-collection', 'Integration | Measure Tests', {
  integration: true
});

testScenarios(
  'The collection correctly remeasures items when scrolling down',
  dynamicSimpleScenarioFor(getNumbers(0, 20)),
  standardTemplate,

  async function(assert) {
    assert.expect(2);

    const itemContainer = find('vertical-collection');
    assert.equal(paddingBefore(itemContainer), 0, 'itemContainer padding is correct on initial render');

    find('.vertical-item:first-of-type').style.height = '50px';

    await scrollTo('.scrollable', 0, 51);

    assert.equal(paddingBefore(itemContainer), 50, 'itemContainer padding is the height of the modified first element');
  }
);

testScenarios(
  'The collection correctly remeasures items when scrolling up',
  dynamicSimpleScenarioFor(getNumbers(0, 20)),
  standardTemplate,

  async function(assert) {
    assert.expect(3);

    const itemContainer = find('vertical-collection');

    assert.equal(paddingAfter(itemContainer), 200, 'itemContainer padding is correct on initial render');

    await scrollTo('.scrollable', 0, 20);

    assert.equal(paddingAfter(itemContainer), 180, 'itemContainer padding is correct after scrolling down');

    find('.vertical-item:last-of-type').style.height = '50px';
    await scrollTo('.scrollable', 0, 0);

    assert.equal(paddingAfter(itemContainer), 230, 'itemContainer padding has the height of the modified last element');
  }
);

testScenarios(
  'Can scroll correctly in dynamic list of items that has non-integer heights',
  dynamicSimpleScenarioFor(getNumbers(0, 20), { itemHeight: 20.5 }),
  standardTemplate,

  async function(assert) {
    assert.expect(2);

    await scrollTo('.scrollable', 0, 400);

    const itemContainer = find('vertical-collection');

    // Floats aren't perfect, neither is browser rendering/measuring, but any subpixel errors
    // should be amplified to the point where they are very noticeable at this point, so rounding
    // should provide some safety.
    assert.equal(Math.round(paddingBefore(itemContainer)), 205, 'Occluded content has the correct height before');
    assert.equal(paddingAfter(itemContainer), 0, 'Occluded content has the correct height after');
  }
);

testScenarios(
  'Can measure and affect correctly in list of items with non-integer heights',
  dynamicSimpleScenarioFor(getNumbers(0, 20), { itemHeight: 30.1, key: '@index', idForFirstItem: '10' }),
  standardTemplate,

  async function(assert) {
    assert.expect(1);

    assert.equal(find('.scrollable'.scrollTop, 210, 'scrollTop set to correct value'));
  }
);

testScenarios(
  'Measurements are correct after a prepend',
  dynamicSimpleScenarioFor(getNumbers(0, 20), { itemHeight: 30 }),
  standardTemplate,

  async function(assert) {
    assert.expect(3);

    prepend(this, getNumbers(-20, 20));

    await waitForRender();

    assert.equal(find('.scrollable').scrollTop, 420, 'scrollTop set to correct value');

    const itemContainer = find('vertical-collection');
    assert.equal(paddingBefore(itemContainer), 360, 'Occluded content has the correct height before');
    assert.equal(paddingAfter(itemContainer), 260, 'Occluded content has the correct height after');
  }
);

testScenarios(
  'Measurements are correct after a reset',
  dynamicSimpleScenarioFor(getNumbers(0, 20), { itemHeight: 30 }),
  standardTemplate,

  async function(assert) {
    assert.expect(6);

    await scrollTo('.scrollable', 0, 300);

    assert.equal(find('.scrollable').scrollTop, 300, 'scrollTop set to correct value');
    assert.equal(find('.vertical-item:first-of-type').textContent.trim(), '10 10', 'the first rendered item is correct');
    assert.equal(find('.vertical-item:last-of-type').textContent.trim(), '19 19', 'the last rendered item is correct');

    replaceArray(this, getNumbers(20, 20));

    await waitForRender();

    assert.equal(find('.scrollable').scrollTop, 300, 'scrollTop set to correct value');
    assert.equal(find('.vertical-item:first-of-type').textContent.trim(), '30 10', 'the first rendered item is correct');
    assert.equal(find('.vertical-item:last-of-type').textContent.trim(), '39 19', 'the last rendered item is correct');
  }
);
