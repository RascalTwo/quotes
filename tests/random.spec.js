import request from 'supertest';
import assert from 'assert';

import app from '../server.js';

it('returns random quote', async () => {
	const seen = new Set();
	while (true) {
		const quote = await request(app).get('/api/random')
			.expect(200)
			.expect('Content-Type', 'application/json; charset=utf-8').then(r => r.body);
		seen.add(quote.text)
		if (seen.size === 2) return assert.deepEqual(seen, new Set(['Test Quote', 'Another One']));
	}
});