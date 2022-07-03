import { MongoMemoryServer } from 'mongodb-memory-server';
import getClient from '../database.js';
import { attachOpenAPI, errorHandler } from '../server.js';

export async function setDatabaseData({ quotes = [], medias = [] }){
	const db = getClient().db('quotes');
	const mediaCollection = db.collection('medias');
	const quotesCollection = db.collection('quotes');
	await mediaCollection.deleteMany();
	await quotesCollection.deleteMany();
	if (medias.length) await mediaCollection.insertMany(medias);
	if (quotes.length) await quotesCollection.insertMany(quotes);
}

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
		const quotesCollection = client.db('quotes').collection('quotes');
		await quotesCollection.createIndex({ text: 'text' });
		await client.db('quotes').collection('medias').insertOne({ title: 'AtLeastOneMediaRequried' });

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