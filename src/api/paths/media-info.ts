import { queryMediaInfo } from "../../controller";

import type { OperationFunction } from "express-openapi";
import type { OpenAPIRequestHandler } from "../../types";


export default function () {
	const GET: OpenAPIRequestHandler = ({ query: { title } }, response, next) => {
		// @ts-ignore
		return queryMediaInfo(title).then(mediaInfo => response.json(mediaInfo)).catch(next)
	}

	const apiDoc: OperationFunction['apiDoc'] = {
		summary: 'Get information on media',
		operationId: 'mediaInfo',
		parameters: [
			{
				name: 'title',
				in: 'query',
				required: true,
				schema: {
					$ref: '#/components/schemas/MediaTitle'
				}
			}
		],
		responses: {
			200: {
				description: 'Media Info',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							required: ['title'],
							properties: {
								title: {
									$ref: '#/components/schemas/MediaTitle'
								},
								seasons: {
									type: 'object',
									description: 'Season to episode numbers mapping',
									additionalProperties: {
										description: 'Episode numbers',
										type: 'array',
										items: {
											$ref: '#/components/schemas/EpisodeNumber'
										}
									}
								}
							}
						},
						examples: {
							tvShow: {
								value: {
									title: 'TV Show',
									seasons: {
										1: ['1', '2', '3', '4', '5'],
										2: ['1-2', '3', '4-5'],
									}
								}
							},
							movie: {
								value: {
									title: 'Movie'
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