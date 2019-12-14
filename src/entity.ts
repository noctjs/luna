import { assert } from "./utils";

export type Entity = number;
export type EntityIndex = number;
export type EntityVersion = number;

/**
 * Encode a new entity.
 *
 * Entities are represented as `int32`. The first bit, which is the sign, must
 * be 0. The next 23 bits are the `index` and the last 8 are the `version`.
 *
 *     0 | 111 1111 1111 1111 1111 1111 | 1111 1111
 *         ^^^ ^^^^ ^^^^ ^^^^ ^^^^ ^^^^   ^^^^ ^^^^
 *                    index                version
 */
export const createEntity = (index: number, version: number): Entity => {
  assert(index >= 0);
  assert(index <= 0b111_1111_1111_1111_1111_1111);
  assert(version >= 0);
  assert(version <= 0b1111_1111);
  return (index << 8) | version;
};

export const getIndex = (entity: Entity): EntityIndex => {
  return entity >> 8;
};

export const getVersion = (entity: Entity): EntityVersion => {
  return entity & 0b1111_1111;
};
