import { MongoMemoryServer } from 'mongodb-memory-server';
import getClient from '../database.js';
import { attachOpenAPI, errorHandler } from '../server.js';

/** @type {import('express').Application} */
export default (app) => {
	/** @type {MongoMemoryServer} */
	let mongod = null
	let oldURI = process.env.MONGODB_URL
	const DB_PORT = Math.floor(Math.random() * (65535 - 1024) + 1024)

	before(async () => {
		mongod = await MongoMemoryServer.create({ instance: { port: DB_PORT } });

		oldURI = process.env.MONGODB_URL;
		process.env.MONGODB_URL = mongod.getUri();
		const client = await getClient().connect();
		const collection = client.db('quotes').collection('quotes');
		await collection.createIndex({ text: 'text' });
		await collection.insertMany([
			{ show: 'Test Show', text: 'Test Quote', season: 1, episodes: [1, 2], timeStamp: 54.18 },
			{ show: 'Another One', text: 'Another One', season: 2, episodes: [1], timeStamp: 54.67 },
			{ show: 'Relative Show', text: 'First', season: 3, episodes: [9], timeStamp: 45.75 },
			{ show: 'Relative Show', text: 'Middle', season: 3, episodes: [9], timeStamp: 54.67 },
			{ show: 'Relative Show', text: 'Last', season: 3, episodes: [9], timeStamp: 67.52 },
		]);
		await attachOpenAPI(app);
		app.use(errorHandler);
	});


	after(async () => {
		await getClient().close();
		await mongod.stop();
		process.env.MONGODB_URL = oldURI
		await new Promise(resolve => setTimeout(resolve, 1000));
	})

}