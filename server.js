import 'dotenv/config';
import express from 'express';
import { initialize } from 'express-openapi';
import swaggerUI from 'swagger-ui-express';

import buildAPIDoc from './api/doc.js';
import { queryDBForQuote, queryShowInfo, queryShowNames } from './controller.js';


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

export const errorHandler = (error, _, response, next) => {
	if (error instanceof Error) return next(error)
	response.status(error.status).send(error.errors);
}

/**
 * @param {import('express').Application} app
 */
export const attachOpenAPI = async app => {
	const showNames = await queryShowNames();
	const openAPI = await initialize({
		app,
		apiDoc: buildAPIDoc(showNames),
		paths: './api/paths',
		exposeApiDocs: false,
		validateApiDoc: true,
		dependencies: { showNames }
	});
	app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(openAPI.apiDoc));
	app.use('/api-docs.json', (_, response) => response.send(openAPI.apiDoc));
}

export default app;