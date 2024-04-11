
import { Document } from '../schemas/document.schema';
import { s3Client } from '../drivers/main-driver';
import config from '../../config';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import IDocument from 'models/document.model';

const document = async (documentId: string, roomId: string, range: any, res: any, onEnd?: () => void) => {
  try {
    let success = false;
    let doc = await Document.findOne({ id: documentId }).exec() as IDocument;
    if (doc !== null) {
      if (doc.isPublic || (doc.secret.roomIds.includes(roomId))) {
        const params = {
          Bucket: config.LIARA_BUCKET_NAME,
          Key: documentId,
          Range: range
        }
        try {
          const data = await s3Client.send(new GetObjectCommand(params));
          data.Body.transformToWebStream().pipeTo(res).then(() => (onEnd && onEnd()))
        } catch (error) {
          console.log(error);
        }
        success = true;
      } else {
        console.error('access denied');
      }
    } else {
      console.error('document not found');
    }
    return { success: success };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

const preview = async (documentId: string, roomId: string, res: any) => {
  try {
    let success = false;
    let doc = await Document.findOne({ id: documentId }).exec() as IDocument;
    if (doc !== null) {
      if (doc.isPublic || (doc.secret.roomIds.includes(roomId))) {
        const params = {
          Bucket: config.LIARA_BUCKET_NAME,
          Key: doc.previewId
        }
        try {
          const data = await s3Client.send(new GetObjectCommand(params));
          data.Body.transformToWebStream().pipeTo(res)
        } catch (error) {
          console.log(error);
        }
        success = true
      }
    } else {
      console.error('document not found');
    }
    return { success: success };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

const waveform = async (documentId: string, roomId: string, res: any) => {
  try {
    let success = false;
    let doc = await Document.findOne({ id: documentId }).exec() as IDocument;
    if (doc !== null) {
      if (doc.isPublic || (doc.secret.roomIds.includes(roomId))) {
        if (doc.type === 'audio') {
          const params = {
            Bucket: config.LIARA_BUCKET_NAME,
            Key: doc.previewId + '-waveform'
          }
          try {
            const data = await s3Client.send(new GetObjectCommand(params));
            data.Body.transformToWebStream().pipeTo(res)
          } catch (error) {
            console.log(error);
          }
        }
        success = true;
      } else {
        console.error('access denied');
      }
    } else {
      console.error('document not found');
    }
    return { success: success };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

export {
  document,
  preview,
  waveform
}
