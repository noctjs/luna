import {
  createEntities,
  createQuery,
  createTypeRegistry,
  createWorld,
  deleteEntities,
  iterateEntities,
  iterateQuery,
  registerComponent,
  registerType
} from "../..";

function Position(x = 0, y = 0) {
  return { x, y };
}

function Velocity(dx = 0, dy = 0) {
  return { dx, dy };
}

function Animation(length = 1) {
  return { frame: 0, length };
}

function Render(sprite = null) {
  return { sprite };
}

let reg = createTypeRegistry();

let TAnimation = registerComponent(reg, Animation);
let TPosition = registerComponent(reg, Position);
let TRender = registerComponent(reg, Render);
let TVelocity = registerComponent(reg, Velocity);

let TEntityA = registerType(reg, [TPosition]);
let TEntityB = registerType(reg, [TPosition, TRender]);
let TEntityC = registerType(reg, [TPosition, TRender, TAnimation]);
let TEntityD = registerType(reg, [TPosition, TRender, TAnimation, TVelocity]);

let TMovable = registerType(reg, [TPosition, TVelocity]);
let TRenderable = registerType(reg, [TPosition, TRender]);

function setup() {
  return createWorld(reg);
}

function insertEntities(world, count) {
  createEntities(world, TEntityA, count);
  createEntities(world, TEntityB, count);
  createEntities(world, TEntityC, count);
  createEntities(world, TEntityD, count);
}

export function bench_create_delete(count) {
  let world = setup();

  return () => {
    insertEntities(world, count);
    deleteEntities(world, TPosition);
  };
}

export function bench_update(count) {
  let world = setup();
  let movables = createQuery(world, TMovable);
  let animations = createQuery(world, TAnimation);
  let renderables = createQuery(world, TRenderable);

  insertEntities(world, count);

  function movablesFn(pos, vel) {
    pos.x += vel.dx;
    pos.y += vel.dy;
  }

  function animationsFn(anim) {
    anim.frame = (anim.frame + 1) % anim.length;
  }

  function renderablesFn(entity) {
    if (!entity) throw new Error();
  }

  return () => {
    iterateQuery(movables, movablesFn);
    iterateQuery(animations, animationsFn);
    iterateEntities(renderables, renderablesFn);
  };
}
