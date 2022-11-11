import path from 'path';
import fs from 'fs';
import 'dotenv/config';
import express from 'express';
import { initialize } from 'express-openapi';
import swaggerUI from 'swagger-ui-express';

import buildAPIDoc from './api/doc';
import { queryDBForQuote, queryMediaInfo, queryTitles } from './controller';
import { execSync } from 'child_process';

import type { Application, ErrorRequestHandler } from 'express';


/* c8 ignore next */
const DEPLOY_INFO = (() => {
	const rawParts = [process.env.npm_package_version]
	if (process.env.HEROKU_SLUG_COMMIT) rawParts.push(process.env.HEROKU_SLUG_COMMIT.slice(0, 7) + ' @ ' + process.env.HEROKU_RELEASE_CREATED_AT);

	try {
		rawParts.push(execSync('git rev-parse HEAD').toString().trim().slice(0, 7))
	} finally {
		return rawParts.filter(part => part !== undefined).join('-');
	}
})();

const app = express();
app.use(express.static('./public'));
app.use(express.static('./frontend/dist'));
app.use(express.urlencoded({ extended: true }));

app.get('/ejs', async (_, response) => {
	response.render('index.ejs', {
		quotes: [],
		mediaTitles: await queryTitles(),
		counts: { total: 0, page: 0 },
		relativeURL: '/search',
		DEPLOY_INFO
	})
});

app.get('/ejs/search', (request, response, next) => {
	const { query, title = undefined, season = undefined, episodes = undefined, page = 1, perPage = 100 } = request.query;

	const givenParams = Object.fromEntries(Object.entries(request.query).filter(([_, value]) => value))
	if ('page' in givenParams && page == 1) delete givenParams.page;
	if ('perPage' in givenParams && perPage == 100) delete givenParams.perPage;

	const params = new URLSearchParams(givenParams as Record<string, string>).toString();
	const relativeURL = request.path + (params ? '?' + params : '');

	if (relativeURL !== request.url) return response.redirect(relativeURL);

	return queryDBForQuote(query as string, title as string, season ? +season : undefined, episodes as string, +page, +perPage, true)
		.then(async ({ quotes, counts }) => response.render('index.ejs', {
			quotes, counts,
			query, title, season, episodes, page,
			mediaTitles: await queryTitles(),
			mediaInfo: title ? await queryMediaInfo(title as string) : undefined,
			relativeURL: relativeURL.slice(4),
			DEPLOY_INFO
		}))
		.catch(next);
});

export const errorHandler: ErrorRequestHandler = (error, _, response, next) => {
	if (error instanceof Error) return next(error)
	response.status(error.status).send(error.errors);
}


export const attachOpenAPI = async (app: Application) => {
	const titles = await queryTitles();
	const openAPI = await initialize({
		app,
		apiDoc: buildAPIDoc(titles),
		paths: './dist/api/paths',
		exposeApiDocs: false,
		validateApiDoc: true,
		dependencies: { titles, DEPLOY_INFO }
	});
	app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(openAPI.apiDoc));
	app.use('/api-docs.json', (_, response) => response.send(openAPI.apiDoc));

	const indexPath = path.join(__dirname, '../frontend/dist/index.html')
	app.get('*', (_, res) => {
		if (fs.existsSync(indexPath)) return res.sendFile(indexPath);
		res.status(500).send('Frontend not built');
	});
}

export default app;