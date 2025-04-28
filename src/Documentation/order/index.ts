import { responses } from "../responses";

const get_orders = {
	orders: {
		tags: ["Order"],
		security: [
			{
				bearerAuth: [],
			},
		],
		summary: "get all your orders",
		consumes: ["application/json"],
		responses,
	},
};

const get_single_order = {
	get_order: {
		tags: ["Order"],
		security: [
			{
				bearerAuth: [],
			},
		],
		summary: "get a single order",
		parameters: [
			{
				in: "path",
				name: "id",
				required: true,
				schema: {
					type: "string",
					example: "9e555bd6-0f36-454a-a3d5-89edef4ff9d4",
				},
			},
		],
		consumes: ["application/json"],
		responses,
	},
};

export const orders = {
	"/api/v1/orders": {
		get: get_orders["orders"],
	},
	"/api/v1/orders/{id}": {
		get: get_single_order["get_order"],
	},
};
