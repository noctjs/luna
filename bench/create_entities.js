const { World } = require("..");
const { range, suite } = require("./utils");

class A {}
class B {}
class C {}
class D {}
class E {}

const a = [new A()];
const a1 = [a];
const a50 = range(50).map(() => a);
const a100 = range(100).map(() => a);

const b = [new B()];
const b50 = range(50).map(() => b);

const ab = [new A(), new B()];
const ab100 = range(100).map(() => ab);

const abcde = [new A(), new B(), new C(), new D(), new E()];
const abcde100 = range(100).map(() => abcde);

suite("Create entities")
  .add("1 <A>, 100 times", () => {
    let world = new World();
    for (let i = 0; i < 100; i++) {
      world.create(a1);
    }
  })
  .add("100 <A>", () => {
    let world = new World();
    world.create(a100);
  })
  .add("100 <A, B>", () => {
    let world = new World();
    world.create(ab100);
  })
  .add("100 <A, B, C, D, E>", () => {
    let world = new World();
    world.create(abcde100);
  })
  .add("50 <A>, 50 <B>", () => {
    let world = new World();
    world.create(a50);
    world.create(b50);
  })
  .add("50 <A>, delete, 50 <A>", () => {
    let world = new World();
    world.create(a50).forEach(entity => world.delete(entity));
    world.create(a50);
  })
  .run();
