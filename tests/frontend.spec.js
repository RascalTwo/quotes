import assert from 'assert'
import fs from 'fs';
import path from 'path'
import { Server } from 'http';
import { chromium } from 'playwright';


import app from '../server.js';
import { setDatabaseData } from './setup.js';

describe('frontend', function(){
	before(() => setDatabaseData({
		medias: [
			{ _id: 'mid', title: 'Movie' },
			{ _id: 'tv1', title: 'Show', season: 1, episode: '1' },
			{ _id: 'tv2', title: 'Show', season: 1, episode: '2' },
			{ _id: 'tv22', title: 'Another Show', season: 1, episode: '2' },
		],
		quotes: [
			{ media: 'tv1', text: 'Episode1', timeStamp: 1.0 },
			{ media: 'tv2', text: 'First', timeStamp: 1.0 },
			{ media: 'tv2', text: 'Middle', timeStamp: 2.0 },
			{ media: 'tv2', text: 'Last', timeStamp: 3.0 },
			{ media: 'mid', text: 'Left', timeStamp: 1.0 },
			{ media: 'mid', text: 'Center', timeStamp: 2.0 },
			{ media: 'mid', text: 'Right', timeStamp: 3.0 },
		]
	}));

	/** @type {import('playwright').Browser | null} */
	let browser = null;
	/** @type {import('playwright').Page | null} */
	let page = null;
	/** @type {Server | null} */
	let server = null;
	beforeEach(async () => {
		browser = await chromium.launch();
		const context = await browser.newContext();
		page = await context.newPage();
		await page.coverage?.startJSCoverage();
		return new Promise(resolve => {
			server = app.listen(1337, resolve);
		})
	})

	afterEach(async () => {
		for (const entry of await page.coverage?.stopJSCoverage() || []){
			entry.url = path.resolve('public/' + entry.url.split('/').at(-1));
			await fs.promises.writeFile('coverage/tmp/coverage-' + Date.now() + '.json', JSON.stringify({ result: [entry] }));
		}
		if (browser) await browser.close()
		if (server) server.close()
	})

	it('page loads', async () => {
		await page.goto('http://localhost:1337/');
		assert.deepEqual(await page.title(), 'Media Quotes API');
	});

	const search = (queryParams) => page.goto('http://localhost:1337/search?' + queryParams);

	describe('API URL', () => {
		it('API url is absolute', async () => {
			await page.goto('http://localhost:1337/');
			const url = await page.evaluate(() => document.querySelector('code a').textContent);
			assert.deepEqual(url, 'http://localhost:1337/api/search');
		});

		it('API url updates accordingly', async () => {
			await search('query=abcdef');
			const url = await page.evaluate(() => document.querySelector('code a').textContent);
			assert.deepEqual(url, 'http://localhost:1337/api/search?query=abcdef');
		})
	})

	describe('relative quotes', () => {
		it('previous is shown', async () => {
			await search('query=Middle');
			await page.click('.previous-button');
			await page.waitForTimeout(500);
			assert(await page.locator('li', { hasText: 'First'}).isVisible())
			assert(await page.$eval(".previous-button", (el) => el === document.activeElement))
		})

		it('next is shown', async () => {
			await search('query=Middle');
			await page.click('.next-button');
			await page.waitForTimeout(500);
			assert(await page.locator('li', { hasText: 'Last'}).isVisible())
			assert(await page.evaluate(() => document.querySelectorAll(".next-button")[1] === document.activeElement));
		})

		it('quote has no previous', async () => {
			await search('query=First');
			await page.click('.previous-button');
			assert(await page.locator('.previous-button').isDisabled())
		})

		it('quote has no next', async () => {
			await search('query=Last');
			await page.click('.next-button');
			assert(await page.locator('.next-button').isDisabled())
		})
	});

	describe('input datalists', () => {
		it('media titles are populated', async () => {
			await search('');
			assert.deepEqual(
				await page.$eval('#mediaTitles', datalist => [...datalist.children].map(child => child.textContent)),
				['Another Show', 'Movie', 'Show']
			);
		})

		it('season numbers are populated', async () => {
			await search('');

			const requestedURLs = []
			page.on('request', request => requestedURLs.push(request.url()))

			await page.fill('#mediaTitleInput', 'Show');
			await page.click('#seasonInput');
			await page.waitForTimeout(100);
			assert(requestedURLs.includes('http://localhost:1337/api/media-info?title=Show'), 'network request not made')
			requestedURLs.splice(requestedURLs.indexOf('http://localhost:1337/api/media-info?title=Show'), 1)
			assert.deepEqual(
				await page.$eval('#seasonList', datalist => [...datalist.children].map(child => child.textContent)),
				['1']
			);
			await page.fill('#mediaTitleInput', 'does not exist');
			await page.click('#seasonInput');
			await page.waitForTimeout(100);
			assert(requestedURLs.includes('http://localhost:1337/api/media-info?title=does%20not%20exist'), 'network request not made')
			requestedURLs.splice(requestedURLs.indexOf('http://localhost:1337/api/media-info?title=does%20not%20exist'), 1)
			assert.deepEqual(
				await page.$eval('#seasonList', datalist => [...datalist.children].map(child => child.textContent)),
				[]
			);
			await page.fill('#mediaTitleInput', 'Show');
			await page.click('#seasonInput');
			await page.waitForTimeout(100);
			assert(!requestedURLs.includes('http://localhost:1337/api/media-info?title=Show'), 'network request not cached')
			assert.deepEqual(
				await page.$eval('#seasonList', datalist => [...datalist.children].map(child => child.textContent)),
				['1']
			);
		})

		it('episode numbers are populated', async () => {
			await search('');
			await page.type('#mediaTitleInput', 'Show');
			await page.click('#seasonInput');
			await page.type('#seasonInput', '1');
			await page.click('#episodesInput');
			assert.deepEqual(
				await page.$eval('#episodesList', datalist => [...datalist.children].map(child => child.textContent)),
				['1', '2']
			);
		})
	});
})