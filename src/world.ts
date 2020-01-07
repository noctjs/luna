import { Query, rematchTableQuery } from "./query";
import { createTable, Table } from "./table";
import { Type, TypeRegistry } from "./type";

export interface World {
  _registry: TypeRegistry;
  _tables: Map<Type, Table>;
  _queries: Query[];
}

export function createWorld(registry: TypeRegistry): World {
  let world = {
    _registry: registry,
    _tables: new Map(),
    _queries: []
  };

  return world;
}

export function getTable(world: World, type: Type): Table {
  let table = world._tables.get(type);
  if (!table) {
    table = createTable(type);
    world._tables.set(type, table);
    for (let query of world._queries) {
      rematchTableQuery(table, query);
    }
  }
  return table;
}
