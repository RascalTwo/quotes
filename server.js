import 'dotenv/config';
import { MongoClient } from 'mongodb'
import express from 'express';
import cors from 'cors';


const PORT = process.env.PORT || 1337;
const MONGODB_URL = process.env.MONGODB_URL;

const app = express();
app.use(express.urlencoded({ extended: true }));

app.get('/', (request, response) => {
	response.render('index.ejs', { quotes: [] })
});

async function queryDBForQuote(query, page = 1, perPage = 100, includeCounts = false) {
	if (!query) return { quotes: [], ...(includeCounts ? { totalCount: 0 } : {}) };

	const filter = query.length > 3
		? { $text: { $search: `\"${query}\"` } }
		: { text: { $regex: [...query].map(char => `[${char}]`).join(''), $options: 'i' } };

	return client.db('quotes').collection('quotes')
		.find(filter)
		.sort({ season: 'asc', episodes: 'asc', timeStamp: 'asc' })
		.skip((page - 1) * perPage)
		.limit(perPage)
		.toArray()
		.then(async quotes => {
			const results = { quotes: quotes.map(({ _id, ...quote }) => quote) };

			if (includeCounts) {
				results.totalCount = await client.db('quotes').collection('quotes').countDocuments(filter);
				results.pageCount = Math.ceil(results.totalCount / perPage)
			}

			return results;
		})
}

app.get('/search', (request, response, next) => {
	const { query, page = 1, perPage = 100 } = request.query;
	return queryDBForQuote(query, +page, +perPage, true)
		.then(({ quotes, totalCount, pageCount }) => response.render('index.ejs', { quotes, query, totalCount, pageCount, page }))
		.catch(next);
});

const router = express.Router();

router.use(cors());

router.get('/search', (request, response, next) => {
	const { query = '', page = 1, perPage = 100, includeCounts = false } = request.query;
	return queryDBForQuote(query, +page, +perPage, includeCounts)
		.then(({ quotes, totalCount, pageCount }) => response.send({ quotes, query, totalCount, pageCount, page }))
		.catch(next);
});

app.use('/api', router);

if (!MONGODB_URL) throw new Error('MONGODB_URL environment variable required.')

const client = new MongoClient(process.env.MONGODB_URL);
client.connect().then(client => {
	console.log('Connected successfully to server');

	app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
}).catch(console.error)
