import { queryDBForQuote } from "../../controller";

import type { OperationFunction } from "express-openapi";
import type { OpenAPIRequestHandler } from "../../types";


export default function () {
	const GET: OpenAPIRequestHandler = ({ query: { query, title, season, episode, page, perPage, includeCounts } }, response, next) => {
		// @ts-ignore
		return queryDBForQuote(query, title, season, episode, page, perPage, includeCounts)
			.then((payload) => response.send(payload))
			.catch(next);
	}

	const apiDoc: OperationFunction['apiDoc'] = {
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
				name: 'title',
				in: 'query',
				description: 'Media title',
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
									required: ['total', 'page'],
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