import request from 'supertest';

import app from '../server.js';
import { setDatabaseData } from './setup.js';

describe('/api/search', () => {
	before(() => setDatabaseData({
		quotes: [
			{ media: 'mid', text: 'Echo', timeStamp: 1.0 },
			{ media: 'tv1', text: 'Hello, World!', timeStamp: 2.0 },
			{ media: 'tv1', text: 'T', timeStamp: 1.0 },
			{ media: 'tv2', text: 'T', timeStamp: 2.0 },
			{ media: 'tv22', text: 'T', timeStamp: 22.0 },
		],
		medias: [
			{ _id: 'mid', title: 'Movie' },
			{ _id: 'tv1', title: 'Show', season: 1, episode: '1' },
			{ _id: 'tv2', title: 'Show', season: 1, episode: '2' },
			{ _id: 'tv22', title: 'Show', season: 2, episode: '1' },
		]
	}));
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
						media: { title: 'Movie' },
						text: 'Echo',
						timeStamp: 1
					},
					{
						media: { title: 'Show', season: 1, episode: '1' },
						text: 'Hello, World!',
						timeStamp: 2.0
					}
				]
			});
	});
	it('large query', async () => {
		await request(app).get('/api/search?query=echo')
			.expect(200)
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect({
				quotes: [
					{
						media: { title: 'Movie' },
						text: 'Echo',
						timeStamp: 1
					},
				]
			});
	});
	it('title', async () => {
		await request(app).get('/api/search?query=e&title=o')
			.expect(200)
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect({
				quotes: [
					{
						media: { title: 'Movie' },
						text: 'Echo',
						timeStamp: 1
					},
					{
						media: { title: 'Show', season: 1, episode: '1' },
						text: 'Hello, World!',
						timeStamp: 2.0
					}
				]
			});
	});
	it('season', async () => {
		await request(app).get('/api/search?query=t&season=1')
			.expect(200)
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect({
				quotes: [
					{
						media: { title: 'Show', season: 1, episode: '1' },
						text: 'T',
						timeStamp: 1
					},
					{
						media: { title: 'Show', season: 1, episode: '2' },
						text: 'T',
						timeStamp: 2
					},
				]
			});
	});
	it('episode', async () => {
		await request(app).get('/api/search?query=t&episode=1')
			.expect(200)
			.expect('Content-Type', 'application/json; charset=utf-8')
			.expect({
				quotes: [
					{
						media: { title: 'Show', season: 1, episode: '1' },
						text: 'T',
						timeStamp: 1
					},
					{
						media: { title: 'Show', season: 2, episode: '1' },
						text: 'T',
						timeStamp: 22
					},
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
						media: { title: 'Movie' },
						text: 'Echo',
						timeStamp: 1
					},
					{
						media: { title: 'Show', season: 1, episode: '1' },
						text: 'Hello, World!',
						timeStamp: 2.0
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
						media: { title: 'Movie' },
						text: 'Echo',
						timeStamp: 1
					}
				],
				counts: {
					total: 2,
					page: 2
				}
			});
	});
})