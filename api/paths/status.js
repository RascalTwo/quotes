export default function (DEPLOY_INFO) {
	/** @type {import("express").RequestHandler} */
	function GET(_, response) {
		return response.json({ now: new Date().toISOString(), deployed: DEPLOY_INFO });
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