import 'dotenv/config';
import express from 'express';

import client from './database.js';
import apiRouter from './api.js'
import { queryDBForQuote, queryShowInfo, queryShowNames } from './controller.js';


const PORT = process.env.PORT || 1337;

const app = express();
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', async (request, response) => {
	response.render('index.ejs', { quotes: [], showNames: await queryShowNames() })
});

app.get('/search', (request, response, next) => {
	const { query, show = undefined, season = undefined, episodes = undefined, page = 1, perPage = 100 } = request.query;
	return queryDBForQuote(query, show, season, episodes, +page, +perPage, true)
		.then(async ({ quotes, totalCount, pageCount }) => response.render('index.ejs', {
			quotes, totalCount, pageCount,
			query, show, season, episodes, page,
			showNames: await queryShowNames(),
			showInfo: show ? await queryShowInfo(show) : undefined
		}))
		.catch(next);
});

app.use('/api', apiRouter);

client.connect().then(() => {
	console.log('Connected successfully to server');

	app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
}).catch(console.error)
