import assert from 'assert'
import request from 'supertest';
import app from '../server.js';

it('returns API status', async () => {
	await request(app).get('/api/status')
		.expect(200)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(({ body }) => {
			assert('now' in body, 'response has now');
			const diff = Date.now() - new Date(body.now).getTime();
			assert(diff < 1000, `Expected response to be within 1 second, but it was ${diff}ms`);
			assert('deployed' in body, 'response has deployed');
		});
});