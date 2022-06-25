/**
 * @param {string[]} showNames
 */
export default function (showNames) {
	/** @type {import("express").RequestHandler} */
	function GET(_, response) {
		return response.send(showNames);
	}

	/** @type {import("express-openapi").OperationFunction['apiDoc']} */
	const apiDoc = {
		summary: 'Get all show names',
		operationId: 'showNames',
		responses: {
			200: {
				description: 'Show names',
				content: {
					'application/json': {
						schema: {
							type: 'array',
							example: showNames,
							items: {
								$ref: '#/components/schemas/ShowName'
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