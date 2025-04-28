import { responses } from "../responses";

const create_category = {
	tags: ["Category"],
	summary: "Adding new category",
	security: [
		{
			bearerAuth: [],
		},
	],
	requestBody: {
		required: true,
		content: {
			"application/json": {
				schema: {
					type: "object",
					properties: {
						name: {
							type: "string",
							description: "Category name",
							required: true,
							example: "Cars",
						},
						description: {
							type: "string",
							description: "Category description",
							required: true,
							example: "Cars are awesome",
						},
					},
				},
			},
		},
	},
	responses,
};

const read_categories = {
	all: {
		tags: ["Category"],
		summary: "Getting all categories",
		security: [
			{
				bearerAuth: [],
			},
		],
		responses,
	},
	single: {
		tags: ["Category"],
		summary: "Getting single category",
		security: [
			{
				bearerAuth: [],
			},
		],
		parameters: [
			{
				in: "path",
				name: "id",
				required: true,
				schema: {
					type: "string",
					format: "uuid",
				},
			},
		],
		responses,
	},
};

const update_category = {
	tags: ["Category"],
	summary: "Updating a category",
	security: [
		{
			bearerAuth: [],
		},
	],
	parameters: [
		{
			in: "path",
			name: "id",
			required: true,
			schema: {
				type: "string",
				format: "uuid",
			},
		},
	],
	requestBody: {
		required: true,
		content: {
			"application/json": {
				schema: {
					type: "object",
					properties: {
						name: {
							type: "string",
							description: "Category name",
							required: true,
							example: "Fancy Cars",
						},
						description: {
							type: "string",
							description: "Category brief description",
							required: true,
							example: "This cars are awesome",
						},
					},
				},
			},
		},
	},
	responses,
};

export const categories = {
	"/api/v1/categories": {
		post: create_category,
	},
	"/api/v1/categories/": {
		get: read_categories["all"],
	},
	"/api/v1/categories/{id}": {
		get: read_categories["single"],
	},
	"/api/v1/categories/{id}/": {
		patch: update_category,
	},
};
