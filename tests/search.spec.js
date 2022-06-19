import request from 'supertest';

import app from '../server.js';

describe('/api/search', () => {
	it('returns error for missing query', async () => {
		await request(app).get('/api/search')
			.expect(400)
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect([{
				path: "query",
				errorCode: "required.openapi.requestValidation",
				message: "must have required property 'query'",
				location: "query"
			}]);
	});
	it('short query', async () => {
		await request(app).get('/api/search?query=e')
			.expect(200)
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect({
				quotes: [
					{
						show: 'Another One',
						text: 'Another One',
						season: 2,
						episodes: [1],
						timeStamp: 54.67
					},
					{
						show: 'Test Show',
						text: 'Test Quote',
						season: 1,
						episodes: [1, 2],
						timeStamp: 54.18
					}
				]
			});
	});
	it('large query', async () => {
		await request(app).get('/api/search?query=test')
			.expect(200)
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect({
				quotes: [
					{
						show: 'Test Show',
						text: 'Test Quote',
						season: 1,
						episodes: [1, 2],
						timeStamp: 54.18
					}
				]
			});
	});
	it('show', async () => {
		await request(app).get('/api/search?query=e&show=Test Show')
			.expect(200)
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect({
				quotes: [
					{
						show: 'Test Show',
						text: 'Test Quote',
						season: 1,
						episodes: [1, 2],
						timeStamp: 54.18
					}
				]
			});
	});
	it('season', async () => {
		await request(app).get('/api/search?query=e&season=1')
			.expect(200)
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect({
				quotes: [
					{
						show: 'Test Show',
						text: 'Test Quote',
						season: 1,
						episodes: [1, 2],
						timeStamp: 54.18
					}
				]
			});
	});
	it('episodes', async () => {
		await request(app).get('/api/search?query=e&episodes=2')
			.expect(200)
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect({
				quotes: [
					{
						show: 'Test Show',
						text: 'Test Quote',
						season: 1,
						episodes: [1, 2],
						timeStamp: 54.18
					}
				]
			});
	});
	it('includeCounts', async () => {
		await request(app).get('/api/search?query=e&includeCounts=true')
			.expect(200)
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect({
				quotes: [
					{
						show: 'Another One',
						text: 'Another One',
						season: 2,
						episodes: [1],
						timeStamp: 54.67
					},
					{
						show: 'Test Show',
						text: 'Test Quote',
						season: 1,
						episodes: [1, 2],
						timeStamp: 54.18
					}
				],
				counts: {
					total: 2,
					page: 1
				}
			});
	});
	it('perPage', async () => {
		await request(app).get('/api/search?query=e&includeCounts=true&perPage=1')
			.expect(200)
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect({
				quotes: [
					{
						show: 'Another One',
						text: 'Another One',
						season: 2,
						episodes: [1],
						timeStamp: 54.67
					},
				],
				counts: {
					total: 2,
					page: 2
				}
			});
	});
})