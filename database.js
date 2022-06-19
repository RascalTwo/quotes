import { MongoClient }  from 'mongodb';

/** @type {MongoClient} */
let client = null;
export default () =>{
	/* c8 ignore next */
	if (!process.env.MONGODB_URL) throw new Error('MONGODB_URL environment variable required.')

	if (!client) client = new MongoClient(process.env.MONGODB_URL);
	return client;
}