import 'dotenv/config';
import { MongoClient } from 'mongodb';
import parseSRT from 'parse-srt';
import { stripHtml } from 'string-strip-html';

/**
 * @typedef {Object} RawQuote
 * @property {RawMedia} media
 * @property {string} string
 * @property {timeStamp} number
 */

/**
 * @typedef {Object} RawMedia
 * @property {string} title
 * @property {number?} season
 * @property {number[]?} episodes
 */

export const cleanupParsedSRTs = (srt, media) => parseSRT(srt)
	.map(({ start: timeStamp, text }) => ({
		media, timeStamp,
		text: stripHtml(text).result.trim()
	}))
	.filter(({ text }) => text);

/**
 * @param {string} title
 * @param {RawQuote[]} quotes
 * @param {RawMedia[]} medias
 */
export async function replaceInDB(title, quotes, medias) {
	console.log('Media(s) Parsed  :', medias.length);
	console.log('Quote(s) Parsed  :', quotes.length);

	const client = new MongoClient(process.env.MONGODB_URL);
	await client.connect();
	const db = client.db('quotes');
	const quotesCollection = db.collection('quotes');
	const mediasCollection = db.collection('medias');


	const oldMedias = await mediasCollection.find({ title }, { projection: { _id: true } }).toArray()

	console.log('Media(s) Deleted :', (await mediasCollection.deleteMany({ title })).deletedCount);
	const mediasInsertResult = await mediasCollection.insertMany(medias)
	for (let i = 0; i < medias.length; i++) medias[i]._id = mediasInsertResult.insertedIds[i]

	const quotesDeleteResult = await quotesCollection.deleteMany({ media: { $in: oldMedias.map(document => document._id) } })
	console.log('Quote(s) Deleted :', quotesDeleteResult.deletedCount);

	console.log('Media(s) Inserted:', mediasInsertResult.insertedCount);
	console.log('Quote(s) Inserted:', (await quotesCollection.insertMany(quotes.map(({ media, ...quote }) => ({ ...quote, media: media._id })))).insertedCount);
	await quotesCollection.createIndex({ text: 'text' });

	return client.close();
}