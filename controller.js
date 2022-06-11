import client from './database.js';

const stripQuote = ({ _id, ...quote }) => quote

export function queryRandomQuote(){
	return client.db('quotes').collection('quotes').aggregate([{ $sample: { size: 1 }}]).toArray()
		.then(([quote]) => stripQuote(quote))
}

export async function queryDBForQuote(query, show = undefined, page = 1, perPage = 100, includeCounts = false) {
	if (!query) return { quotes: [], ...(includeCounts ? { totalCount: 0 } : {}) };

	const filter = query.length > 3
		? { $text: { $search: `\"${query}\"` } }
		: { text: { $regex: [...query].map(char => `[${char}]`).join(''), $options: 'i' } };
	if (show) filter.show = new RegExp(show, 'i');

	return client.db('quotes').collection('quotes')
		.find(filter)
		.sort({ show: 'asc', season: 'asc', episodes: 'asc', timeStamp: 'asc' })
		.skip((page - 1) * perPage)
		.limit(perPage)
		.toArray()
		.then(async quotes => {
			const results = { quotes: quotes.map(stripQuote) };

			if (includeCounts) {
				results.totalCount = await client.db('quotes').collection('quotes').countDocuments(filter);
				results.pageCount = Math.ceil(results.totalCount / perPage)
			}

			return results;
		})
}
