import { queryDBForQuote } from "../../controller.js";


export default function () {
	/** @type {import("express").RequestHandler} */
	function GET({ query: { query, show, season, episodes, page, perPage, includeCounts } }, response, next) {
		return queryDBForQuote(query, show, season, episodes, page, perPage, includeCounts)
			.then((payload) => response.send(payload))
			.catch(next);
	}

	/** @type {import("express-openapi").OperationFunction['apiDoc']} */
	const apiDoc = {
		summary: 'Search for quotes',
		operationId: 'search',
		parameters: [
			{
				name: 'query',
				in: 'query',
				description: 'Search query',
				required: true,
				schema: {
					type: 'string'
				}
			},
			{
				name: 'show',
				in: 'query',
				description: 'Show name',
				schema: {
					$ref: '#/components/schemas/ShowName'
				}
			},
			{
				name: 'season',
				in: 'query',
				description: 'Season number',
				schema: {
					type: 'integer'
				}
			},
			{
				name: 'episodes',
				in: 'query',
				description: 'Episode numbers',
				schema: {
					type: 'string',
					pattern: String.raw`^\d+(-\d+)*$`
				}
			},
			{
				name: 'page',
				in: 'query',
				description: 'Page number',
				schema: {
					type: 'integer',
					minimum: 1,
					default: 1
				}
			},
			{
				name: 'perPage',
				in: 'query',
				description: 'Number of quotes per page',
				schema: {
					type: 'integer',
					minimum: 1,
					default: 100
				}
			},
			{
				name: 'includeCounts',
				in: 'query',
				description: 'Include total and page counts',
				schema: {
					type: 'boolean',
					default: false
				}
			}
		],
		responses: {
			200: {
				description: 'Quote Query information',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['quotes'],
							properties: {
								quotes: {
									description: 'Found Quotes',
									type: 'array',
									items: {
										$ref: '#/components/schemas/Quote'
									}
								},
								counts: {
									type: 'object',
									properties: {
										total: {
											description: 'Total number of quotes',
											type: 'integer',
											minimum: 0,
										},
										page: {
											description: 'Number of pages of quotes',
											type: 'integer',
											minimum: 1
										}
									}
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