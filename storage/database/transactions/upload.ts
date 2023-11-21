
import { generatePreview } from '../../utils/previewer';
import { Document } from '../schemas/document.schema';
import { Preview } from 'database/schemas/preview.schema';
import folders from '../../folders';
import config from '../../config';
import fs from "fs";
import mongoose from 'mongoose';
import { s3Client } from '../drivers/main-driver';
import * as Utils from '../../utils'
import { PutObjectCommand } from '@aws-sdk/client-s3';

function getFilesizeInBytes(filename) {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

const finalup = async (path: string, roomId: string, humanId: string, isPublic: boolean, extension: string, type: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let preview = await Preview.create([{
    id: Utils.generator.makeUniqueId()
  }], { session })[0];
  let fileSize = getFilesizeInBytes(path);
  let document = await Document.create([{
    id: Utils.generator.makeUniqueId(),
    isPublic: isPublic,
    type: type,
    previewId: preview.id,
    time: Date.now(),
    secret: {
      uploaderId: humanId,
      roomIds: [roomId],
    },
    metadata: {
      size: fileSize,
      duration: 0,
      width: 0,
      height: 0,
      extension: extension,
    }
  }], { session })[0];
  await session.commitTransaction();
  session.endSession();
  const params = {
    Bucket: config.LIARA_BUCKET_NAME,
    Key: document.id,
    Body: fs.createReadStream(path)
  };
  try {
    await s3Client.send(new PutObjectCommand(params));
    let { duration, width, height } = await Utils.previewer.generatePreview(document.id, preview.id, type, extension)
    await fs.promises.rm(path)
    if (duration || (width && height)) {
      const session = await mongoose.startSession();
      session.startTransaction();
      if (duration) {
        document = await Document.findOneAndUpdate({ id: document.id }, { duration: duration }, { new: true }).session(session);
      } else if (width && height) {
        document = await Document.updateOne({ id: document.id }, { width: width, height: height }, { new: true }).session(session);
      }
      await session.commitTransaction();
      session.endSession();
    }
    return { success: true, document, preview };
  } catch (error) {
    console.log(error);
  }
}

export { finalup }