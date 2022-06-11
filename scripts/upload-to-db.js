import fs from 'fs';
import path from 'path';

import 'dotenv/config';
import parseSRT from 'parse-srt';
import { stripHtml } from 'string-strip-html';
import { MongoClient } from 'mongodb'

async function parseSRTs(directory, showName) {
	const entries = [];

	const absolute = path.resolve(directory)
	for (const entityName of await fs.promises.readdir(absolute)) {
		const entityAbsolute = path.join(absolute, entityName)
		if ((await fs.promises.stat(entityAbsolute)).isFile()) continue;

		const season = +entityName.match(/\d+/)[0]
		for (const srtFilename of await fs.promises.readdir(entityAbsolute)) {
			const episodes = srtFilename.match(/E\d+/ig).map(e => +e.slice(1));
			const srt = (await fs.promises.readFile(path.join(entityAbsolute, srtFilename))).toString();
			entries.push(...parseSRT(srt).map(({ start, text }) => ({
				show: showName,
				season,
				episodes,
				timeStamp: start,
				text: stripHtml(text).result.trim(),
			})));
		}
	}

	return entries;
}

const [_, __, directory, showName] = process.argv;
if (!directory || !showName) {
	console.error('directory and show name required');
	process.exit(1);
}

parseSRTs(directory, showName).then(async entries => {
	const client = new MongoClient(process.env.MONGODB_URL);
	await client.connect();

	console.log(entries.length, 'entries parsed');
	const collection = client.db('quotes').collection('quotes');
	console.log('Inserted:', (await collection.insertMany(entries)).insertedCount);
	await collection.createIndex({ text: 'text' });
	return client.close()
}).catch(console.error)
