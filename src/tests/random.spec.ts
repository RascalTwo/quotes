import request from 'supertest';
import assert from 'assert';

import app from '../server';
import { setDatabaseData } from './setup';

describe('random', () => {
	const texts = ['abc', 'def', 'ghi'];
	before(() => setDatabaseData({
		quotes: texts.map((text, i) => ({ text, media: 'mid', timeStamp: i })),
		medias: [{ _id: 'mid', title: 'Media Title' }]
	}));

	it('returns random quote', async () => {
		const seenTexts = new Set();
		const seenTimeStamps = new Set();
		while (true) {
			const quote = await request(app).get('/api/random')
				.expect(200)
				.expect('Content-Type', 'application/json; charset=utf-8').then(r => r.body);
			seenTexts.add(quote.text)
			seenTimeStamps.add(quote.timeStamp)
			if (seenTexts.size === 3 && seenTimeStamps.size === 3) {
				assert.deepEqual(seenTexts, new Set(texts));
				assert.deepEqual(seenTimeStamps, new Set(Object.keys(texts)));
				return
			}
		}
	});
})