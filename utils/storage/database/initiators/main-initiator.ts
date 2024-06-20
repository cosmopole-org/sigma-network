import * as Schemas from "database/schemas/";
import { connectMongoClient, connectToS3 } from '../drivers/main-driver';
import fs from 'fs';
import config from "config";

const setupDatabase = async () => {
    await connectMongoClient()
    await connectToS3()
    Schemas.build()
    if (!fs.existsSync(`${config.TEMP_STORAGE}/data`)) await fs.promises.mkdir(`${config.TEMP_STORAGE}/data`, {recursive: true});
    if (!fs.existsSync(`${config.TEMP_STORAGE}/data/files`)) await fs.promises.mkdir(`${config.TEMP_STORAGE}/data/files`, {recursive: true});
    if (!fs.existsSync(`${config.TEMP_STORAGE}/data/previews`)) await fs.promises.mkdir(`${config.TEMP_STORAGE}/data/previews`, {recursive: true});
    if (!fs.existsSync(`${config.TEMP_STORAGE}/data/temp`)) await fs.promises.mkdir(`${config.TEMP_STORAGE}/data/temp`, {recursive: true});
    if (!fs.existsSync(`${config.TEMP_STORAGE}/data/pdf-pages`)) await fs.promises.mkdir(`${config.TEMP_STORAGE}/data/pdf-pages`, {recursive: true});
    if (!fs.existsSync(`${config.TEMP_STORAGE}/data/partitions`)) await fs.promises.mkdir(`${config.TEMP_STORAGE}/data/partitions`, {recursive: true});
}

export {
    setupDatabase
}
