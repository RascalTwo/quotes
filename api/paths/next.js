import { queryNextQuote } from "../../controller.js";

export default function () {
	/** @type {import("express").RequestHandler} */
	function GET({ query: { title, season, episode, timeStamp } }, response, next) {
		return queryNextQuote({ media: { title, season, episode }, timeStamp })
			.then(quote => response.send({ quote }))
			.catch(next);
	}

	/** @type {import("express-openapi").OperationFunction['apiDoc']} */
	const apiDoc = {
		summary: 'Gets next quote',
		operationId: 'nextQuote',
		parameters: [
			{
				name: 'title',
				in: 'query',
				description: 'Media title',
				required: true,
				schema: {
					$ref: '#/components/schemas/MediaTitle'
				}
			},
			{
				name: 'season',
				in: 'query',
				description: 'Season number',
				schema: {
					type: 'integer',
					example: 3
				}
			},
			{
				name: 'episode',
				in: 'query',
				description: 'Episode number',
				schema: {
					$ref: '#/components/schemas/EpisodeNumber'
				}
			},
			{
				name: 'timeStamp',
				in: 'query',
				description: 'Time stamp in seconds',
				required: true,
				schema: {
					type: 'number',
					example: 54.67
				}
			}
		],
		responses: {
			200: {
				description: 'Next Quote',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							properties: {
								quote: {
									nullable: true,
									allOf: [
										{ $ref: '#/components/schemas/Quote' }
									]
								}
							}
						}
					}
				}
			}
		}
	};
	GET.apiDoc = apiDoc;

	return { GET };
}