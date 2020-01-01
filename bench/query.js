const { Query, World } = require("..");
const { range, suite } = require("./utils");

class A {}
class B {}
class C {}
class D {}

let world = new World();

world.create(range(50).map(() => [new A(), new B()]));
world.create(range(50).map(() => [new A(), new D()]));
world.create(range(100).map(() => [new C()]));

let compsA = new Query([A]);
let compsC = new Query([C]);

suite("Query")
  .add("100 <C> (1 archetype)", () => {
    for (let [comp] of compsC.values(world)) {
      if (!comp) throw new Error();
    }
  })
  .add("100 <A> (2 archetypes)", () => {
    for (let [comp] of compsA.values(world)) {
      if (!comp) throw new Error();
    }
  })
  .run();
