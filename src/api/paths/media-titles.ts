import type { OperationFunction } from "express-openapi";
import type { OpenAPIRequestHandler } from "../../types";


export default function (titles: string[]) {
	const GET: OpenAPIRequestHandler = (_, response) => {
		return response.send(titles);
	}

	const apiDoc: OperationFunction['apiDoc'] = {
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