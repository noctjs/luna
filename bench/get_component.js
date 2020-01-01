const assert = require("assert");
const { World } = require("..");
const { suite } = require("./utils");

class A {}
class B {}
class C {}

let world = new World();

let [entity] = world.create([[new A()]]);
let [zombie] = world.create([[new B()]]);

world.delete(zombie);

suite("get component")
  .add("success", () => {
    assert(world.getComponent(entity, A) !== undefined);
  })
  .add("failure", () => {
    assert(world.getComponent(entity, B) === undefined);
  })
  .add("unknown component", () => {
    assert(world.getComponent(entity, C) === undefined);
  })
  .add("on dead entity", () => {
    assert(world.getComponent(zombie, A) === undefined);
  })
  .run();
