import { queryCounts } from "../../controller.js";

export default function (DEPLOY_INFO) {
	/** @type {import("express").RequestHandler} */
	function GET(_, response, next) {
		return queryCounts().then(({ medias, quotes }) => response.json({
			now: new Date(),
			deployed: DEPLOY_INFO,
			medias, quotes
		})).catch(next);
	}

	/** @type {import("express-openapi").OperationFunction['apiDoc']} */
	const apiDoc = {
		summary: 'Check the API status',
		operationId: 'status',
		responses: {
			200: {
				description: 'API status',
				content: {
					'application/json': {
						schema: {
							type: 'object',
							description: 'API status',
							properties: {
								now: {
									type: 'string',
									description: 'Current time'
								},
								deployed: {
									type: 'string',
									description: 'Deployed information'
								},
								medias: {
									type: 'integer',
									description: 'Number of Media entities'
								},
								quotes: {
									type: 'integer',
									description: 'Number of Quotes'
								},
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