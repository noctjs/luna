const { suite } = require("../utils");

/**
 * The goal of this benchmark is to find the most performant query
 * implementation. 2 approaches are tested:
 *
 *   1) Returning an iterable (an array or an iterator).
 *   2) Using a callback
 *
 * Results on node v13.5.0:
 *
 *   loop: 5,203 op/s (±0.77%)
 *   loop (pre-allocate): 6,090 op/s (±0.60%)
 *   map: 2,992 op/s (±0.55%)
 *   callback: 9,901 op/s (±9.98%)             [FASTEST]
 *   forEach: 4,885 op/s (±4.09%)
 *   iterator: 2,605 op/s (±0.65%)             [SLOWEST]
 *
 * An interesting finding is that native `Array` methods are way slower than
 * their pure JS equivalent.
 */

// —————[ CASES ]———————————————————————————————————————————

/**
 * Pros:
 *   - `entities` can be mutated during iteration.
 *   - `for-of` loops can be used which read better in my opinion.
 *
 * Cons: `entities` is traversed twice.
 */
function query_loop(entities) {
  let res = [];
  for (let entity of entities) {
    res.push([entity.a, entity.b]);
  }
  return res;
}

/**
 * Same as `query_loop` but using a pre-allocated array.
 */
function query_loop_preallocate(entities) {
  let res = new Array(entities.length);
  for (let i = 0; i < entities.length; i++) {
    res[i] = [entities[i].a, entities[i].b];
  }
  return res;
}

/**
 * Same as `query_loop` but using `Array#map`.
 */
function query_map(entities) {
  return entities.map(entity => [entity.a, entity.b]);
}

/**
 * Pros: no temporary array is created.
 * Cons: `entities` cannot be mutated during iteration.
 */
function query_callback(entities, fn) {
  for (let entity of entities) {
    fn([entity.a, entity.b]);
  }
}

/**
 * Same as `query_callback` but using `Array#forEach`.
 */
function query_forEach(entities, fn) {
  entities.forEach(entity => {
    fn([entity.a, entity.b]);
  });
}

/**
 * Pros:
 *   - `entities` is traversed once.
 *   - `for-of` loops!
 *
 * Cons: performances…
 */
function* query_generator(entities) {
  for (let entity of entities) {
    yield [entity.a, entity.b];
  }
}

// —————[ BENCH ]———————————————————————————————————————————

const Comp1 = x => ({ x });
const Comp2 = x => ({ x });
const Entity = (a, b) => ({
  a: Comp1(a),
  b: Comp2(b)
});

const NUM_ENTITIES = 10_000;
const entities = [];

for (let i = 0; i < NUM_ENTITIES; i++) {
  entities.push(Entity(i, 0));
}

suite("Query iteration")
  .add("loop", () => {
    for (let [a, b] of query_loop(entities)) {
      a.x += b.x;
    }
  })
  .add("loop (pre-allocate)", () => {
    for (let [a, b] of query_loop_preallocate(entities)) {
      a.x += b.x;
    }
  })
  .add("map", () => {
    for (let [a, b] of query_map(entities)) {
      a.x += b.x;
    }
  })
  .add("callback", () => {
    query_callback(entities, ([a, b]) => {
      a.x += b.x;
    });
  })
  .add("forEach", () => {
    query_forEach(entities, ([a, b]) => {
      a.x += b.x;
    });
  })
  .add("generator", () => {
    for (let [a, b] of query_generator(entities)) {
      a.x += b.x;
    }
  })
  .run();
