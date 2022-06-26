import assert from 'assert'
import fs from 'fs';
import path from 'path'
import { Server } from 'http';
import { chromium } from 'playwright';


import app from '../server.js';

describe('frontend', function(){

	/** @type {import('playwright').Browser | null} */
	let browser = null;
	/** @type {import('playwright').Page | null} */
	let page = null;
	/** @type {Server | null} */
	let server = null;
	beforeEach(async () => {
		browser = await chromium.launch({ headless: !!process.env.CI });
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
		assert.deepEqual(await page.title(), 'Quotes Search API');
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
			assert(await page.locator('li', { hasText: 'First'}).isVisible())
		})

		it('next is shown', async () => {
			await search('query=Middle');
			await page.click('.next-button');
			assert(await page.locator('li', { hasText: 'Last'}).isVisible())
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
})