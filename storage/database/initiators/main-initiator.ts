import * as Schemas from "database/schemas/";
import { connectMongoClient, connectToS3 } from '../drivers/main-driver';
import fs from 'fs';
import config from "config";

const setupDatabase = async () => {
    await connectMongoClient()
    await connectToS3()
    Schemas.build()
    if (!config.bridge.existsSync('data')) await config.bridge.mkdir('data', {recursive: true});
    if (!config.bridge.existsSync('data/files')) await config.bridge.mkdir('data/files', {recursive: true});
    if (!config.bridge.existsSync('data/previews')) await config.bridge.mkdir('data/previews', {recursive: true});
    if (!config.bridge.existsSync('data/temp')) await config.bridge.mkdir('data/temp', {recursive: true});
    if (!config.bridge.existsSync('data/pdf-pages')) await config.bridge.mkdir('data/pdf-pages', {recursive: true});
}

export {
    setupDatabase
}
