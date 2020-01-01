import {
  createEntity,
  Entity,
  EntityIndex,
  EntityVersion,
  getIndex,
  getVersion
} from "./entity";
import { swapRemove } from "./utils";

class Archetype {
  _entities: Entity[];
  _components: Map<Function, any[]>;

  constructor(types: Function[]) {
    this._entities = [];
    this._components = new Map(types.map(type => [type, []]));
  }
}

export class World {
  private _free: EntityIndex[];
  private _versions: EntityVersion[];
  private _archetypes: Archetype[];
  private _locations: number[];

  constructor() {
    this._free = [];
    this._versions = [];
    this._archetypes = [];
    this._locations = [];
  }

  create<T extends object[]>(componentSets: T[]): Entity[] {
    const types = componentSets[0].map(component => component.constructor);

    const archetypeIndex = this._findOrCreateArchetype(types);
    const archetype = this._archetypes[archetypeIndex];

    const storages = types.map(type => archetype._components.get(type)!);
    const start = archetype._entities.length;

    for (const components of componentSets) {
      const entity = this._allocate();
      const index = getIndex(entity);

      const componentIndex = archetype._entities.push(entity) - 1;

      this._locations[(index << 1) + 0] = archetypeIndex;
      this._locations[(index << 1) + 1] = componentIndex;

      for (let i = 0; i < components.length; i++) {
        storages[i].push(components[i]);
      }
    }

    return archetype._entities.slice(start);
  }

  delete(entity: Entity): boolean {
    if (this.isAlive(entity)) {
      const index = getIndex(entity);
      const version = getVersion(entity);
      const archetypeIndex = this._locations[(index << 1) + 0];
      const componentIndex = this._locations[(index << 1) + 1];
      const archetype = this._archetypes[archetypeIndex];
      for (const storage of archetype._components.values()) {
        swapRemove(storage, componentIndex);
      }
      const swapped = swapRemove(archetype._entities, componentIndex);
      if (swapped) {
        this._locations[(getIndex(swapped) << 1) + 1] = componentIndex;
      }
      this._versions[index] = (version + 1) & 255;
      this._free.push(index);
      return true;
    } else {
      return false;
    }
  }

  isAlive(entity: Entity): boolean {
    return this._versions[getIndex(entity)] === getVersion(entity);
  }

  getComponent<T>(entity: Entity, type: Function): T | undefined {
    if (this.isAlive(entity)) {
      const index = getIndex(entity);
      const archetypeIndex = this._locations[(index << 1) + 0];
      const componentIndex = this._locations[(index << 1) + 1];
      const archetype = this._archetypes[archetypeIndex];
      const storage = archetype._components.get(type);
      if (storage) {
        return storage[componentIndex];
      }
    }

    return undefined;
  }

  private _allocate(): Entity {
    if (this._free.length > 0) {
      const index = this._free.pop()!;
      const version = this._versions[index];
      return createEntity(index, version);
    } else {
      const index = this._versions.length;
      this._locations.push(0, 0);
      this._versions.push(0);
      return createEntity(index, 0);
    }
  }

  private _findOrCreateArchetype(types: Function[]): number {
    const archetypeIndex = this._archetypes.findIndex(
      archetype =>
        types.length === archetype._components.size &&
        types.every(type => archetype._components.has(type))
    );

    if (archetypeIndex < 0) {
      return this._archetypes.push(new Archetype(types)) - 1;
    } else {
      return archetypeIndex;
    }
  }
}

export class Query<T extends any[]> {
  private _types: Function[];

  constructor(types: Function[]) {
    this._types = types;
  }

  keys(world: World): Entity[] {
    let entities: Entity[] = [];

    this._forEachMatchingArchetypes(world, archetype => {
      entities.push(...archetype._entities);
    });

    return entities;
  }

  values(world: World): T[] {
    let values: T[] = [];

    this._forEachMatchingArchetypes(world, archetype => {
      let start = values.length;
      let size = archetype._entities.length;
      let storages = this._types.map(type => archetype._components.get(type)!);

      values.length += archetype._entities.length;

      for (let i = 0; i < size; i++) {
        values[start + i] = storages.map(storage => storage[i]) as T;
      }
    });

    return values;
  }

  private _forEachMatchingArchetypes(
    world: World,
    callback: (archetype: Archetype) => void
  ): void {
    for (let archetype of world["_archetypes"]) {
      if (
        this._types.length <= archetype._components.size &&
        this._types.every(type => archetype._components.has(type))
      ) {
        callback(archetype);
      }
    }
  }
}
