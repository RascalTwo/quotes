import { MongoClient } from 'mongodb';

let client: MongoClient | null = null;
export default () => {
  /* c8 ignore next */
  if (!process.env.MONGODB_URL) throw new Error('MONGODB_URL environment variable required.');

  if (!client) {
    client = new MongoClient(process.env.MONGODB_URL);
    console.log('Connecting database to', client.options.srvHost)
  }
  return client;
};
