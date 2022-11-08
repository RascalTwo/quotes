import assert from 'assert'
import request from 'supertest';
import app from '../server';
import { setDatabaseData } from './setup';

describe('/api/status', () => {
	before(() => setDatabaseData({
		quotes: [
			{ media: 'mid', text: 'Echo', timeStamp: 1.0 },
			{ media: 'tv1', text: 'Hello, World!', timeStamp: 2.0 },
			{ media: 'tv1', text: 'T', timeStamp: 1.0 },
		],
		medias: [
			{ _id: 'mid', title: 'Movie' },
			{ _id: 'tv1', title: 'Show', season: 1, episode: '1' },
		]
	}));

	it('returns API status', async () => {
		await request(app).get('/api/status')
			.expect(200)
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect(({ body }) => {
				assert('now' in body, 'response has now');
				const diff = Date.now() - new Date(body.now).getTime();
				assert(diff < 1000, `Expected response to be within 1 second, but it was ${diff}ms`);
				assert('deployed' in body, 'response has deployed');

				assert.deepEqual(body.medias, 2);
				assert.deepEqual(body.quotes, 3);
			});
	});
})