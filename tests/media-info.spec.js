import request from 'supertest';

import app from '../server.js';
import { setDatabaseData } from './setup.js';

describe('media-info', () => {
	before(() => setDatabaseData({
		medias: [
			{ _id: 'mid', title: 'Movie' },
			{ _id: 'tv1', title: 'Show', season: 1, episode: '1' },
			{ _id: 'tv2', title: 'Show', season: 1, episode: '2' },
			{ _id: 'tv3', title: 'Show', season: 2, episode: '1-2' },
			{ _id: 'tv4', title: 'Show', season: 2, episode: '3-4' },
			{ _id: 'tv5', title: 'BigShow', season: 1, episode: '1' },
			{ _id: 'tv6', title: 'BigShow', season: 1, episode: '10' },
		],
	}));

	it('returns movie info', async () => {
		await request(app).get('/api/media-info?title=Movie')
			.expect(200)
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect({
				title: 'Movie'
			})
	});

	it('returns tv show info', async () => {
		await request(app).get('/api/media-info?title=Show')
			.expect(200)
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect({
				title: 'Show',
				seasons: {
					1: ['1', '2'],
					2: ['1-2', '3-4']
				}
			})
	});

	it('returns episodes padded', async () => {
		await request(app).get('/api/media-info?title=BigShow')
			.expect(200)
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect({
				title: 'BigShow',
				seasons: {
					1: ['01', '10']
				}
			})
	});
});