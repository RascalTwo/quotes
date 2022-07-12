import getClient from './database.js';

const stripQuote = ({ _id, ...quote }) => quote

export function queryRandomQuote() {
	return getClient().db('quotes').collection('quotes').aggregate([
		{ $sample: { size: 1 } },
		{
			$lookup: {
				from: 'medias',
				localField: 'media',
				foreignField: '_id',
				as: 'media'
			},
		},
		{
			$project: {
				_id: 0,
				text: 1,
				timeStamp: 1,
				media: { $arrayElemAt: ['$media', 0] }
			}
		},
		{ $unset: ['media._id'] },
	]).toArray()
		.then(([quote]) => quote)
}

export async function queryDBForQuote(query, title, season, episode, page, perPage, includeCounts) {
	if (!query) return { quotes: [], counts: { total: 0, page: 0 } };

	const textFilter = query.length > 3
		? { $text: { $search: `\"${query}\"` } }
		: { text: { $regex: [...query].map(char => `[${char}]`).join(''), $options: 'i' } };

	const mediaFilter = {};
	if (title) mediaFilter['media.title'] = new RegExp(title, 'i');
	if (season) mediaFilter['media.season'] = +season;
	if (episode) mediaFilter['media.episode'] = episode;

	return getClient().db('quotes').collection('quotes')
		.aggregate([
			{ $match: textFilter },
			{
				$lookup: {
					from: 'medias',
					localField: 'media',
					foreignField: '_id',
					as: 'media'
				},
			},
			{
				$project: {
					_id: 0,
					text: 1,
					timeStamp: 1,
					media: { $arrayElemAt: ['$media', 0] }
				}
			},
			{ $match: mediaFilter },
			{ $unset: ['media._id'] },
			{ $sort: { 'media.title': 1, 'media.season': 1, 'media.episode': 1, timeStamp: 1 } },
			{
				$facet: {
					total: [{ $count: "count" }],
					quotes: [
						{ $skip: perPage * (page - 1) },
						{ $limit: perPage }]
				}
			},
		]).toArray()
		.then(async ([{ quotes, total: [rawTotal]  }]) => {

			const results = { quotes };
			if (includeCounts) {
				results.counts = {
					total: rawTotal?.count || 0
				};
				results.counts.page = Math.ceil(results.counts.total / perPage);
			}

			return results;
		})

}

export async function queryTitles() {
	return getClient().db('quotes').collection('medias').distinct('title');
}

export async function queryMediaInfo(title) {
	return getClient().db('quotes').collection('medias').aggregate([
		{ $match: { title }, },
		{ $unset: ['_id', 'title'] },
		{ $sort: { season: 1, episode: 1 } },
	]).toArray().then(entities => {
		const seasons = entities.reduce((seasons, { season, episode }) => {
			if (!season) return seasons;
			if (!(season in seasons)) seasons[season] = [];
			seasons[season].push(episode);
			seasons[season].sort((a, b) => parseInt(a) - parseInt(b));
			return seasons;
		}, {});
		for (const season in seasons) {
			const episodeNumberWidth = seasons[season].flatMap(ep => ep.split('-')).map(Number).reduce((a, b) => Math.max(a, b)).toString().length;
			for (const index in seasons[season]) {
				const episode = seasons[season][index];
				seasons[season][index] = episode.split('-').map(Number).map(num => num.toString().padStart(episodeNumberWidth, '0')).join('-');
			}
		}
		return Object.keys(seasons).length > 0 ? { title, seasons } : { title };
	});
}

export async function queryPreviousQuote({ media, timeStamp }) {
	if (media.season === undefined) delete media.season;
	if (media.episode === undefined) delete media.episode;

	return getClient().db('quotes').collection('medias')
		.aggregate([
			{ $match: media },
			{
				$lookup: {
					from: 'quotes',
					localField: '_id',
					foreignField: 'media',
					as: 'quotes',
					pipeline: [
						{ $match: { timeStamp: { $lt: timeStamp } } },
						{ $sort: { timeStamp: -1 } },
						{ $limit: 1 },
						{ $unset: '_id' }
					]
				},
			},
			{ $unwind: '$quotes' },
			{
				$project: {
					_id: 0,
					text: '$quotes.text',
					timeStamp: '$quotes.timeStamp',
					media: {
						title: '$title',
						season: '$season',
						episode: '$episode'
					}
				}
			}
		]).toArray().then(([quote]) => quote || null);
}

export async function queryNextQuote({ media, timeStamp }) {
	if (media.season === undefined) delete media.season;
	if (media.episode === undefined) delete media.episode;

	return getClient().db('quotes').collection('medias')
		.aggregate([
			{ $match: media },
			{
				$lookup: {
					from: 'quotes',
					localField: '_id',
					foreignField: 'media',
					as: 'quotes',
					pipeline: [
						{ $match: { timeStamp: { $gt: timeStamp } } },
						{ $sort: { timeStamp: 1 } },
						{ $limit: 1 },
						{ $unset: '_id' }
					]
				},
			},
			{ $unwind: '$quotes' },
			{
				$project: {
					_id: 0,
					text: '$quotes.text',
					timeStamp: '$quotes.timeStamp',
					media: {
						title: '$title',
						season: '$season',
						episode: '$episode'
					}
				}
			}
		]).toArray().then(([quote]) => quote || null);
}