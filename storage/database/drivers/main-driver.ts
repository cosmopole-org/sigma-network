import mongoose from 'mongoose';
import config from '../../config';
import { S3Client } from "@aws-sdk/client-s3";

const connectMongoClient = async () => {
  return new Promise(resolve => {
    mongoose.connect(config.MONGODB_URI,
      (err) => {
        if (err) {
          console.error('FAILED TO CONNECT TO MONGODB');
          console.error(err);
        } else {
          console.log('CONNECTED TO MONGODB');
          resolve({})
        }
      });
  })
};

let s3Client: S3Client;

const connectToS3 = async () => {
  s3Client = new S3Client({
    region: "default",
    endpoint: config.LIARA_ENDPOINT,
    credentials: {
      accessKeyId: config.LIARA_ACCESS_KEY,
      secretAccessKey: config.LIARA_SECRET_KEY
    },
  });
};

export {
  connectMongoClient,
  connectToS3,
  s3Client
}
