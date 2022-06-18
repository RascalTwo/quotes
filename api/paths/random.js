import { queryRandomQuote } from "../../controller.js";

export default function () {
	/** @type {import("express").RequestHandler} */
	function GET(_, response, next) {
		return queryRandomQuote()
			.then(quote => response.send(quote))
			.catch(next);
	}

	/** @type {import("express-openapi").OperationFunction['apiDoc']} */
	const apiDoc = {
		summary: 'Get a random quote',
		operationId: 'random',
		responses: {
			200: {
				description: 'A random quote',
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/Quote'
						}
					}
				}
			}
		}
	};
	GET.apiDoc = apiDoc;

	return { GET };
}