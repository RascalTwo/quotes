import 'dotenv/config';
import express from 'express';
import { initialize } from 'express-openapi';
import swaggerUI from 'swagger-ui-express';

import client from './database.js';
import buildAPIDoc from './api/doc.js';
import { queryDBForQuote, queryShowInfo, queryShowNames } from './controller.js';


const PORT = process.env.PORT || 1337;

const app = express();
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', async (_, response) => {
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

client.connect().then(async () => {
	console.log('Connected successfully to server');

	const showNames = await queryShowNames();
	const openAPI = await initialize({
		app,
		apiDoc: buildAPIDoc(showNames),
		paths: './api/paths',
		exposeApiDocs: false,
		dependencies: { showNames }
	});
	app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(openAPI.apiDoc));
	app.use('/api-docs.json', (_, response) => response.send(openAPI.apiDoc));

	app.use((error, request, response, next) => {
		if (error instanceof Error) return next(error)
		response.status(error.status).send(error.errors);
	});

	app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
}).catch(console.error)
