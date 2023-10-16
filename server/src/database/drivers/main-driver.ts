import { connect } from 'mongoose';
import addresses from '../../config.json';

const mongodbUri = addresses.MONGODB_URI;

const connectMongoClient = () => {
  connect(mongodbUri)
}

export {
  connectMongoClient
}