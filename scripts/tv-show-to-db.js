import fs from 'fs';
import path from 'path';

import { replaceInDB, cleanupParsedSRTs } from './shared.js'

async function parseTVShowSRTs(directory, title) {
	const quotes = [];
	const medias = [];

	const absolute = path.resolve(directory)
	for (const entityName of await fs.promises.readdir(absolute)) {
		const entityAbsolute = path.join(absolute, entityName);
		if ((await fs.promises.stat(entityAbsolute)).isFile()) continue;

		const season = +entityName.match(/\d+/)[0]
		for (const srtFilename of await fs.promises.readdir(entityAbsolute)) {
			const episode = srtFilename.match(/E\d+/ig).map(e => +e.slice(1)).join('-');
			const srt = (await fs.promises.readFile(path.join(entityAbsolute, srtFilename))).toString();

			const media = { title, season, episode };
			medias.push(media);
			quotes.push(...cleanupParsedSRTs(srt, media));
		}
	}

	return { quotes, medias };
}

const [_, __, directory, showTitle] = process.argv;
if (!directory || !showTitle) {
	console.error('directory and show title required');
	process.exit(1);
}

parseTVShowSRTs(directory, showTitle)
	.then(({ quotes, medias }) => replaceInDB(showTitle, quotes, medias))
	.catch(console.error);
