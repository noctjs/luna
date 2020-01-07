import {
  createEntities,
  createEntity,
  createTypeRegistry,
  createWorld,
  registerComponent,
  registerType
} from "../dist/luna.esm.js";
import { suite } from "./utils.js";

let registry = createTypeRegistry();

let TA = registerComponent(registry, () => ({}));
let TB = registerComponent(registry, () => ({}));
let TC = registerComponent(registry, () => ({}));
let TD = registerComponent(registry, () => ({}));
let TE = registerComponent(registry, () => ({}));

let TAB = registerType(registry, [TA, TB]);
let TABCDE = registerType(registry, [TA, TB, TC, TD, TE]);

suite("Create entities")
  .add("1 <A>, 100 times", () => {
    let world = createWorld(registry);
    for (let i = 0; i < 100; i++) {
      createEntity(world, TA);
    }
  })
  .add("100 <A>", () => {
    let world = createWorld(registry);
    createEntities(world, TA, 100);
  })
  .add("100 <A, B>", () => {
    let world = createWorld(registry);
    createEntities(world, TAB, 100);
  })
  .add("100 <A, B, C, D, E>", () => {
    let world = createWorld(registry);
    createEntities(world, TABCDE, 100);
  })
  .add("50 <A>, 50 <B>", () => {
    let world = createWorld(registry);
    createEntities(world, TA, 50);
    createEntities(world, TB, 50);
  })
  .run();
