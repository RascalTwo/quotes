import { Application } from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import getClient from '../database';
import { attachOpenAPI, errorHandler } from '../server';

export async function setDatabaseData({ quotes = [], medias = [] }: { quotes?: object[], medias?: object[] }) {
	const db = getClient().db('quotes');
	const mediaCollection = db.collection('medias');
	const quotesCollection = db.collection('quotes');
	await mediaCollection.deleteMany({});
	await quotesCollection.deleteMany({});
	if (medias.length) await mediaCollection.insertMany(medias);
	if (quotes.length) await quotesCollection.insertMany(quotes);
}

export default (app: Application) => {
	let mongod: MongoMemoryServer | null = null
	let oldURI = process.env.MONGODB_URL
	const DB_PORT = Math.floor(Math.random() * (65535 - 1024) + 1024)

	before(async () => {
		console.log('Setting up test database...')
		mongod = await MongoMemoryServer.create({ instance: { port: DB_PORT } });

		oldURI = process.env.MONGODB_URL;
		process.env.MONGODB_URL = mongod.getUri();
		const client = await getClient().connect();
		const quotesCollection = client.db('quotes').collection('quotes');
		await quotesCollection.createIndex({ text: 'text' });
		await client.db('quotes').collection('medias').insertOne({ title: 'AtLeastOneMediaRequried' });

		await attachOpenAPI(app);
		app.use(errorHandler);
		console.log('Setup complete.')
	});


	after(async () => {
		console.log('Closing test database...')
		await getClient().close();
		await mongod?.stop();
		process.env.MONGODB_URL = oldURI
		await new Promise(resolve => setTimeout(resolve, 1000));
		console.log('Closed test database.');
		// Two different MongoClient connections are established, one from here and one from the server
		// which results in the tests hanging - hence the explicit exit.
		process.exit(0);
	})

}