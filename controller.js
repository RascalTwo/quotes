import getClient from './database.js';

const stripQuote = ({ _id, ...quote }) => quote

export function queryRandomQuote() {
	return getClient().db('quotes').collection('quotes').aggregate([{ $sample: { size: 1 } }]).toArray()
		.then(([quote]) => stripQuote(quote))
}

export async function queryDBForQuote(query, show = undefined, season = undefined, episodes = undefined, page = 1, perPage = 100, includeCounts = false) {
	if (!query) return { quotes: [], counts: { total: 0, page: 0 } };

	const filter = query.length > 3
		? { $text: { $search: `\"${query}\"` } }
		: { text: { $regex: [...query].map(char => `[${char}]`).join(''), $options: 'i' } };
	if (show) filter.show = new RegExp(show, 'i');
	if (season) filter.season = +season;
	if (episodes) filter.episodes = +episodes;

	return getClient().db('quotes').collection('quotes')
		.find(filter)
		.sort({ show: 'asc', season: 'asc', episodes: 'asc', timeStamp: 'asc' })
		.skip((page - 1) * perPage)
		.limit(perPage)
		.toArray()
		.then(async quotes => {
			const results = { quotes: quotes.map(stripQuote) };

			if (includeCounts) {
				results.counts = {
					total: await getClient().db('quotes').collection('quotes').countDocuments(filter)
				};
				results.counts.page = Math.ceil(results.counts.total / perPage);
			}

			return results;
		})
}

export async function queryShowNames() {
	return getClient().db('quotes').collection('quotes').distinct('show');
}

export async function queryShowInfo(show) {
	return getClient().db('quotes').collection('quotes').aggregate([{
		$match: { show }
	}, {
		$group: { _id: { season: "$season", episodes: "$episodes" } }
	}]).toArray().then(entities => entities.reduce((seasons, { _id: { season, episodes } }) => {
		if (!(season in seasons)) seasons[season] = [];
		seasons[season].push(episodes.join('-'));
		seasons[season].sort((a, b) => parseInt(a) - parseInt(b));
		return seasons;
	}, {}));
}

export async function queryPreviousQuote({ show, season, episodes, timeStamp }) {
	return getClient().db('quotes').collection('quotes')
		.find({ show, season, episodes, timeStamp: { $lt: timeStamp } })
		.sort({ timeStamp: 'desc' })
		.limit(1).toArray().then(([quote]) => quote ? stripQuote(quote) : null);
}

export async function queryNextQuote({ show, season, episodes, timeStamp }) {
	return getClient().db('quotes').collection('quotes')
		.find({ show, season, episodes, timeStamp: { $gt: timeStamp } })
		.sort({ timeStamp: 'asc' })
		.limit(1).toArray().then(([quote]) => quote ? stripQuote(quote) : null);
}