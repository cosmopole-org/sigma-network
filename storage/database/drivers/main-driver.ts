import mongoose from 'mongoose';
import config from '../../config';
import { S3Client, CreateBucketCommand } from "@aws-sdk/client-s3";

const mongodbUri = "mongodb://root:qiZVTnmWpWzBgslMkKCYpyGo@robin.iran.liara.ir:32475/my-app?authSource=admin&replicaSet=rs0&directConnection=true";

const connectMongoClient = () => {
  mongoose.connect(mongodbUri,
    (err) => {
      if (err) {
        console.error('FAILED TO CONNECT TO MONGODB');
        console.error(err);
      } else {
        console.log('CONNECTED TO MONGODB');
      }
    });
};

let s3Client: S3Client;

const connectToS3 = async () => {
  const client = new S3Client({
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
