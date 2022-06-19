import { MongoClient }  from 'mongodb';

/** @type {MongoClient} */
let client = null;
if (!process.env.MONGODB_URL) throw new Error('MONGODB_URL environment variable required.')
export default () =>{
	if (!client) client = new MongoClient(process.env.MONGODB_URL);
	return client;
}