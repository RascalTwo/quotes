import request from 'supertest';

import app from '../server.js';

it('returns show info', async () => {
	await request(app).get('/api/show-info?show=Test Show')
		.expect(200)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect({
			1: ['1-2']
		})
});