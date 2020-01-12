const {
  createEntities,
  createQuery,
  createTypeRegistry,
  createWorld,
  iterateEntities,
  registerComponent,
  registerType,
  iterateQuery
} = require("..");
const { suite } = require("./utils");

let registry = createTypeRegistry();

let TA = registerComponent(registry, () => ({}));
let TB = registerComponent(registry, () => ({}));
let TC = registerComponent(registry, () => ({}));
let TD = registerComponent(registry, () => ({}));

let TAB = registerType(registry, [TA, TB]);
let TAD = registerType(registry, [TA, TD]);

let world = createWorld(registry);

createEntities(world, TAB, 50);
createEntities(world, TAD, 50);
createEntities(world, TC, 100);

let queryA = createQuery(world, TA);
let queryC = createQuery(world, TC);

suite("Query entities")
  .add("100 <C> (1 archetype)", () => {
    iterateEntities(queryC, entity => {
      if (!entity) throw new Error();
    });
  })
  .add("100 <A> (2 archetypes)", () => {
    iterateEntities(queryA, entity => {
      if (!entity) throw new Error();
    });
  })
  .run();

suite("Query components")
  .add("100 <C> (1 archetype)", () => {
    iterateQuery(queryC, c => {
      if (!c) throw new Error();
    });
  })
  .add("100 <A> (2 archetypes)", () => {
    iterateQuery(queryA, a => {
      if (!a) throw new Error();
    });
  })
  .run();
