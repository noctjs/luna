export type Type = TypeDefinition[];

export interface TypeDefinition {
  id: number;
  ctor: Function;
}

export interface TypeRegistry {
  _root: TypeNode;
  _components: Map<Function, TypeDefinition>;
}

interface TypeNode {
  _type: Type;
  _nodes: Map<TypeDefinition, TypeNode>;
}

const EMPTY_TYPE: Type = [];

function createTypeNode(type: Type): TypeNode {
  return {
    _type: type,
    _nodes: new Map()
  };
}

export function createTypeRegistry(): TypeRegistry {
  return {
    _root: createTypeNode(EMPTY_TYPE),
    _components: new Map()
  };
}

export function findType(root: TypeNode, type: Type): Type {
  let node = root;
  for (let i = 0; i < type.length; i++) {
    let def = type[i];
    let next = node._nodes.get(def);
    if (next) {
      node = next;
    } else {
      node = createTypeNode(type.slice(0, i + 1));
      node._nodes.set(def, node);
    }
  }
  return node._type;
}

export function registerComponent(
  registry: TypeRegistry,
  ctor: Function
): Type {
  let def = registry._components.get(ctor);
  if (!def) {
    def = {
      id: registry._components.size,
      ctor
    };

    registry._components.set(ctor, def);
  }

  return findType(registry._root, [def]);
}

export function registerType(registry: TypeRegistry, types: Type[]): Type {
  return findType(registry._root, createTypeFromArray(types));
}

export function createTypeFromArray(types: Type[]): Type {
  let new_type = EMPTY_TYPE;
  for (let type of types) {
    new_type = mergeTypes(new_type, type, EMPTY_TYPE);
  }

  return new_type;
}

export function containsType(type1: Type, type2: Type): boolean {
  if (type1 === type2) {
    return true;
  }

  if (type1.length < type2.length) {
    return false;
  }

  let index1 = 0;
  let def1 = null;

  for (let def2 of type2) {
    if (index1 >= type1.length) {
      return false;
    }

    def1 = type1[index1];

    if (def1.id < def2.id) {
      do {
        ++index1;
        if (index1 >= type1.length) {
          return false;
        }
        def1 = type1[index1];
      } while (def1.id < def2.id);
    }

    if (def1 === def2) {
      if (++index1 < type1.length) {
        def1 = type1[index1];
      }
    } else {
      return false;
    }
  }

  return true;
}

export function mergeTypes(type: Type, to_add: Type, to_delete: Type): Type {
  let new_type = [];

  let index_cur = 0;
  let index_add = 0;
  let index_del = 0;

  let length_cur = type.length;
  let length_add = to_add.length;
  let length_del = to_delete.length;

  let cur = index_cur < length_cur ? type[0] : null;
  let add = index_add < length_add ? to_add[0] : null;
  let del = index_del < length_del ? to_delete[0] : null;

  do {
    if (add && (!cur || cur.id > add.id)) {
      new_type.push(add);
      add = ++index_add < length_add ? to_add[index_add] : null;
    } else if (add && cur && cur.id === add.id) {
      new_type.push(add);
      add = ++index_add < length_add ? to_add[index_add] : null;
      cur = ++index_cur < length_cur ? type[index_cur] : null;
    } else if (del && (!cur || del.id < cur.id)) {
      del = ++index_del < length_del ? to_delete[index_del] : null;
    } else if (del && cur && del.id === cur.id) {
      del = ++index_del < length_del ? to_delete[index_del] : null;
      cur = ++index_cur < length_cur ? type[index_cur] : null;
    } else if (cur) {
      new_type.push(cur);
      cur = ++index_cur < length_cur ? type[index_cur] : null;
    }
  } while (cur || add);

  return new_type;
}

export function allocateType<T>(def: TypeDefinition, args: any[]): T {
  return def.ctor(...args);
}

export function getTypeIndex(type: Type, def: TypeDefinition): number {
  return type.indexOf(def);
}
