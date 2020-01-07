import { suite } from "../utils.js";
import * as luna from "./luna.js";
import * as perform from "./perform-ecs.js";

const NUM_ENTITIES = 1000;

const LABEL_CREATE = `create and delete (${4 *
  NUM_ENTITIES} entities, 3 systems)`;
const LABEL_UPDATE = `update (${4 * NUM_ENTITIES} entities, 3 systems)`;

suite("Luna")
  .add(LABEL_CREATE, luna.bench_create_delete(NUM_ENTITIES))
  .add(LABEL_UPDATE, luna.bench_update(NUM_ENTITIES))
  .run();

suite("Perform-ecs")
  .add(LABEL_CREATE, perform.bench_create_delete(NUM_ENTITIES))
  .add(LABEL_UPDATE, perform.bench_update(NUM_ENTITIES))
  .run();
