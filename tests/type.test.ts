import {
  containsType,
  createTypeRegistry,
  mergeTypes,
  registerComponent
} from "../src/type";

const registry = createTypeRegistry();

const TA = registerComponent(registry, () => {});
const TB = registerComponent(registry, () => {});
const TC = registerComponent(registry, () => {});

const A = TA[0];
const B = TB[0];
const C = TC[0];

test("containsType", () => {
  expect(containsType([A], [])).toBe(true);
  expect(containsType([], [A])).toBe(false);
  expect(containsType([A, B, C], [A])).toBe(true);
  expect(containsType([A, B, C], [B])).toBe(true);
  expect(containsType([A, B, C], [B, C])).toBe(true);
  expect(containsType([A, B, C], [A, B, C])).toBe(true);
  expect(containsType([A, B], [A, B, C])).toBe(false);
});

test("mergeTypes", () => {
  expect(mergeTypes([A, B, C], [], [])).toEqual([A, B, C]);
  expect(mergeTypes([A, B], [C], [])).toEqual([A, B, C]);
  expect(mergeTypes([A], [B, C], [])).toEqual([A, B, C]);
  expect(mergeTypes([], [A, B, C], [])).toEqual([A, B, C]);
  expect(mergeTypes([A, B, C], [], [C])).toEqual([A, B]);
  expect(mergeTypes([A, B, C], [], [B, C])).toEqual([A]);
  expect(mergeTypes([A, B, C], [], [A, B, C])).toEqual([]);
  expect(mergeTypes([A, B, C], [], [C])).toEqual([A, B]);
  expect(mergeTypes([A, B, C], [], [B, C])).toEqual([A]);
  expect(mergeTypes([A, B, C], [], [A, B, C])).toEqual([]);
  expect(mergeTypes([A, C], [B], [C])).toEqual([A, B]);
});
