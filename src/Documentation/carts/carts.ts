import { responses } from "../responses";

const cart_routes = {
	create_cart: {
		tags: ["Cart"],
		security: [
			{
				bearerAuth: [],
			},
		],
		summary: "Create user Cart",
		requestBody: {
			required: true,
			content: {
				"application/json": {
					schema: {
						type: "object",
						properties: {
							productId: {
								type: "string",
								example: "9e555bd6-0f36-454a-a3d5-89edef4ff9d4",
							},
							quantity: {
								type: "integer",
								example: 10,
							},
						},
					},
				},
			},
		},
		responses,
	},
	get_cart: {
		tags: ["Cart"],
		security: [
			{
				bearerAuth: [],
			},
		],
		summary: "Get Cart",
		consumes: ["application/json"],
		responses,
	},
	clear_cart: {
		tags: ["Cart"],
		security: [
			{
				bearerAuth: [],
			},
		],
		summary: "clear Cart",
		consumes: ["application/json"],
		responses,
	},
	update_cart: {
		tags: ["Cart"],
		security: [
			{
				bearerAuth: [],
			},
		],
		summary: "Update cart",
		requestBody: {
			required: true,
			content: {
				"application/json": {
					schema: {
						type: "object",
						properties: {
							productId: {
								type: "string",
								example: "9e555bd6-0f36-454a-a3d5-89edef4ff9d4",
							},
						},
					},
				},
			},
		},
		responses,
	},
};

export const cartsDocRoutes = {
	"/api/v1/carts/": {
		post: cart_routes["create_cart"],
		get: cart_routes["get_cart"],
		put: cart_routes["clear_cart"],
		patch: cart_routes["update_cart"],
	},
};
