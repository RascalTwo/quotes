import cors from 'cors';

import type { ExpressOpenAPIArgs } from 'express-openapi';

export default function buildAPIDoc(titles: string[]): ExpressOpenAPIArgs['apiDoc'] {
	return {
		openapi: '3.0.0',
		info: {
			title: 'TV Show Quotes API',
			version: '1.0.0',
			description: 'Get quotes for media'
		},
		servers: [
			{
				url: 'https://r2-quotes.herokuapp.com/api',
				description: 'Production server',
			},
			{
				url: 'http://localhost:1337/api',
				description: 'Local server',
			}
		],
		components: {
			schemas: {
				MediaTitle: {
					type: 'string',
					enum: titles
				},
				EpisodeNumber: {
					type: 'string',
					pattern: String.raw`^\d+(-\d+)?$`
				},
				Media: {
					type: 'object',
					required: ['title'],
					properties: {
						_id: {
							type: 'string',
							description: 'Unique identifier for the media'
						},
						title: {
							$ref: '#/components/schemas/MediaTitle'
						},
						season: {
							type: 'integer',
							minimum: 1,
						},
						episode: {
							$ref: '#/components/schemas/EpisodeNumber'
						}
					}
				},
				Quote: {
					description: 'A quote',
					type: 'object',
					required: ['timeStamp', 'text', 'media'],
					properties: {
						timeStamp: {
							type: 'number',
						},
						text: {
							type: 'string'
						},
						media: {
							$ref: '#/components/schemas/Media'
						},
					}
				}
			}
		},
		'x-express-openapi-additional-middleware': [cors()],
		paths: {}
	};
}