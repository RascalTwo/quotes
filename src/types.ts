import type { RequestHandler } from "express";
import type { OperationFunction } from "express-openapi";

export interface OpenAPIRequestHandler extends RequestHandler {
	apiDoc?: OperationFunction['apiDoc'];
}