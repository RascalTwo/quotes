/**
 * @param {string[]} titles
 */
export default function (titles) {
	/** @type {import("express").RequestHandler} */
	function GET(_, response) {
		return response.send(titles);
	}

	/** @type {import("express-openapi").OperationFunction['apiDoc']} */
	const apiDoc = {
		summary: 'Get all media titles',
		operationId: 'titles',
		responses: {
			200: {
				description: 'Media titles',
				content: {
					'application/json': {
						schema: {
							type: 'array',
							example: titles,
							items: {
								$ref: '#/components/schemas/MediaTitle'
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