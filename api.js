import { Router } from 'express';
import cors from 'cors';
import { queryDBForQuote, queryRandomQuote, queryShowInfo, queryShowNames } from './controller.js';

const router = Router();

router.use(cors());

router.get('/search', (request, response, next) => {
	const { query = '', show = undefined, season = undefined, episodes = undefined, page = 1, perPage = 100, includeCounts = false } = request.query;
	return queryDBForQuote(query, show, season, episodes, +page, +perPage, includeCounts)
		.then(({ quotes, totalCount, pageCount }) => response.send({ quotes, totalCount, pageCount }))
		.catch(next);
});

router.get('/show-names', (request, response, next) => {
	return queryShowNames().then(showNames => response.json(showNames)).catch(next)
});

router.get('/show-info', (request, response, next) => {
	const { show = undefined } = request.query;
	return queryShowInfo(show).then(showNames => response.json(showNames)).catch(next)
});

router.get('/random', (request, response, next) => {
	return queryRandomQuote()
		.then(quote => response.send(quote))
		.catch(next)
})

export default router;