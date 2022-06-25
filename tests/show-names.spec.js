import request from 'supertest';

import app from '../server.js';

it('returns show names', async () => {
	await request(app).get('/api/show-names')
		.expect(200)
		.expect('Content-Type', 'application/json; charset=utf-8')
		.expect(['Another One', 'Relative Show', 'Test Show']);
});