import mongoose, { connect } from 'mongoose';
import addresses from '../../config.json';

const mongodbUri = addresses.MONGODB_URI;

const connectMongoClient = async () => {
  await connect(mongodbUri)
  await mongoose.connection.db.dropDatabase()
}

export {
  connectMongoClient
}