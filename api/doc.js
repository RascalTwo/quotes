import cors from 'cors';

/**
 * @param {string[]} showNames
 * @returns {import("express-openapi").ExpressOpenAPIArgs['apiDoc']}
 */
export default function buildAPIDoc(showNames) {
	return {
		openapi: '3.0.0',
		info: {
			title: 'TV Show Quotes API',
			version: '1.0.0',
			description: 'Get quotes for TV shows'
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
				ShowName: {
					type: 'string',
					enum: showNames
				},
				Quote: {
					description: 'A quote',
					type: 'object',
					properties: {
						quote: {
							type: 'string'
						},
						show: {
							$ref: '#/components/schemas/ShowName'
						},
						season: {
							type: 'integer',
							minimum: 1,
						},
						episodes: {
							type: 'array',
							items: {
								type: 'integer',
								minimum: 1,
							}
						}
					}
				}
			}
		},
		'x-express-openapi-additional-middleware': [cors()],
		paths: {}
	};
}