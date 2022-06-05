import { MongoClient } from 'mongodb';

const MONGODB_URL = process.env.MONGODB_URL;
if (!MONGODB_URL) throw new Error('MONGODB_URL environment variable required.')
export default new MongoClient(MONGODB_URL);