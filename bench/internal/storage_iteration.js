const { suite } = require("../utils");

/**
 * The goal of this benchmark is identify which ECS storage implementation
 * is the most efficient in JavaScript:
 *
 *   - Array of Structures:
 *       Each entity contains its components. Entities are packed into an
 *       array. In the “chunk” variation, entities having the same components
 *       (archetype) are stored in the same array.
 *
 *   - Structure of Arrays:
 *       Components of the same type are stored in the same array. The “chunk”
 *       variation emulates archetypes. Each archetype contains the components
 *       of its entities. In the “column” variation, the archetypes contain
 *       the entity and a lookup is required to get the entity's components.
 *
 *   - Flat array:
 *       All components live in the same array. In the “chunk” variation, the
 *       entities are grouped by archetype. However a lookup is required to
 *       get the entity's components.
 *
 * Results on node v13.5.0:
 *
 *   Array of Structures
 *     baseline: 329,066 op/s (±0.62%)
 *     chunks: 283,225 op/s (±0.43%)
 *
 *   Structure of Arrays
 *     baseline: 367,183 op/s (±0.48%)
 *     chunks: 312,989 op/s (±0.78%)
 *     lookup: 174,355 op/s (±0.42%)    [SLOWEST]
 *
 *   Flat array
 *     baseline: 365,895 op/s (±0.63%)
 *     chunks: 331,122 op/s (±0.51%)    [FASTEST]
 *     lookup: 166,684 op/s (±0.55%)    [SLOWEST]
 *
 * Lookup based implementations are 2 times slower than the others.
 *
 * The 2 competiting implementations here are AoS and SoA. While SoA seems to
 * be faster, I think the AoS implementation is the safest one. These
 * benchmarks avoid dynamic property accesses which is really hard to achieve
 * for SoA implementations while it is relatively easy for AoS implementations.
 */

// —————[ CASES ]———————————————————————————————————————————

const NUM_ENTITIES = 1000;
const CHUNK_SIZES = [100, 200, 300, 400];
const ENTITY_SIZE = 2;

// —————[ Array of Structures ]—————————

function create_aos_baseline(fn) {
  let entities = [];
  for (let i = 0; i < NUM_ENTITIES; i++) {
    entities.push({
      a: { x: i },
      b: { y: i + 1 }
    });
  }

  return () => {
    for (let entity of entities) {
      fn(entity.a, entity.b);
    }
  };
}

function create_aos_chunks(fn) {
  let chunks = [];
  for (let size of CHUNK_SIZES) {
    let entities = new Array(size);
    for (let i = 0; i < size; i++) {
      entities[i] = {
        a: { x: i },
        b: { y: i + 1 }
      };
    }
    chunks.push(entities);
  }

  return () => {
    for (let entities of chunks) {
      for (let entity of entities) {
        fn(entity.a, entity.b);
      }
    }
  };
}

// —————[ Structure of Arrays ]—————————

function create_soa_baseline(fn) {
  let storage_a = [];
  let storage_b = [];
  for (let i = 0; i < NUM_ENTITIES; i++) {
    storage_a.push({ x: i });
    storage_b.push({ y: i + 1 });
  }

  return () => {
    for (let i = 0; i < NUM_ENTITIES; i++) {
      fn(storage_a[i], storage_b[i]);
    }
  };
}

function create_soa_chunks(fn) {
  let chunks = [];
  for (let size of CHUNK_SIZES) {
    let storage_a = new Array(size);
    let storage_b = new Array(size);
    for (let i = 0; i < size; i++) {
      storage_a[i] = { x: i };
      storage_b[i] = { y: i + 1 };
    }
    chunks.push({ size, storage_a, storage_b });
  }

  return () => {
    for (let storage of chunks) {
      for (let i = 0; i < storage.size; i++) {
        fn(storage.storage_a[i], storage.storage_b[i]);
      }
    }
  };
}

function create_soa_lookup(fn) {
  let chunks = [];
  let storage_a = [];
  let storage_b = [];
  let offset = 0;
  for (let size of CHUNK_SIZES) {
    let chunk = [];
    for (let i = 0; i < size; i++) {
      chunk.push(offset + i);
      storage_a.push({ x: i });
      storage_b.push({ y: i + 1 });
    }
    chunks.push(chunk);
    offset += size;
  }

  return () => {
    for (let chunk of chunks) {
      for (let entity_index of chunk) {
        fn(storage_a[entity_index], storage_b[entity_index]);
      }
    }
  };
}

// —————[ Flat array ]——————————————————

function create_flat_baseline(fn) {
  let data = [];
  for (let i = 0; i < NUM_ENTITIES; i++) {
    data.push({ x: i }, { y: i + 1 });
  }

  return () => {
    for (let i = 0; i < data.length; i += ENTITY_SIZE) {
      fn(data[i], data[i + 1]);
    }
  };
}

function create_flat_chunks(fn) {
  let chunks = [];
  for (let size of CHUNK_SIZES) {
    let chunk = [];
    for (let i = 0; i < size; i++) {
      chunk.push({ x: i }, { y: i + 1 });
    }
    chunks.push(chunk);
  }

  return () => {
    for (let chunk of chunks) {
      for (let i = 0; i < chunk.length; i += ENTITY_SIZE) {
        fn(chunk[i], chunk[i + 1]);
      }
    }
  };
}

function create_flat_lookup(fn) {
  let chunks = [];
  let data = [];
  let offset = 0;
  for (let size of CHUNK_SIZES) {
    let chunk = [];
    for (let i = 0; i < size; i++) {
      chunk.push(offset + i);
      data.push({ x: i }, { y: i + 1 });
    }
    chunks.push(chunk);
    offset += size;
  }

  return () => {
    for (let chunk of chunks) {
      for (let entity of chunk) {
        fn(data[ENTITY_SIZE * entity], data[ENTITY_SIZE * entity + 1]);
      }
    }
  };
}

// —————[ BENCH ]———————————————————————————————————————————

function check(a, b) {
  if (a.x + 1 !== b.y) {
    throw new Error();
  }
}

suite("Array of Structures")
  .add("baseline", create_aos_baseline(check))
  .add("chunks", create_aos_chunks(check))
  .run();

suite("Structure of Arrays")
  .add("baseline", create_soa_baseline(check))
  .add("chunks", create_soa_chunks(check))
  .add("lookup", create_soa_lookup(check))
  .run();

suite("Flat array")
  .add("baseline", create_flat_baseline(check))
  .add("chunks", create_flat_chunks(check))
  .add("lookup", create_flat_lookup(check))
  .run();
