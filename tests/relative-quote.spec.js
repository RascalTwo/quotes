import request from 'supertest';

import app from '../server.js';

describe('relative quote endpoints', () => {
	describe('previous', () => {
		it('gets previous quote', async () => {
			await request(app).get('/api/previous?show=Relative Show&season=3&episodes=9&timeStamp=54.67')
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect({ quote: { show: 'Relative Show', text: 'First', season: 3, episodes: [9], timeStamp: 45.75 } })
		});
		it('gets nothing when first quote', async () => {
			await request(app).get('/api/previous?show=Relative Show&season=3&episodes=9&timeStamp=45.75')
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect({ quote: null })
		});
	})
	describe('next', () => {
		it('gets next quote', async () => {
			await request(app).get('/api/next?show=Relative Show&season=3&episodes=9&timeStamp=54.67')
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect({ quote: { show: 'Relative Show', text: 'Last', season: 3, episodes: [9], timeStamp: 67.52 } })
		});
		it('gets nothing when last quote', async () => {
			await request(app).get('/api/next?show=Relative Show&season=3&episodes=9&timeStamp=67.52')
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8')
				.expect({ quote: null })
		});
	})
});