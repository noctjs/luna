import { Entity } from "./entity";
import { allocateType, Type } from "./type";

export interface Table {
  _type: Type;
  _entities: Entity[];
  _columns: Column[];
}

export type Column = any[];

const EMPTY_ARGUMENTS: any[] = [];

export function createTable(type: Type): Table {
  let columns = Array(type.length);
  for (let i = 0; i < columns.length; i++) {
    columns[i] = [];
  }
  return {
    _type: type,
    _entities: [],
    _columns: columns
  };
}

export function insertIntoTable(table: Table, entity: Entity): number {
  let index = table._entities.push(entity) - 1;

  for (let i = 0; i < table._columns.length && i < table._type.length; i++) {
    table._columns[i].push(allocateType(table._type[i], EMPTY_ARGUMENTS));
  }

  return index;
}

export function removeFromTable(table: Table, index: number): void {
  let entities = table._entities;

  entities[index] = entities[entities.length - 1];
  entities[index]._index = index;
  entities.pop();

  for (let column of table._columns) {
    column[index] = column[column.length - 1];
    column.pop();
  }
}

export function clearTable(table: Table): void {
  for (let entity of table._entities) {
    entity._table = null;
  }

  table._entities.length = 0;

  for (let column of table._columns) {
    column.length = 0;
  }
}
