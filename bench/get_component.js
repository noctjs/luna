import {
  createEntity,
  createTypeRegistry,
  createWorld,
  deleteEntity,
  getComponent,
  registerComponent
} from "../dist/luna.esm.js";
import { suite } from "./utils.js";

let registry = createTypeRegistry();

let TA = registerComponent(registry, () => ({}));
let TB = registerComponent(registry, () => ({}));
let TC = registerComponent(registry, () => ({}));

let world = createWorld(registry);

let entity = createEntity(world, TA);
let dead = createEntity(world, TB);

deleteEntity(world, dead);

suite("get component")
  .add("success", () => {
    if (!getComponent(world, entity, TA)) {
      throw new Error("Expecting component A");
    }
  })
  .add("failure", () => {
    if (getComponent(world, entity, TB)) {
      throw new Error("Unexpected component B");
    }
  })
  .add("unknown component", () => {
    if (getComponent(world, entity, TC)) {
      throw new Error("Unexpected component C");
    }
  })
  .add("on dead entity", () => {
    if (getComponent(world, dead, TA)) {
      throw new Error("Unexpected component A");
    }
  })
  .run();
