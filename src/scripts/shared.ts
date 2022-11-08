import 'dotenv/config';
import { MongoClient, ObjectId } from 'mongodb';
// @ts-ignore
import parseSRT from 'parse-srt';
import { stripHtml } from 'string-strip-html';

interface RawQuote {
	media: RawMedia;
	string: string;
	timeStamp: number;
}

interface RawMedia {
	_id?: ObjectId;
	title: string;
	season?: number;
	episodes?: number[];
}

export const cleanupParsedSRTs = (srt: string, media: RawMedia) => parseSRT(srt)
	.map(({ start: timeStamp, text }: { start: number, text: string}) => ({
		media, timeStamp,
		text: stripHtml(text).result.trim()
	}))
	.filter(({ text }: { text: string }) => text);

export async function replaceInDB(title: string, quotes: RawQuote[], medias: RawMedia[]) {
	console.log('Media(s) Parsed  :', medias.length);
	console.log('Quote(s) Parsed  :', quotes.length);

	const client = new MongoClient(process.env.MONGODB_URL!);
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