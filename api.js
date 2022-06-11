import { Router } from 'express';
import cors from 'cors';
import { queryDBForQuote, queryRandomQuote, queryShowNames } from './controller';

const router = Router();

router.use(cors());

router.get('/search', (request, response, next) => {
	const { query = '', show = undefined, page = 1, perPage = 100, includeCounts = false } = request.query;
	return queryDBForQuote(query, show, +page, +perPage, includeCounts)
		.then(({ quotes, totalCount, pageCount }) => response.send({ quotes, totalCount, pageCount }))
		.catch(next);
});

router.get('/show-names', (request, response, next) => {
	return queryShowNames().then(showNames => response.json(showNames)).catch(next)
});

router.get('/random', (request, response, next) => {
	return queryRandomQuote()
		.then(quote => response.send(quote))
		.catch(next)
})

export default router;