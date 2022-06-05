import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import client from './database.js';
import { queryDBForQuote, queryRandomQuote } from './controller.js';


const PORT = process.env.PORT || 1337;

const app = express();
app.use(express.urlencoded({ extended: true }));

app.get('/', (request, response) => {
	response.render('index.ejs', { quotes: [] })
});

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

router.get('/random', (request, response, next) => {
	return queryRandomQuote()
		.then(quote => response.send(quote))
		.catch(next)
})

app.use('/api', router);


client.connect().then(() => {
	console.log('Connected successfully to server');

	app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
}).catch(console.error)
