import { connect } from 'mongoose';
import addresses from '../config/config';

const mongodbUri = addresses.MONGODB_URI;

const connectMongoClient = () => {
  connect(mongodbUri)
}

export {
  connectMongoClient
}