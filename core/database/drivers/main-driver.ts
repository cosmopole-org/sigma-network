import mongoose, { connect } from 'mongoose';
import addresses from '../../config';

const connectMongoClient = async () => {
  await connect(addresses['MONGODB_URI'])
  await mongoose.connection.db.dropDatabase()
}

export {
  connectMongoClient
}