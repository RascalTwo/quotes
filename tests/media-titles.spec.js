import request from 'supertest';

import app from '../server.js';

describe('media-titles', () => {
	it('returns media titles', async () => {
		await request(app).get('/api/media-titles')
			.expect(200)
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect(['AtLeastOneMediaRequried']);
	});
})