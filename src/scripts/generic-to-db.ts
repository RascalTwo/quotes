import fs from 'fs';

import { replaceInDB, cleanupParsedSRTs } from './shared'

async function parseMovieSRT(srtFilepath: string, title: string) {
	const media = { title };

	const srt = (await fs.promises.readFile(srtFilepath)).toString();
	const quotes = cleanupParsedSRTs(srt, media);

	return { quotes, media };
}

const [_, __, srtFilepath, title] = process.argv;
if (!srtFilepath || !title) {
	console.error('directory and title required');
	process.exit(1);
}

parseMovieSRT(srtFilepath, title)
	.then(({ quotes, media }) => replaceInDB(title, quotes, [media]))
	.catch(console.error);
