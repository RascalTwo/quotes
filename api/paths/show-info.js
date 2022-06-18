import { queryShowInfo } from "../../controller.js";


export default function () {
	/** @type {import("express").RequestHandler} */
	function GET({ query: { show } }, response, next) {
		return queryShowInfo(show).then(showInfo => response.json(showInfo)).catch(next)
	}

	/** @type {import("express-openapi").OperationFunction['apiDoc']} */
	const apiDoc = {
		summary: 'Get season and episode numbers for a show',
		operationId: 'showInfo',
		parameters: [
			{
				name: 'show',
				in: 'query',
				description: 'Show name',
				required: true,
				schema: {
					$ref: '#/components/schemas/ShowName'
				}
			}
		],
		responses: {
			200: {
				description: 'Season to episode numbers',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							description: 'Season to episode numbers mapping',
							additionalProperties: {
								description: 'Episode numbers',
								type: 'array',
								items: {
									type: 'string',
									pattern: String.raw`^\d+(-\d+)*$`
								}
							}
						},
						example: {
							1: ['1', '2', '3', '4', '5'],
							2: ['1-2', '3', '4-5'],
							3: ['1-2-3-4-5']
						}
					}
				}
			}
		}
	};
	GET.apiDoc = apiDoc;

	return { GET };
}