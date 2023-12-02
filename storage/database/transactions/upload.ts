
import { Document } from '../schemas/document.schema';
import { Preview } from 'database/schemas/preview.schema';
import config from '../../config';
import fs from "fs";
import mongoose from 'mongoose';
import { s3Client } from '../drivers/main-driver';
import * as Utils from '../../utils'
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { Group } from 'database/schemas/group.schema';
import { execShellCommand } from 'utils/exec';

function getFilesizeInBytes(filename) {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

const finalup = async (path: string, roomId: string, humanId: string, isPublic: boolean, extension: string, type: string, title: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  let preview = (await Preview.create([{
    id: Utils.generator.makeUniqueId()
  }], { session }))[0];
  let fileSize = getFilesizeInBytes(path);
  let document = (await Document.create([{
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
      title: title
    }
  }], { session }))[0];
  let group = await Group.findOne({ roomId: roomId }).session(session).lean().exec()
  if (group === null) {
    group = (await Group.create([{
      roomId: roomId,
      docIds: [document.id]
    }], { session }))[0]
  } else {
    await Group.updateOne({ roomId: roomId }, { $push: { docIds: document.id } },).session(session)
  }
  await session.commitTransaction();
  session.endSession();
  try {
    let res = await Utils.previewer.generatePreview(path, document.id, preview.id, type, extension)
    let { duration, width, height, previewPath, waveformPath } = res
    const docParams = {
      Bucket: config.LIARA_BUCKET_NAME,
      Key: document.id,
      Body: fs.createReadStream(path)
    };
    await s3Client.send(new PutObjectCommand(docParams));
    let hasPhoto = false, hasWaveform = false
    if (previewPath?.length > 0) {
      hasPhoto = true
      const prevParams = {
        Bucket: config.LIARA_BUCKET_NAME,
        Key: preview.id,
        Body: fs.createReadStream(previewPath)
      };
      await s3Client.send(new PutObjectCommand(prevParams));
      await fs.promises.rm(previewPath)
    }
    if (waveformPath?.length > 0) {
      hasWaveform = true
      const prevParams = {
        Bucket: config.LIARA_BUCKET_NAME,
        Key: preview.id + '-waveform',
        Body: fs.createReadStream(waveformPath)
      };
      await s3Client.send(new PutObjectCommand(prevParams));
      await fs.promises.rm(waveformPath)
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    preview = await Preview.findOneAndUpdate({ id: preview.id }, { photo: hasPhoto, waveform: hasWaveform }, { new: true }).session(session);
    if (duration || (width && height)) {
      if (duration) {
        document = await Document.findOneAndUpdate({ id: document.id }, { duration: duration }, { new: true }).session(session);
      } else if (width && height) {
        document = await Document.findOneAndUpdate({ id: document.id }, { width: width, height: height }, { new: true }).session(session);
      }
    }
    await session.commitTransaction();
    session.endSession();
    return { success: true, document, preview };
  } catch (error) {
    console.log(error);
  }
}

export { finalup }
