import 'dotenv/config';
import { MongoClient } from 'mongodb'
import express from 'express';


const PORT = process.env.PORT || 1337;
const MONGODB_URL = process.env.MONGODB_URL;

const app = express();
app.use(express.urlencoded({ extended: true }));

app.get('/', (request, response) => {
	response.render('index.ejs', { quotes: [] })
});

app.get('/search', (request, response, next) => {
	const { query } = request.query;
	if (!query) return response.render('index.ejs', { quotes: [] });

	return client.db('quotes').collection('quotes').find(query.length > 3
		? { $text: { $search: `\"${query}\"` } }
		: { text: { $regex: [...query].map(char => `[${char}]`).join(''), $options: 'i' } }
	).toArray()
		.then(quotes => response.render('index.ejs', { quotes, query }))
		.catch(next);
});


if (!MONGODB_URL) throw new Error('MONGODB_URL environment variable required.')

const client = new MongoClient(process.env.MONGODB_URL);
client.connect().then(client => {
  console.log('Connected successfully to server');

	app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
}).catch(console.error)
