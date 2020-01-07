import { Entity } from "./entity";
import { Column, Table } from "./table";
import { containsType, getTypeIndex, Type } from "./type";
import { World } from "./world";

export type QueryCallback = (...args: any[]) => void;
export type QueryEntityCallback = (entity: Entity) => void;

export interface Query {
  _type: Type;
  _tables: Table[];
  _iterator: QueryCallback;
}

export function createQuery(world: World, type: Type): Query {
  let query = {
    _type: type,
    _iterator: compileTableIterator(type.length + 1),
    _tables: []
  };

  world._queries.push(query);

  for (let table of world._tables.values()) {
    rematchTableQuery(table, query);
  }

  return query;
}

export function rematchTableQuery(table: Table, query: Query) {
  if (containsType(table._type, query._type)) {
    query._tables.push(table);
  }
}

export function iterateQuery(query: Query, fn: QueryCallback): void {
  let iterate_table = query._iterator;

  for (let table of query._tables) {
    let columns = getMatchingColumns(table, query._type);
    iterate_table(...columns, table._entities, fn);
  }
}

export function iterateEntities(query: Query, fn: QueryEntityCallback): void {
  for (let table of query._tables) {
    for (let entity of table._entities) {
      fn(entity);
    }
  }
}

function compileTableIterator(size: number): QueryCallback {
  let cols = Array.from({ length: size }, (_, i) => `c${i}`);
  return Function(
    ...cols,
    "f",
    `for(var i=0;${cols.map(col => `i<${col}.length`).join("&&")};i++)` +
      `f(${cols.map(col => `${col}[i]`).join(",")})` +
      `//${Math.random()}`
  ) as QueryCallback;
}

function getMatchingColumns(table: Table, type: Type): Column[] {
  return type.map(def => table._columns[getTypeIndex(table._type, def)]);
}
