import * as Schemas from "database/schemas/";
import { connectMongoClient, connectToS3 } from '../drivers/main-driver';
import fs from 'fs';

const setupDatabase = async () => {
    connectMongoClient()
    await connectToS3()
    Schemas.build()
    if (!fs.existsSync(process.cwd() + '/data')) fs.mkdirSync(process.cwd() + '/data');
    if (!fs.existsSync(process.cwd() + '/data/files')) fs.mkdirSync(process.cwd() + '/data/files');
    if (!fs.existsSync(process.cwd() + '/data/previews')) fs.mkdirSync(process.cwd() + '/data/previews');
    if (!fs.existsSync(process.cwd() + '/data/temp')) fs.mkdirSync(process.cwd() + '/data/temp');
    if (!fs.existsSync(process.cwd() + '/data/pdf-pages')) fs.mkdirSync(process.cwd() + '/data/pdf-pages');
}

export {
    setupDatabase
}
