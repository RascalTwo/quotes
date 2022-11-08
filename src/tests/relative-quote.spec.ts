import request from 'supertest';

import app from '../server';
import { setDatabaseData } from './setup';

describe('relative quote endpoints', () => {
	before(() => setDatabaseData({
		medias: [
			{ _id: 'mid', title: 'Movie' },
			{ _id: 'tv2', title: 'Show', season: 1, episode: '2' },
		],
		quotes: [
			{ media: 'tv1', text: 'Episode1', timeStamp: 1.0 },
			{ media: 'tv2', text: 'First', timeStamp: 1.0 },
			{ media: 'tv2', text: 'Middle', timeStamp: 2.0 },
			{ media: 'tv2', text: 'Last', timeStamp: 3.0 },
			{ media: 'mid', text: 'First', timeStamp: 1.0 },
			{ media: 'mid', text: 'Middle', timeStamp: 2.0 },
			{ media: 'mid', text: 'Last', timeStamp: 3.0 },
		]
	}));
	describe('previous', () => {
		it('gets previous quote', async () => {
			await request(app).get('/api/previous?title=Show&season=1&episode=2&timeStamp=2.0')
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect({ quote: { media: { title: 'Show', season: 1, episode: '2' }, text: 'First', timeStamp: 1.0 } })
			await request(app).get('/api/previous?title=Movie&timeStamp=2.0')
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect({ quote: { media: { title: 'Movie' }, text: 'First', timeStamp: 1.0 } })
		});

		it('gets nothing when first quote', async () => {
			await request(app).get('/api/previous?title=Show&season=1&episode=2&timeStamp=1.0')
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect({ quote: null })
			await request(app).get('/api/previous?title=Movie&timeStamp=1.0')
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect({ quote: null })
		});
	})

	describe('next', () => {

		it('gets next quote', async () => {
			await request(app).get('/api/next?title=Show&season=1&episode=2&timeStamp=1.0')
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect({ quote: { media: { title: 'Show', season: 1, episode: '2' }, text: 'Middle', timeStamp: 2.0 } })
			await request(app).get('/api/next?title=Movie&timeStamp=1.0')
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect({ quote: { media: { title: 'Movie' }, text: 'Middle', timeStamp: 2.0 } })
		});

		it('gets nothing when last quote', async () => {
			await request(app).get('/api/next?title=Show&season=1&episode=2&timeStamp=3.0')
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect({ quote: null })
			await request(app).get('/api/next?title=Movie&timeStamp=3.0')
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect({ quote: null })
		});
	})
});