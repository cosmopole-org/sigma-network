
import { connectMongoClient } from '../drivers/main-driver';
import { buildSchemas } from '../schema/build';

export let setupDatabase = async () => {
    connectMongoClient();
    buildSchemas();
}
