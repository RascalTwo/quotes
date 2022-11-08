import { queryRandomQuote } from "../../controller";

import type { OperationFunction } from "express-openapi";
import type { OpenAPIRequestHandler } from "../../types";

export default function () {
	const GET: OpenAPIRequestHandler = (_, response, next) => {
		return queryRandomQuote()
			.then(quote => response.send(quote))
			.catch(next);
	}

	const apiDoc: OperationFunction['apiDoc'] = {
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