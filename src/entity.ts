import { assert } from "./assert.js";
import {
  clearTable,
  insertIntoTable,
  removeFromTable,
  Table
} from "./table.js";
import { allocateType, containsType, getTypeIndex, Type } from "./type.js";
import { getTable, World } from "./world.js";

export interface Entity {
  _type: Type;
  _table: Table | null;
  _index: number;
}

export function createEntity(world: World, type: Type): Entity {
  let table = getTable(world, type);
  let entity = {
    _type: type,
    _table: table,
    _index: -1
  };

  entity._index = insertIntoTable(table, entity);

  return entity;
}

export function createEntities(
  world: World,
  type: Type,
  count: number
): Entity[] {
  let table = getTable(world, type);
  let start = table._entities.length;

  for (let i = 0; i < count; i++) {
    let entity = {
      _type: type,
      _table: table,
      _index: start + i
    };

    insertIntoTable(table, entity);
  }

  return table._entities.slice(start);
}

export function deleteEntity(world: World, entity: Entity): void {
  if (entity._table) {
    removeFromTable(entity._table, entity._index);
    entity._table = null;
    entity._index = -1;
  }
}

export function deleteEntities(world: World, type: Type): void {
  for (let table of world._tables.values()) {
    if (containsType(table._type, type)) {
      clearTable(table);
    }
  }
}

export function getComponent<T>(
  world: World,
  entity: Entity,
  type: Type
): T | undefined {
  assert(type.length === 1, "Invalid component type");
  if (entity._table) {
    let def = type[0];
    let index = getTypeIndex(entity._table._type, def);
    if (index >= 0) {
      return entity._table._columns[index][entity._index];
    }
  }
  return undefined;
}

export function setComponent(
  world: World,
  entity: Entity,
  type: Type,
  args: any[]
): void {
  assert(type.length === 1, "Invalid component type");
  if (entity._table) {
    let def = type[0];
    let index = getTypeIndex(entity._table._type, def);
    if (index >= 0) {
      entity._table._columns[index][entity._index] = allocateType(def, args);
    }
  }
}

export function isAlive(world: World, entity: Entity): boolean {
  return entity._table !== null;
}
