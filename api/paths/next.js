import { queryNextQuote } from "../../controller.js";

export default function () {
	/** @type {import("express").RequestHandler} */
	function GET({ query: { show, season, episodes, timeStamp } }, response, next) {
		return queryNextQuote({ show, season, episodes, timeStamp })
			.then(quote => response.send({ quote }))
			.catch(next);
	}

	/** @type {import("express-openapi").OperationFunction['apiDoc']} */
	const apiDoc = {
		summary: 'Gets next quote',
		operationId: 'nextQuote',
		parameters: [
			{
				name: 'show',
				in: 'query',
				description: 'Show name',
				required: true,
				schema: {
					$ref: '#/components/schemas/ShowName'
				}
			},
			{
				name: 'season',
				in: 'query',
				description: 'Season number',
				required: true,
				schema: {
					type: 'integer',
					example: 3
				}
			},
			{
				name: 'episodes',
				in: 'query',
				description: 'Episode numbers',
				required: true,
				schema: {
					type: 'integer',
					minimum: 1,
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