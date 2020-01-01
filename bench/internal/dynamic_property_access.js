const assert = require("assert");
const { suite } = require("../utils");

/**
 * The goal of this benchmark is to measure the cost of dynamic property
 * access.
 *
 * Results on node v13.5.0:
 *
 *   1. direct: 348,075 op/s (±0.88%)             [BASELINE]
 *   2. keyed: 24,428 op/s (±0.70%)
 *   3. dynamic callback: 24,233 op/s (±1.17%)
 *   4. bound callback: 24,509 op/s (±1.21%)
 *   5. compiled callback: 353,567 op/s (±0.70%)  [FASTEST]
 *   6. unique callback: 352,647 op/s (±0.47%)    [FASTEST]
 *
 * As expected, keyed accesses are the slowest.
 *
 * Cases 3 and 4 offer the best developer experience. Unfortunately, v8 does
 * not inline the keys here.
 *
 * Case 5 performs as fast as direct accesses but `get_compiled` compilations
 * are really slow. This cannot be used in a hot path.
 *
 * Case 6 is certainly the most intriguing one. It uses keyed access like
 * case 3 but does not pay the performance cost.
 */

// —————[ CASES ]———————————————————————————————————————————

/**
 * Baseline.
 */
function direct_access(values) {
  let n = 0;
  for (let value of values) {
    n += value.a + value.b;
  }
  return n;
}

/**
 * Dynamic keyed access.
 */
function keyed_access(values, key1, key2) {
  let n = 0;
  for (let value of values) {
    n += value[key1] + value[key2];
  }
  return n;
}

/**
 * This is a helper. Accesses are done within a callback created by `get`,
 * `get_bound` and `get_compiled`.
 */
function callback_access(values, fn) {
  let n = 0;
  for (let value of values) {
    n += fn(value);
  }
  return n;
}

// Keyed access
function get(key1, key2) {
  return value => value[key1] + value[key2];
}

// Keyed access but parameters are “bound”
function get_bound(key1, key2, value) {
  return value[key1] + value[key2];
}

// Direct access
function get_compiled(key1, key2) {
  return Function("a", `return a.${key1} + a.${key2}`);
}

// Keyed access
function get_unique(key1, key2) {
  return Function(
    "i",
    "j",
    `return a => { return a[i] + a[j] /* ${key1 + key2} */ }`
  )(key1, key2);
}

// —————[ BENCH ]———————————————————————————————————————————

const NUM_VALUES = 1000;
const CHECK_SUM = 1000000;

const values = [];

for (let i = 0; i < NUM_VALUES; i++) {
  values.push({
    a: i,
    b: i + 1
  });
}

function check(result) {
  assert.equal(result, CHECK_SUM);
}

const get_ab = get("a", "b");
const get_ba = get("b", "a");

const get_ab_bound = get_bound.bind(null, "a", "b");
const get_ba_bound = get_bound.bind(null, "b", "a");

const get_ab_compiled = get_compiled("a", "b");
const get_ba_compiled = get_compiled("b", "a");

const get_ab_unique = get_unique("a", "b");
const get_ba_unique = get_unique("b", "a");

suite("Dynamic property access")
  .add("direct", () => {
    check(direct_access(values));
    check(direct_access(values));
  })
  .add("keyed", () => {
    check(keyed_access(values, "a", "b"));
    check(keyed_access(values, "b", "a"));
  })
  .add("dynamic callback", () => {
    check(callback_access(values, get_ab));
    check(callback_access(values, get_ba));
  })
  .add("bound callback", () => {
    check(callback_access(values, get_ab_bound));
    check(callback_access(values, get_ba_bound));
  })
  .add("compiled callback", () => {
    check(callback_access(values, get_ab_compiled));
    check(callback_access(values, get_ba_compiled));
  })
  .add("unique callback", () => {
    check(callback_access(values, get_ab_unique));
    check(callback_access(values, get_ba_unique));
  })
  .run();
